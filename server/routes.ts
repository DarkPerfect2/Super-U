import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { storage as mongoStorage, IStorage } from "./storage";
import { FallbackStorage } from "./storage-fallback";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  authMiddleware,
  optionalAuthMiddleware,
  type AuthRequest,
} from "./middleware/auth";
import { insertUserSchema, insertRatingSchema, loginSchema } from "@shared/schema";
import { sendEmail, generatePasswordResetTemplate, generateOrderConfirmationTemplate, generateTwoFactorCodeTemplate, initializeEmailService } from "./services/email";
import { sendSMS, generatePasswordResetSMSMessage, generateTwoFactorSMSMessage, generateOrderConfirmationSMSMessage, initializeSMSService } from "./services/sms";
import { initializeCloudinaryService, getCloudinarySignature } from "./services/cloudinary";
import { getCollections, getDatabase } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  initializeEmailService();
  await initializeSMSService();
  initializeCloudinaryService();

  let storage: IStorage;
  const db = await getDatabase();

  if (!db) {
    console.log('⚠️ Using in-memory fallback storage (MongoDB not configured)');
    storage = new FallbackStorage();
  } else {
    console.log('✅ Using MongoDB storage');
    storage = mongoStorage;
  }

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = user as any;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { emailOrUsername, password } = loginSchema.parse(req.body);

      let user = await storage.getUserByEmail(emailOrUsername);
      if (!user) {
        user = await storage.getUserByUsername(emailOrUsername);
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, (user as any).password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      const { password: _, ...userWithoutPassword } = user as any;

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

  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.status(204).send();
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res: Response) => {
    res.json(req.user);
  });

  app.patch("/api/auth/me", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { username, email, phone, currentPassword, newPassword } = req.body;
      const authUser = req.user!;

      const updateData: any = {};

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: "Current password required to change password" });
        }
        const fullUser = await storage.getUser(authUser.id);
        if (!fullUser) {
          return res.status(401).json({ error: "User not found" });
        }
        const isValidPassword = await bcrypt.compare(currentPassword, (fullUser as any).password);
        if (!isValidPassword) {
          return res.status(401).json({ error: "Current password is incorrect" });
        }
        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;

      const updated = await storage.updateUser(authUser.id, updateData);
      const { password: _, ...userWithoutPassword } = updated as any;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If email exists, reset link has been sent" });
      }

      const resetToken = nanoid(32);
      const resetExpires = new Date(Date.now() + 3600000).toISOString();

      await storage.updateUser(user.id, {
        passwordResetToken: resetToken as any,
        passwordResetExpires: resetExpires as any,
      } as any);

      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
      const emailTemplate = generatePasswordResetTemplate(resetLink, (user as any).username);

      const sent = await sendEmail((user as any).email, 'Réinitialisation de votre mot de passe', emailTemplate);
      if (sent) {
        res.json({ message: "Reset link sent to email" });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const { users } = await getCollections();
      const user = await users.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date().toISOString() },
      });

      if (!user) {
        return res.status(401).json({ error: "Invalid or expired reset token" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
            updatedAt: new Date().toISOString(),
          },
        }
      );

      res.json({ message: "Password reset successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/request-2fa", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { method } = req.body;
      const user = req.user!;

      if (!method || !['email', 'sms'].includes(method)) {
        return res.status(400).json({ error: "Method must be 'email' or 'sms'" });
      }

      const twoFactorCode = Math.random().toString().slice(2, 8);
      const twoFactorExpires = new Date(Date.now() + 600000).toISOString();

      await storage.updateUser(user.id, {
        twoFactorCode: twoFactorCode as any,
        twoFactorExpires: twoFactorExpires as any,
      } as any);

      if (method === 'email') {
        const emailTemplate = generateTwoFactorCodeTemplate(twoFactorCode, user.username);
        const sent = await sendEmail(user.email, 'Code de vérification Géant Casino', emailTemplate);
        if (sent) {
          return res.json({ message: "Code sent to email" });
        }
      } else if (method === 'sms') {
        if (!(user as any).phone) {
          return res.status(400).json({ error: "Phone number not set" });
        }
        const message = generateTwoFactorSMSMessage(twoFactorCode);
        const sent = await sendSMS((user as any).phone, message);
        if (sent) {
          return res.json({ message: "Code sent via SMS" });
        }
      }

      res.status(500).json({ error: "Failed to send code" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/verify-2fa", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { code } = req.body;
      const user = req.user!;

      if (!code) {
        return res.status(400).json({ error: "Code required" });
      }

      const fullUser = await storage.getUser(user.id);
      if (!fullUser || (fullUser as any).twoFactorCode !== code) {
        return res.status(401).json({ error: "Invalid code" });
      }

      const now = new Date();
      const expiration = new Date(((fullUser as any).twoFactorExpires) || 0);
      if (now > expiration) {
        return res.status(401).json({ error: "Code expired" });
      }

      await storage.updateUser(user.id, {
        twoFactorCode: undefined as any,
        twoFactorExpires: undefined as any,
      } as any);

      res.json({ message: "Code verified successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/upload/cloudinary-signature", authMiddleware, async (_req: AuthRequest, res: Response) => {
    try {
      const signature = getCloudinarySignature();
      if (!signature) {
        return res.status(500).json({ error: "Cloudinary not configured" });
      }
      res.json(signature);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/categories", async (_req: Request, res: Response) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/products/suggest", async (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.json([]);
    }

    const suggestions = await storage.getProductSuggestions(q);
    res.json(suggestions);
  });

  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const { search, category, sort, page = "1", page_size = "20" } = req.query as any;

      let categoryId: string | undefined;
      if (category) {
        const cat = await storage.getCategoryBySlug(category as string);
        categoryId = cat?.id;
      }

      const pageNum = parseInt(page as string) || 1;
      const pageSizeNum = parseInt(page_size as string) || 20;

      const result = await storage.getProducts({
        search: search as string,
        categoryId,
        sort: sort as string,
        page: pageNum,
        pageSize: pageSizeNum,
      });

      res.json({
        results: result.results,
        count: result.count,
        next: result.count > pageNum * pageSizeNum ? "next" : null,
        previous: pageNum > 1 ? "previous" : null,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

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
      name: (item as any).product.name,
      price: (item as any).product.price,
      quantity: item.quantity,
      imageUrl: ((item as any).product.images as string[])[0] || "",
      subtotal: (parseFloat((item as any).product.price) * item.quantity).toFixed(2),
    }));

    const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);

    res.json({
      items,
      total,
      currency: "XAF",
    });
  });

  app.get("/api/pickup-slots", async (req: Request, res: Response) => {
    const { date } = req.query as any;
    const slots = await storage.getPickupSlots(date as string);
    res.json(slots);
  });

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

      let totalAmount = 0;
      const orderItems: any[] = [];

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

      const orderNumber = `GC-${Date.now()}-${nanoid(6).toUpperCase()}`;
      const tempPickupCode = nanoid(8).toUpperCase();

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
          status: "paid",
          tempPickupCode,
          expiresAt,
        } as any,
        orderItems
      );

      const slot = await storage.getPickupSlotById(pickupSlotId);
      if (slot) {
        await storage.updateSlotCapacity(pickupSlotId, slot.remaining - 1);
      }

      const fullOrder = await storage.getOrderById(order.id);

      if (customerEmail || (req.user as any)?.email) {
        const emailAddress = customerEmail || (req.user as any)?.email;
        const itemsForEmail = orderItems.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: parseFloat(item.productPrice),
        }));
        const pickupDateStr = (slot as any)?.date || new Date().toISOString().split('T')[0];
        const pickupTimeStr = (slot as any)?.timeFrom ? `${(slot as any).timeFrom} - ${(slot as any).timeTo}` : "À définir";

        const emailTemplate = generateOrderConfirmationTemplate(
          orderNumber,
          customerName,
          itemsForEmail,
          totalAmount,
          tempPickupCode,
          pickupDateStr,
          pickupTimeStr
        );

        sendEmail(emailAddress as string, `Confirmation de votre commande ${orderNumber}`, emailTemplate);
      }

      if (customerPhone) {
        const smsMessage = generateOrderConfirmationSMSMessage(orderNumber, tempPickupCode);
        sendSMS(customerPhone, smsMessage);
      }

      res.status(201).json(fullOrder);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Order creation failed" });
    }
  });

  app.post("/api/orders/:id/resend-confirmation", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.userId && order.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const emailAddress = order.customerEmail || (req.user as any)?.email;
      if (!emailAddress) {
        return res.status(400).json({ error: "No email address available" });
      }

      const itemsForEmail = order.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: parseFloat(item.productPrice),
      }));

      const emailTemplate = generateOrderConfirmationTemplate(
        order.orderNumber,
        order.customerName,
        itemsForEmail,
        parseFloat(order.amount),
        order.tempPickupCode || "N/A",
        order.pickupSlot.date,
        `${order.pickupSlot.timeFrom} - ${order.pickupSlot.timeTo}`
      );

      const sent = await sendEmail(emailAddress as string, `Confirmation de votre commande ${order.orderNumber}`, emailTemplate);
      if (sent) {
        res.json({ message: "Confirmation email sent" });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/payments/initiate", async (req: Request, res: Response) => {
    const { orderId, method } = req.body;

    res.json({
      paymentUrl: `https://mock-payment.geantcasino.cg/pay?order=${orderId}&method=${method}`,
      provider: method === "momo" ? "MTN Mobile Money" : "Visa/Mastercard",
    });
  });

  app.get("/api/config/policy", async (_req: Request, res: Response) => {
    res.json({
      expirationPolicy: "24h maximum pour produits périssables, 48h pour non périssables. Passé ce délai, commande annulée et remise en rayon, sans remboursement (commande expirée).",
      perishableExpiry: 24,
      nonPerishableExpiry: 48,
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
