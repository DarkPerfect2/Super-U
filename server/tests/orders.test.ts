import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createTestApp, startTestMongo, stopTestMongo } from "./setup";
import { connectDatabase, getCollections } from "../db";

describe("Orders API", () => {
  let app: any;
  let productId: string;
  let slotId: string;
  let orderId: string;
  let access: string;

  beforeAll(async () => {
    await startTestMongo();
    await connectDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await stopTestMongo();
  });

  beforeEach(async () => {
    const { users, orders, orderItems, products, categories, pickupSlots } = await getCollections();
    await Promise.all([
      users.deleteMany({}),
      orders.deleteMany({}),
      orderItems.deleteMany({}),
      products.deleteMany({}),
      categories.deleteMany({}),
      pickupSlots.deleteMany({}),
    ]);

    const cat = await categories.insertOne({ name: "Boissons", slug: "boissons", description: "", imageUrl: "", productCount: 0 });
    const prodRes = await products.insertOne({ sku: "D1", name: "Eau 1L", description: "", price: "500", images: [], stock: 100, categoryId: cat.insertedId.toString(), isActive: true, isPerishable: false, ratingAverage: 0, ratingCount: 0, createdAt: new Date().toISOString() } as any);
    productId = prodRes.insertedId.toString();

    const slotRes = await pickupSlots.insertOne({ date: new Date().toISOString().split('T')[0], timeFrom: "10:00", timeTo: "12:00", capacity: 20, remaining: 20, isActive: true } as any);
    slotId = slotRes.insertedId.toString();

    await request(app).post("/api/auth/register").send({ username: "alice", email: "alice@example.com", password: "password123" });
    const loginRes = await request(app).post("/api/auth/login").send({ emailOrUsername: "alice@example.com", password: "password123" });
    access = loginRes.body.access;
  });

  it("POST /api/orders creates a valid order and computes totals", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${access}`)
      .send({
        customerName: "Alice",
        customerPhone: "+242061234567",
        customerEmail: "alice@example.com",
        pickupSlotId: slotId,
        items: [{ productId, quantity: 3 }],
        paymentMethod: "momo",
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.items.length).toBe(1);
    expect(parseFloat(res.body.amount)).toBe(1500);
    orderId = res.body.id;
  });

  it("GET /api/orders and GET /api/orders/:id return data", async () => {
    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${access}`)
      .send({
        customerName: "Bob",
        customerPhone: "+242061234568",
        pickupSlotId: slotId,
        items: [{ productId, quantity: 2 }],
        paymentMethod: "card",
      });
    const id = createRes.body.id;

    const listRes = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${access}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    const getRes = await request(app).get(`/api/orders/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.items).toBeDefined();
    expect(getRes.body.pickupSlot).toBeDefined();
  });

  (process.env.GMAIL_USER ? it : it.skip)("POST /api/orders/:id/resend-confirmation returns 200 when email available", async () => {
    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${access}`)
      .send({
        customerName: "Charlie",
        customerPhone: "+242061234569",
        customerEmail: process.env.GMAIL_USER,
        pickupSlotId: slotId,
        items: [{ productId, quantity: 1 }],
        paymentMethod: "momo",
      });
    const id = createRes.body.id;

    const resendRes = await request(app)
      .post(`/api/orders/${id}/resend-confirmation`)
      .set("Authorization", `Bearer ${access}`);
    expect(resendRes.status).toBe(200);
  });
});
