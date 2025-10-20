import { ObjectId } from 'mongodb';
import { getCollections } from './db';
import type {
  User, InsertUser,
  Category, InsertCategory,
  Product, InsertProduct,
  Favorite,
  Rating, InsertRating,
  CartItem, InsertCartItem,
  PickupSlot, InsertPickupSlot,
  Order, InsertOrder,
  OrderItem,
} from '@shared/schema';

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
    const { users } = await getCollections();
    const user = await users.findOne({ _id: new ObjectId(id) });
    return user ? this.formatUser(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { users } = await getCollections();
    const user = await users.findOne({ username });
    return user ? this.formatUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { users } = await getCollections();
    const user = await users.findOne({ email });
    return user ? this.formatUser(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { users } = await getCollections();
    const doc = {
      ...insertUser,
      createdAt: new Date().toISOString(),
    };
    const result = await users.insertOne(doc as any);
    return this.formatUser({ _id: result.insertedId, ...doc });
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const { users } = await getCollections();
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    );
    return result.value ? this.formatUser(result.value) : undefined;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const { categories } = await getCollections();
    const cats = await categories.find({}).sort({ name: 1 }).toArray();
    return cats.map(c => this.formatCategory(c));
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const { categories } = await getCollections();
    const cat = await categories.findOne({ _id: new ObjectId(id) });
    return cat ? this.formatCategory(cat) : undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const { categories } = await getCollections();
    const cat = await categories.findOne({ slug });
    return cat ? this.formatCategory(cat) : undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const { categories, products } = await getCollections();
    const doc = {
      ...category,
      productCount: 0,
    };
    const result = await categories.insertOne(doc as any);
    return this.formatCategory({ _id: result.insertedId, ...doc });
  }

  // Products
  async getProducts(filters: {
    search?: string;
    categoryId?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ results: Product[]; count: number }> {
    const { products } = await getCollections();
    const { search, categoryId, sort = 'newest', page = 1, pageSize = 20 } = filters;

    const query: any = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    let sortObj: any = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortObj = { price: 1 };
    } else if (sort === 'price_desc') {
      sortObj = { price: -1 };
    } else if (sort === 'popular') {
      sortObj = { ratingCount: -1 };
    }

    const [results, count] = await Promise.all([
      products
        .find(query)
        .sort(sortObj)
        .limit(pageSize)
        .skip((page - 1) * pageSize)
        .toArray(),
      products.countDocuments(query),
    ]);

    return {
      results: results.map(p => this.formatProduct(p)),
      count,
    };
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const { products } = await getCollections();
    const product = await products.findOne({ _id: new ObjectId(id) });
    return product ? this.formatProduct(product) : undefined;
  }

  async getProductSuggestions(query: string): Promise<{ id: string; name: string; thumbUrl: string }[]> {
    const { products } = await getCollections();
    const results = await products
      .find({
        isActive: true,
        name: { $regex: query, $options: 'i' },
      })
      .limit(5)
      .toArray();

    return results.map(p => ({
      id: p._id.toString(),
      name: p.name,
      thumbUrl: (p.images && p.images.length > 0) ? p.images[0] : '',
    }));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const { products, categories } = await getCollections();
    const doc = {
      ...product,
      ratingAverage: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString(),
    };
    const result = await products.insertOne(doc as any);
    const formatted = this.formatProduct({ _id: result.insertedId, ...doc });

    // Update category product count
    if (product.categoryId) {
      await categories.updateOne(
        { _id: new ObjectId(product.categoryId) },
        { $inc: { productCount: 1 } }
      );
    }

    return formatted;
  }

  async updateProductRating(productId: string): Promise<void> {
    const { products, ratings } = await getCollections();

    const ratingDocs = await ratings
      .find({ productId })
      .toArray();

    const count = ratingDocs.length;
    const avg = count > 0
      ? ratingDocs.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;

    await products.updateOne(
      { _id: new ObjectId(productId) },
      {
        $set: {
          ratingAverage: parseFloat(avg.toFixed(2)),
          ratingCount: count,
        },
      }
    );
  }

  // Favorites
  async getUserFavorites(userId: string): Promise<(Favorite & { product: Product })[]> {
    const { favorites, products } = await getCollections();
    const favs = await favorites.find({ userId }).toArray();

    const results = await Promise.all(
      favs.map(async (fav) => {
        const product = await products.findOne({ _id: new ObjectId(fav.productId) });
        return {
          ...this.formatFavorite(fav),
          product: product ? this.formatProduct(product) : {} as Product,
        };
      })
    );

    return results;
  }

  async addFavorite(userId: string, productId: string): Promise<Favorite> {
    const { favorites } = await getCollections();
    const doc = {
      userId,
      productId,
      addedAt: new Date().toISOString(),
    };
    const result = await favorites.insertOne(doc as any);
    return this.formatFavorite({ _id: result.insertedId, ...doc });
  }

  async removeFavorite(userId: string, productId: string): Promise<void> {
    const { favorites } = await getCollections();
    await favorites.deleteOne({ userId, productId });
  }

  // Ratings
  async getProductRatings(productId: string, page: number = 1): Promise<{ results: (Rating & { user: Pick<User, 'id' | 'username'> })[], count: number }> {
    const { ratings, users } = await getCollections();
    const pageSize = 10;

    const [ratingDocs, count] = await Promise.all([
      ratings
        .find({ productId })
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip((page - 1) * pageSize)
        .toArray(),
      ratings.countDocuments({ productId }),
    ]);

    const results = await Promise.all(
      ratingDocs.map(async (r) => {
        const user = await users.findOne({ _id: new ObjectId(r.userId) });
        return {
          ...this.formatRating(r),
          user: user ? { id: user._id.toString(), username: user.username } : { id: '', username: 'Anonymous' },
        };
      })
    );

    return { results, count };
  }

  async createRating(userId: string, rating: InsertRating): Promise<Rating> {
    const { ratings } = await getCollections();
    const doc = {
      ...rating,
      userId,
      createdAt: new Date().toISOString(),
    };
    const result = await ratings.insertOne(doc as any);

    // Update product rating
    await this.updateProductRating(rating.productId);

    return this.formatRating({ _id: result.insertedId, ...doc });
  }

  // Cart
  async getUserCart(userId: string): Promise<(CartItem & { product: Product })[]> {
    const { cartItems, products } = await getCollections();
    const items = await cartItems.find({ userId }).toArray();

    const results = await Promise.all(
      items.map(async (item) => {
        const product = await products.findOne({ _id: new ObjectId(item.productId) });
        return {
          ...this.formatCartItem(item),
          product: product ? this.formatProduct(product) : {} as Product,
        };
      })
    );

    return results;
  }

  async getSessionCart(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const { cartItems, products } = await getCollections();
    const items = await cartItems.find({ sessionId }).toArray();

    const results = await Promise.all(
      items.map(async (item) => {
        const product = await products.findOne({ _id: new ObjectId(item.productId) });
        return {
          ...this.formatCartItem(item),
          product: product ? this.formatProduct(product) : {} as Product,
        };
      })
    );

    return results;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const { cartItems } = await getCollections();
    const doc = {
      ...item,
      createdAt: new Date().toISOString(),
    };
    const result = await cartItems.insertOne(doc as any);
    return this.formatCartItem({ _id: result.insertedId, ...doc });
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const { cartItems } = await getCollections();
    const result = await cartItems.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { quantity } },
      { returnDocument: 'after' }
    );
    return result.value ? this.formatCartItem(result.value) : undefined;
  }

  async removeFromCart(id: string): Promise<void> {
    const { cartItems } = await getCollections();
    await cartItems.deleteOne({ _id: new ObjectId(id) });
  }

  // Pickup Slots
  async getPickupSlots(date?: string): Promise<PickupSlot[]> {
    const { pickupSlots } = await getCollections();
    const query: any = { isActive: true };

    if (date) {
      query.date = date;
    }

    const slots = await pickupSlots.find(query).sort({ date: 1, timeFrom: 1 }).toArray();
    return slots.map(s => this.formatPickupSlot(s));
  }

  async getPickupSlotById(id: string): Promise<PickupSlot | undefined> {
    const { pickupSlots } = await getCollections();
    const slot = await pickupSlots.findOne({ _id: new ObjectId(id) });
    return slot ? this.formatPickupSlot(slot) : undefined;
  }

  async createPickupSlot(slot: InsertPickupSlot): Promise<PickupSlot> {
    const { pickupSlots } = await getCollections();
    const result = await pickupSlots.insertOne(slot as any);
    return this.formatPickupSlot({ _id: result.insertedId, ...slot });
  }

  async updateSlotCapacity(id: string, remaining: number): Promise<void> {
    const { pickupSlots } = await getCollections();
    await pickupSlots.updateOne(
      { _id: new ObjectId(id) },
      { $set: { remaining } }
    );
  }

  // Orders
  async getOrders(userId?: string): Promise<Order[]> {
    const { orders } = await getCollections();
    const query = userId ? { userId } : {};
    const docs = await orders.find(query).sort({ createdAt: -1 }).toArray();
    return docs.map(o => this.formatOrder(o));
  }

  async getOrderById(id: string): Promise<(Order & { items: OrderItem[], pickupSlot: PickupSlot }) | undefined> {
    const { orders, orderItems, pickupSlots } = await getCollections();
    const order = await orders.findOne({ _id: new ObjectId(id) });

    if (!order) return undefined;

    const [items, slot] = await Promise.all([
      orderItems.find({ orderId: id }).toArray(),
      pickupSlots.findOne({ _id: new ObjectId(order.pickupSlotId) }),
    ]);

    return {
      ...this.formatOrder(order),
      items: items.map(i => this.formatOrderItem(i)),
      pickupSlot: slot ? this.formatPickupSlot(slot) : {} as PickupSlot,
    };
  }

  async createOrder(order: InsertOrder, items: Omit<OrderItem, 'id' | 'orderId'>[]): Promise<Order> {
    const { orders, orderItems, pickupSlots } = await getCollections();

    const orderDoc = {
      ...order,
      createdAt: new Date().toISOString(),
    };

    const result = await orders.insertOne(orderDoc as any);
    const orderId = result.insertedId.toString();

    // Insert order items
    if (items.length > 0) {
      await orderItems.insertMany(
        items.map(item => ({
          ...item,
          orderId,
        })) as any[]
      );
    }

    return this.formatOrder({ _id: result.insertedId, ...orderDoc });
  }

  async updateOrderStatus(id: string, status: string, codes?: { tempPickupCode?: string; finalPickupCode?: string }): Promise<void> {
    const { orders } = await getCollections();
    const updateData: any = { status };
    if (codes?.tempPickupCode) updateData.tempPickupCode = codes.tempPickupCode;
    if (codes?.finalPickupCode) updateData.finalPickupCode = codes.finalPickupCode;

    await orders.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
  }

  // Helper formatting methods
  private formatUser(doc: any): User {
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      password: doc.password,
      createdAt: doc.createdAt,
    };
  }

  private formatCategory(doc: any): Category {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      imageUrl: doc.imageUrl,
      description: doc.description,
      productCount: doc.productCount || 0,
    };
  }

  private formatProduct(doc: any): Product {
    return {
      id: doc._id.toString(),
      sku: doc.sku,
      name: doc.name,
      description: doc.description,
      price: doc.price,
      images: doc.images || [],
      stock: doc.stock,
      categoryId: doc.categoryId,
      isActive: doc.isActive,
      isPerishable: doc.isPerishable,
      ratingAverage: doc.ratingAverage || 0,
      ratingCount: doc.ratingCount || 0,
      createdAt: doc.createdAt,
    };
  }

  private formatFavorite(doc: any): Favorite {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      productId: doc.productId,
      addedAt: doc.addedAt,
    };
  }

  private formatRating(doc: any): Rating {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      productId: doc.productId,
      rating: doc.rating,
      comment: doc.comment,
      createdAt: doc.createdAt,
    };
  }

  private formatCartItem(doc: any): CartItem {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      sessionId: doc.sessionId,
      productId: doc.productId,
      quantity: doc.quantity,
      createdAt: doc.createdAt,
    };
  }

  private formatPickupSlot(doc: any): PickupSlot {
    return {
      id: doc._id.toString(),
      date: doc.date,
      timeFrom: doc.timeFrom,
      timeTo: doc.timeTo,
      capacity: doc.capacity,
      remaining: doc.remaining,
      isActive: doc.isActive,
    };
  }

  private formatOrder(doc: any): Order {
    return {
      id: doc._id.toString(),
      orderNumber: doc.orderNumber,
      userId: doc.userId,
      customerName: doc.customerName,
      customerPhone: doc.customerPhone,
      customerEmail: doc.customerEmail,
      pickupSlotId: doc.pickupSlotId,
      status: doc.status,
      amount: doc.amount,
      currency: doc.currency,
      paymentMethod: doc.paymentMethod,
      paymentProvider: doc.paymentProvider,
      tempPickupCode: doc.tempPickupCode,
      finalPickupCode: doc.finalPickupCode,
      notes: doc.notes,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    };
  }

  private formatOrderItem(doc: any): OrderItem {
    return {
      id: doc._id.toString(),
      orderId: doc.orderId,
      productId: doc.productId,
      productName: doc.productName,
      productPrice: doc.productPrice,
      quantity: doc.quantity,
      subtotal: doc.subtotal,
    };
  }
}

export const storage = new DatabaseStorage();
