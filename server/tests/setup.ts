import express from "express";
import { registerRoutes } from "../routes";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | null = null;

export async function startTestMongo() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.MONGODB_DB_NAME = "giantcasino";
  return uri;
}

export async function stopTestMongo() {
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

export async function createTestApp() {
  const app = express();
  app.use(express.json());
  await registerRoutes(app);
  return app;
}
