import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createTestApp, startTestMongo, stopTestMongo } from "./setup";
import { connectDatabase, getCollections } from "../db";

describe("Products API", () => {
  let app: any;

  beforeAll(async () => {
    await startTestMongo();
    await connectDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await stopTestMongo();
  });

  beforeEach(async () => {
    const { products, categories } = await getCollections();
    await products.deleteMany({});
    await categories.deleteMany({});

    const cat = await categories.insertOne({ name: "Fruits", slug: "fruits", description: "", imageUrl: "", productCount: 0 });

    await products.insertMany([
      { sku: "A1", name: "Banane", description: "", price: "1000", images: [], stock: 100, categoryId: cat.insertedId.toString(), isActive: true, isPerishable: true, ratingAverage: 4.5, ratingCount: 10, createdAt: new Date(Date.now() - 2000).toISOString() },
      { sku: "A2", name: "Pomme", description: "", price: "1500", images: [], stock: 50, categoryId: cat.insertedId.toString(), isActive: true, isPerishable: true, ratingAverage: 4.7, ratingCount: 20, createdAt: new Date(Date.now() - 1000).toISOString() },
      { sku: "A3", name: "Ananas", description: "", price: "1200", images: [], stock: 30, categoryId: cat.insertedId.toString(), isActive: true, isPerishable: true, ratingAverage: 4.2, ratingCount: 5, createdAt: new Date(Date.now() - 3000).toISOString() },
    ] as any[]);
  });

  it("GET /api/products supports pagination and sorting", async () => {
    const res1 = await request(app).get("/api/products").query({ sort: "newest", page: 1, page_size: 2 });
    expect(res1.status).toBe(200);
    expect(res1.body.results.length).toBe(2);
    expect(res1.body.count).toBe(3);
    expect(res1.body.next).toBe("next");

    const res2 = await request(app).get("/api/products").query({ sort: "price_desc" });
    expect(res2.status).toBe(200);
    expect(res2.body.results[0].price >= res2.body.results[1].price).toBe(true);
  });

  it("GET /api/products/:id returns 404 when not found", async () => {
    const res = await request(app).get(`/api/products/000000000000000000000000`);
    expect(res.status).toBe(404);
  });

  it("GET /api/products/suggest returns suggestions by q", async () => {
    const res = await request(app).get("/api/products/suggest").query({ q: "an" });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
