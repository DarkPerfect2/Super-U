import { MongoClient, Db, Collection } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

const getDatabaseUrl = (): string => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set. Please configure MongoDB Atlas connection string in your .env file.');
  }
  return mongoUri;
};

export async function connectDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoUri = getDatabaseUrl();
  client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    db = client.db(process.env.MONGODB_DB_NAME || 'giantcasino');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function getDatabase(): Promise<Db> {
  if (!db) {
    await connectDatabase();
  }
  return db!;
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
