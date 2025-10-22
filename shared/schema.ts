import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob, index } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: text("password_reset_expires"),
  twoFactorCode: text("two_factor_code"),
  twoFactorExpires: text("two_factor_expires"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
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
  updatedAt: true,
  passwordResetToken: true,
  passwordResetExpires: true,
  twoFactorCode: true,
  twoFactorExpires: true,
});

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email ou nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginInput = z.infer<typeof loginSchema>;

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
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

export const products = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  images: text("images", { mode: 'json' }).$type<string[]>().notNull().default("[]"),
  stock: integer("stock").default(0).notNull(),
  categoryId: text("category_id").references(() => categories.id).notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true).notNull(),
  isPerishable: integer("is_perishable", { mode: 'boolean' }).default(false).notNull(),
  ratingAverage: real("rating_average").default(0).notNull(),
  ratingCount: integer("rating_count").default(0).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
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

export const favorites = sqliteTable("favorites", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: text("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  addedAt: text("added_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
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

export const ratings = sqliteTable("ratings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: text("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
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

export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text("session_id"),
  productId: text("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
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

export const pickupSlots = sqliteTable("pickup_slots", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: text("date").notNull(),
  timeFrom: text("time_from").notNull(),
  timeTo: text("time_to").notNull(),
  capacity: integer("capacity").default(50).notNull(),
  remaining: integer("remaining").default(50).notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true).notNull(),
}, (table) => ({
  dateIdx: index("slot_date_idx").on(table.date),
}));

export const insertPickupSlotSchema = createInsertSchema(pickupSlots).omit({
  id: true,
});

export type InsertPickupSlot = z.infer<typeof insertPickupSlotSchema>;
export type PickupSlot = typeof pickupSlots.$inferSelect;

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  pickupSlotId: text("pickup_slot_id").references(() => pickupSlots.id).notNull(),
  status: text("status").notNull().default("pending_payment"),
  amount: real("amount").notNull(),
  currency: text("currency").default("XAF").notNull(),
  paymentMethod: text("payment_method"),
  paymentProvider: text("payment_provider"),
  tempPickupCode: text("temp_pickup_code"),
  finalPickupCode: text("final_pickup_code"),
  notes: text("notes"),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
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

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: text("product_id").references(() => products.id).notNull(),
  productName: text("product_name").notNull(),
  productPrice: real("product_price").notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: real("subtotal").notNull(),
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

export type ProductWithCategory = Product & { category: Category };
export type CartItemWithProduct = CartItem & { product: Product };
export type OrderWithDetails = Order & { items: OrderItem[]; pickupSlot: PickupSlot };
export type RatingWithUser = Rating & { user: Pick<User, 'id' | 'username'> };
