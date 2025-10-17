// Reference: javascript_database blueprint integration - DatabaseStorage pattern
import { eq, and, like, desc, asc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, categories, products, favorites, ratings, cartItems, pickupSlots, orders, orderItems,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Favorite,
  type Rating, type InsertRating,
  type CartItem, type InsertCartItem,
  type PickupSlot, type InsertPickupSlot,
  type Order, type InsertOrder,
  type OrderItem,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(filters?: {
    search?: string;
    categoryId?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ results: Product[]; count: number }>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductSuggestions(query: string): Promise<{ id: string; name: string; thumbUrl: string }[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductRating(productId: string): Promise<void>;

  // Favorites
  getUserFavorites(userId: string): Promise<(Favorite & { product: Product })[]>;
  addFavorite(userId: string, productId: string): Promise<Favorite>;
  removeFavorite(userId: string, productId: string): Promise<void>;

  // Ratings
  getProductRatings(productId: string, page?: number): Promise<{ results: (Rating & { user: Pick<User, 'id' | 'username'> })[], count: number }>;
  createRating(userId: string, rating: InsertRating): Promise<Rating>;

  // Cart
  getUserCart(userId: string): Promise<(CartItem & { product: Product })[]>;
  getSessionCart(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;

  // Pickup Slots
  getPickupSlots(date?: string): Promise<PickupSlot[]>;
  getPickupSlotById(id: string): Promise<PickupSlot | undefined>;
  createPickupSlot(slot: InsertPickupSlot): Promise<PickupSlot>;
  updateSlotCapacity(id: string, remaining: number): Promise<void>;

  // Orders
  getOrders(userId?: string): Promise<Order[]>;
  getOrderById(id: string): Promise<(Order & { items: OrderItem[], pickupSlot: PickupSlot }) | undefined>;
  createOrder(order: InsertOrder, items: Omit<OrderItem, 'id' | 'orderId'>[]): Promise<Order>;
  updateOrderStatus(id: string, status: string, codes?: { tempPickupCode?: string; finalPickupCode?: string }): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  // Products
  async getProducts(filters: {
    search?: string;
    categoryId?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ results: Product[]; count: number }> {
    const { search, categoryId, sort = 'newest', page = 1, pageSize = 20 } = filters;
    let query = db.select().from(products).where(eq(products.isActive, true)).$dynamic();

    if (search) {
      query = query.where(like(products.name, `%${search}%`));
    }

    if (categoryId) {
      query = query.where(eq(products.categoryId, categoryId));
    }

    // Sorting
    if (sort === 'price_asc') {
      query = query.orderBy(asc(products.price));
    } else if (sort === 'price_desc') {
      query = query.orderBy(desc(products.price));
    } else if (sort === 'popular') {
      query = query.orderBy(desc(products.ratingCount));
    } else {
      query = query.orderBy(desc(products.createdAt));
    }

    const results = await query.limit(pageSize).offset((page - 1) * pageSize);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true));

    return { results, count: Number(count) };
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductSuggestions(query: string): Promise<{ id: string; name: string; thumbUrl: string }[]> {
    const results = await db
      .select({
        id: products.id,
        name: products.name,
        images: products.images,
      })
      .from(products)
      .where(and(
        eq(products.isActive, true),
        like(products.name, `%${query}%`)
      ))
      .limit(5);

    return results.map(p => ({
      id: p.id,
      name: p.name,
      thumbUrl: (p.images as string[])[0] || "",
    }));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProductRating(productId: string): Promise<void> {
    const result = await db
      .select({
        avg: sql<number>`COALESCE(AVG(${ratings.rating}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(ratings)
      .where(eq(ratings.productId, productId));

    if (result[0]) {
      await db
        .update(products)
        .set({
          ratingAverage: result[0].avg.toFixed(2),
          ratingCount: Number(result[0].count),
        })
        .where(eq(products.id, productId));
    }
  }

  // Favorites
  async getUserFavorites(userId: string): Promise<(Favorite & { product: Product })[]> {
    return await db
      .select()
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, userId))
      .then(rows => rows.map(row => ({ ...row.favorites, product: row.products })));
  }

  async addFavorite(userId: string, productId: string): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({ userId, productId })
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, productId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.productId, productId)
      ));
  }

  // Ratings
  async getProductRatings(productId: string, page: number = 1): Promise<{ results: (Rating & { user: Pick<User, 'id' | 'username'> })[], count: number }> {
    const pageSize = 10;
    const results = await db
      .select({
        rating: ratings,
        user: { id: users.id, username: users.username },
      })
      .from(ratings)
      .innerJoin(users, eq(ratings.userId, users.id))
      .where(eq(ratings.productId, productId))
      .orderBy(desc(ratings.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ratings)
      .where(eq(ratings.productId, productId));

    return {
      results: results.map(r => ({ ...r.rating, user: r.user })),
      count: Number(count),
    };
  }

  async createRating(userId: string, rating: InsertRating): Promise<Rating> {
    const [created] = await db
      .insert(ratings)
      .values({ ...rating, userId })
      .returning();

    // Update product rating
    await this.updateProductRating(rating.productId);

    return created;
  }

  // Cart
  async getUserCart(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .then(rows => rows.map(row => ({ ...row.cart_items, product: row.products })));
  }

  async getSessionCart(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId))
      .then(rows => rows.map(row => ({ ...row.cart_items, product: row.products })));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db.insert(cartItems).values(item).returning();
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated || undefined;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  // Pickup Slots
  async getPickupSlots(date?: string): Promise<PickupSlot[]> {
    let query = db.select().from(pickupSlots).where(eq(pickupSlots.isActive, true)).$dynamic();

    if (date) {
      query = query.where(eq(pickupSlots.date, date));
    }

    return await query.orderBy(asc(pickupSlots.date), asc(pickupSlots.timeFrom));
  }

  async getPickupSlotById(id: string): Promise<PickupSlot | undefined> {
    const [slot] = await db.select().from(pickupSlots).where(eq(pickupSlots.id, id));
    return slot || undefined;
  }

  async createPickupSlot(slot: InsertPickupSlot): Promise<PickupSlot> {
    const [created] = await db.insert(pickupSlots).values(slot).returning();
    return created;
  }

  async updateSlotCapacity(id: string, remaining: number): Promise<void> {
    await db.update(pickupSlots).set({ remaining }).where(eq(pickupSlots.id, id));
  }

  // Orders
  async getOrders(userId?: string): Promise<Order[]> {
    let query = db.select().from(orders).$dynamic();

    if (userId) {
      query = query.where(eq(orders.userId, userId));
    }

    return await query.orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: string): Promise<(Order & { items: OrderItem[], pickupSlot: PickupSlot }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));

    if (!order) return undefined;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    const [pickupSlot] = await db.select().from(pickupSlots).where(eq(pickupSlots.id, order.pickupSlotId));

    return { ...order, items, pickupSlot };
  }

  async createOrder(order: InsertOrder, items: Omit<OrderItem, 'id' | 'orderId'>[]): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();

    await db.insert(orderItems).values(
      items.map(item => ({ ...item, orderId: created.id }))
    );

    return created;
  }

  async updateOrderStatus(id: string, status: string, codes?: { tempPickupCode?: string; finalPickupCode?: string }): Promise<void> {
    const updateData: any = { status };
    if (codes?.tempPickupCode) updateData.tempPickupCode = codes.tempPickupCode;
    if (codes?.finalPickupCode) updateData.finalPickupCode = codes.finalPickupCode;

    await db.update(orders).set(updateData).where(eq(orders.id, id));
  }
}

export const storage = new DatabaseStorage();
