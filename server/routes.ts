import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  authMiddleware,
  optionalAuthMiddleware,
  type AuthRequest,
} from "./middleware/auth";
import { insertUserSchema, insertRatingSchema, loginSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ==================== AUTH ROUTES ====================
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      // Check existing user
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { emailOrUsername, password } = loginSchema.parse(req.body);

      // Find user by email or username
      let user = await storage.getUserByEmail(emailOrUsername);
      if (!user) {
        user = await storage.getUserByUsername(emailOrUsername);
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        access: accessToken,
        refresh: refreshToken,
        user: userWithoutPassword,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/refresh", async (req: Request, res: Response) => {
    try {
      const { refresh } = req.body;

      if (!refresh) {
        return res.status(400).json({ error: "Refresh token required" });
      }

      const { userId, type } = verifyToken(refresh);

      if (type !== "refresh") {
        return res.status(401).json({ error: "Invalid token type" });
      }

      const accessToken = generateAccessToken(userId);
      res.json({ access: accessToken });
    } catch (error: any) {
      res.status(401).json({ error: error.message || "Token refresh failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.status(204).send();
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res: Response) => {
    res.json(req.user);
  });

  app.patch("/api/auth/me", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { username } = req.body;
      const updated = await storage.updateUser(req.user!.id, { username });
      const { password: _, ...userWithoutPassword } = updated!;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== CATEGORIES ====================
  app.get("/api/categories", async (req: Request, res: Response) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // ==================== PRODUCTS ====================
  app.get("/api/products", async (req: Request, res: Response) => {
    const { search, category, sort, page = "1", page_size = "20" } = req.query;

    let categoryId: string | undefined;
    if (category) {
      const cat = await storage.getCategoryBySlug(category as string);
      categoryId = cat?.id;
    }

    const result = await storage.getProducts({
      search: search as string,
      categoryId,
      sort: sort as string,
      page: parseInt(page as string),
      pageSize: parseInt(page_size as string),
    });

    res.json({
      ...result,
      next: result.count > parseInt(page as string) * parseInt(page_size as string) ? "next" : null,
      previous: parseInt(page as string) > 1 ? "previous" : null,
    });
  });

  app.get("/api/products/suggest", async (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.json([]);
    }

    const suggestions = await storage.getProductSuggestions(q);
    res.json(suggestions);
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    const product = await storage.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  });

  // ==================== FAVORITES ====================
  app.get("/api/favorites", authMiddleware, async (req: AuthRequest, res: Response) => {
    const favorites = await storage.getUserFavorites(req.user!.id);
    res.json(favorites);
  });

  app.post("/api/favorites/:productId", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const favorite = await storage.addFavorite(req.user!.id, req.params.productId);
      res.status(201).json(favorite);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/favorites/:productId", authMiddleware, async (req: AuthRequest, res: Response) => {
    await storage.removeFavorite(req.user!.id, req.params.productId);
    res.status(204).send();
  });

  // ==================== RATINGS ====================
  app.get("/api/products/:id/ratings", async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const ratings = await storage.getProductRatings(req.params.id, page);
    res.json(ratings);
  });

  app.post("/api/products/:id/ratings", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertRatingSchema.parse({
        ...req.body,
        productId: req.params.id,
      });

      const rating = await storage.createRating(req.user!.id, validatedData);
      res.status(201).json(rating);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ==================== CART ====================
  app.get("/api/cart", optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
    let cartItems;
    if (req.user) {
      cartItems = await storage.getUserCart(req.user.id);
    } else {
      const sessionId = req.headers["x-session-id"] as string;
      cartItems = sessionId ? await storage.getSessionCart(sessionId) : [];
    }

    const items = cartItems.map(item => ({
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      imageUrl: (item.product.images as string[])[0] || "",
      subtotal: (parseFloat(item.product.price) * item.quantity).toFixed(2),
    }));

    const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);

    res.json({
      items,
      total,
      currency: "XAF",
    });
  });

  // ==================== PICKUP SLOTS ====================
  app.get("/api/pickup-slots", async (req: Request, res: Response) => {
    const { date } = req.query;
    const slots = await storage.getPickupSlots(date as string);
    res.json(slots);
  });

  // ==================== ORDERS ====================
  app.get("/api/orders", authMiddleware, async (req: AuthRequest, res: Response) => {
    const orders = await storage.getOrders(req.user!.id);
    res.json(orders);
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    const order = await storage.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  });

  app.post("/api/orders", optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { customerName, customerPhone, customerEmail, pickupSlotId, items: requestItems, paymentMethod, notes } = req.body;

      if (!customerName || !customerPhone || !pickupSlotId || !requestItems || requestItems.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Calculate total and create order items
      let totalAmount = 0;
      const orderItems = [];

      for (const item of requestItems) {
        const product = await storage.getProductById(item.productId);
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product?.name || "product"}` });
        }

        const subtotal = parseFloat(product.price) * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
          subtotal: subtotal.toFixed(2),
        });
      }

      // Generate order number
      const orderNumber = `GC-${Date.now()}-${nanoid(6).toUpperCase()}`;

      // Generate temporary pickup code
      const tempPickupCode = nanoid(8).toUpperCase();

      // Calculate expiration (24h for perishable, 48h for non-perishable)
      const hasPerishable = requestItems.some((item: any) => item.product?.isPerishable);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (hasPerishable ? 24 : 48));

      const order = await storage.createOrder(
        {
          orderNumber,
          userId: req.user?.id,
          customerName,
          customerPhone,
          customerEmail,
          pickupSlotId,
          amount: totalAmount.toFixed(2),
          currency: "XAF",
          paymentMethod,
          notes,
          status: "paid", // Mock: automatically mark as paid
          tempPickupCode,
          expiresAt,
        },
        orderItems
      );

      // Update slot capacity
      const slot = await storage.getPickupSlotById(pickupSlotId);
      if (slot) {
        await storage.updateSlotCapacity(pickupSlotId, slot.remaining - 1);
      }

      // Get full order with relations
      const fullOrder = await storage.getOrderById(order.id);
      res.status(201).json(fullOrder);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Order creation failed" });
    }
  });

  // ==================== PAYMENTS (MOCK) ====================
  app.post("/api/payments/initiate", async (req: Request, res: Response) => {
    const { orderId, method } = req.body;

    // Mock payment initiation
    res.json({
      paymentUrl: `https://mock-payment.geantcasino.cg/pay?order=${orderId}&method=${method}`,
      provider: method === "momo" ? "MTN Mobile Money" : "Visa/Mastercard",
    });
  });

  // ==================== CONFIG ====================
  app.get("/api/config/policy", async (req: Request, res: Response) => {
    res.json({
      expirationPolicy: "24h maximum pour produits périssables, 48h pour non périssables. Passé ce délai, commande annulée et remise en rayon, sans remboursement (commande expirée).",
      perishableExpiry: 24,
      nonPerishableExpiry: 48,
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
