import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createTestApp, startTestMongo, stopTestMongo } from "./setup";
import { connectDatabase, getCollections } from "../db";

describe("Favorites API", () => {
  let app: any;
  let productId: string;
  let access: string;
  let refresh: string;

  beforeAll(async () => {
    await startTestMongo();
    await connectDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await stopTestMongo();
  });

  beforeEach(async () => {
    const { users, favorites, products, categories } = await getCollections();
    await Promise.all([
      users.deleteMany({}),
      favorites.deleteMany({}),
      products.deleteMany({}),
      categories.deleteMany({}),
    ]);

    const cat = await categories.insertOne({ name: "Divers", slug: "divers", description: "", imageUrl: "", productCount: 0 });
    const prodRes = await products.insertOne({ sku: "P1", name: "Produit test", description: "", price: "999", images: [], stock: 10, categoryId: cat.insertedId.toString(), isActive: true, isPerishable: false, ratingAverage: 0, ratingCount: 0, createdAt: new Date().toISOString() } as any);
    productId = prodRes.insertedId.toString();

    await request(app).post("/api/auth/register").send({ username: "john", email: "john@example.com", password: "password123" });
    const loginRes = await request(app).post("/api/auth/login").send({ emailOrUsername: "john@example.com", password: "password123" });
    access = loginRes.body.access;
    refresh = loginRes.body.refresh;
  });

  it("POST then DELETE favorite, and GET list is enriched", async () => {
    const addRes = await request(app)
      .post(`/api/favorites/${productId}`)
      .set("Authorization", `Bearer ${access}`)
      .send();
    expect(addRes.status).toBe(201);

    const listRes = await request(app)
      .get("/api/favorites")
      .set("Authorization", `Bearer ${access}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body[0].product).toBeDefined();
    expect(listRes.body[0].product.id).toBe(productId);

    const delRes = await request(app)
      .delete(`/api/favorites/${productId}`)
      .set("Authorization", `Bearer ${access}`);
    expect(delRes.status).toBe(204);
  });
});
