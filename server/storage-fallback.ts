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
import { IStorage } from './storage';

export class FallbackStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private categories: Map<string, Category> = new Map();
  private products: Map<string, Product> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = Math.random().toString(36).substring(7);
    const newUser: User = {
      id,
      ...user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as User;
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data, updatedAt: new Date().toISOString() } as User;
    this.users.set(id, updated);
    return updated;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    for (const cat of this.categories.values()) {
      if (cat.slug === slug) return cat;
    }
    return undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = Math.random().toString(36).substring(7);
    const newCategory: Category = {
      id,
      ...category,
      productCount: 0,
    } as Category;
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async getProducts(): Promise<{ results: Product[]; count: number }> {
    const products = Array.from(this.products.values());
    return { results: products, count: products.length };
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductSuggestions(): Promise<{ id: string; name: string; thumbUrl: string }[]> {
    return [];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = Math.random().toString(36).substring(7);
    const newProduct: Product = {
      id,
      ...product,
      ratingAverage: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString(),
    } as Product;
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProductRating(): Promise<void> {}

  async getUserFavorites(): Promise<any[]> { return []; }
  async addFavorite(): Promise<Favorite> { throw new Error('Not implemented'); }
  async removeFavorite(): Promise<void> {}

  async getProductRatings(): Promise<any> { return { results: [], count: 0 }; }
  async createRating(): Promise<Rating> { throw new Error('Not implemented'); }

  async getUserCart(): Promise<any[]> { return []; }
  async getSessionCart(): Promise<any[]> { return []; }
  async addToCart(): Promise<CartItem> { throw new Error('Not implemented'); }
  async updateCartItem(): Promise<CartItem | undefined> { return undefined; }
  async removeFromCart(): Promise<void> {}

  async getPickupSlots(): Promise<PickupSlot[]> { return []; }
  async getPickupSlotById(): Promise<PickupSlot | undefined> { return undefined; }
  async createPickupSlot(): Promise<PickupSlot> { throw new Error('Not implemented'); }
  async updateSlotCapacity(): Promise<void> {}

  async getOrders(): Promise<Order[]> { return []; }
  async getOrderById(): Promise<any> { return undefined; }
  async createOrder(): Promise<Order> { throw new Error('Not implemented'); }
  async updateOrderStatus(): Promise<void> {}
}
