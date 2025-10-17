import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== USERS ====================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));

export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(favorites),
  ratings: many(ratings),
  orders: many(orders),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email ou nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginInput = z.infer<typeof loginSchema>;

// ==================== CATEGORIES ====================
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  productCount: integer("product_count").default(0).notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  productCount: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// ==================== PRODUCTS ====================
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  images: json("images").$type<string[]>().notNull().default(sql`'[]'::json`),
  stock: integer("stock").default(0).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isPerishable: boolean("is_perishable").default(false).notNull(), // Pour politique expiration 24h/48h
  ratingAverage: decimal("rating_average", { precision: 3, scale: 2 }).default("0").notNull(),
  ratingCount: integer("rating_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("product_category_idx").on(table.categoryId),
  nameIdx: index("product_name_idx").on(table.name),
  skuIdx: index("product_sku_idx").on(table.sku),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  favorites: many(favorites),
  ratings: many(ratings),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  ratingAverage: true,
  ratingCount: true,
  createdAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// ==================== FAVORITES ====================
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => ({
  userProductIdx: index("favorite_user_product_idx").on(table.userId, table.productId),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [favorites.productId],
    references: [products.id],
  }),
}));

export type Favorite = typeof favorites.$inferSelect;

// ==================== RATINGS ====================
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  productIdx: index("rating_product_idx").on(table.productId),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [ratings.productId],
    references: [products.id],
  }),
}));

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  rating: z.number().min(1).max(5),
});

export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;

// ==================== CART ====================
export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text("session_id"), // Pour utilisateurs invités
  productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("cart_user_idx").on(table.userId),
  sessionIdx: index("cart_session_idx").on(table.sessionId),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// ==================== PICKUP SLOTS ====================
export const pickupSlots = pgTable("pickup_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: text("date").notNull(), // YYYY-MM-DD
  timeFrom: text("time_from").notNull(), // HH:MM
  timeTo: text("time_to").notNull(), // HH:MM
  capacity: integer("capacity").default(50).notNull(),
  remaining: integer("remaining").default(50).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => ({
  dateIdx: index("slot_date_idx").on(table.date),
}));

export const insertPickupSlotSchema = createInsertSchema(pickupSlots).omit({
  id: true,
});

export type InsertPickupSlot = z.infer<typeof insertPickupSlotSchema>;
export type PickupSlot = typeof pickupSlots.$inferSelect;

// ==================== ORDERS ====================
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(),
  userId: uuid("user_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  pickupSlotId: uuid("pickup_slot_id").references(() => pickupSlots.id).notNull(),
  status: text("status").notNull().default("pending_payment"), // pending_payment, paid, preparing, ready, picked_up, cancelled_expired
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("XAF").notNull(),
  paymentMethod: text("payment_method"), // momo, card
  paymentProvider: text("payment_provider"), // airtel, mtn, visa, mastercard
  tempPickupCode: text("temp_pickup_code"), // Code temporaire généré après paiement
  finalPickupCode: text("final_pickup_code"), // Code final pour retrait
  notes: text("notes"),
  expiresAt: timestamp("expires_at"), // Calculé: 24h périssables, 48h non périssables
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  orderNumberIdx: index("order_number_idx").on(table.orderNumber),
  userIdx: index("order_user_idx").on(table.userId),
  statusIdx: index("order_status_idx").on(table.status),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  pickupSlot: one(pickupSlots, {
    fields: [orders.pickupSlotId],
    references: [pickupSlots.id],
  }),
  items: many(orderItems),
}));

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  tempPickupCode: true,
  finalPickupCode: true,
  expiresAt: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// ==================== ORDER ITEMS ====================
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  productName: text("product_name").notNull(),
  productPrice: decimal("product_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
}, (table) => ({
  orderIdx: index("order_item_order_idx").on(table.orderId),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export type OrderItem = typeof orderItems.$inferSelect;

// ==================== API RESPONSE TYPES ====================
export type ProductWithCategory = Product & {
  category: Category;
};

export type CartItemWithProduct = CartItem & {
  product: Product;
};

export type OrderWithDetails = Order & {
  items: OrderItem[];
  pickupSlot: PickupSlot;
};

export type RatingWithUser = Rating & {
  user: Pick<User, 'id' | 'username'>;
};
