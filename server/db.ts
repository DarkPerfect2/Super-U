import { MongoClient, Db, Collection } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;
let mongoAvailable = false;

const getDatabaseUrl = (): string | null => {
  const mongoUri = process.env.MONGODB_URI;
  return mongoUri || null;
};

export async function connectDatabase(): Promise<Db | null> {
  if (db) {
    return db;
  }

  const mongoUri = getDatabaseUrl();
  if (!mongoUri) {
    console.warn('⚠️ MongoDB URI not configured. Database features will be disabled.');
    mongoAvailable = false;
    return null;
  }

  client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    db = client.db(process.env.MONGODB_DB_NAME || 'giantcasino');
    mongoAvailable = true;
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    mongoAvailable = false;
    return null;
  }
}

export async function getDatabase(): Promise<Db | null> {
  if (!db && mongoAvailable === false) {
    return null;
  }
  if (!db) {
    await connectDatabase();
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export async function getCollections() {
  const database = await getDatabase();
  if (!database) {
    throw new Error('MongoDB is not available. Please configure MONGODB_URI in .env');
  }
  return {
    users: database.collection('users'),
    categories: database.collection('categories'),
    products: database.collection('products'),
    favorites: database.collection('favorites'),
    ratings: database.collection('ratings'),
    cartItems: database.collection('cart_items'),
    pickupSlots: database.collection('pickup_slots'),
    orders: database.collection('orders'),
    orderItems: database.collection('order_items'),
  };
}

// For compatibility with old drizzle setup - this is a fallback
export const pool = null;
