import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

const JWT_SECRET = process.env.JWT_SECRET || "geant-casino-secret-key-2024";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId, type: "access" }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: "refresh" }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyToken(token: string): { userId: string; type: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const { userId, type } = verifyToken(token);

    if (type !== "access") {
      return res.status(401).json({ error: "Invalid token type" });
    }

    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error: any) {
    return res.status(401).json({ error: error.message || "Authentication failed" });
  }
}

export function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const { userId } = verifyToken(token);
      storage.getUser(userId).then(user => {
        if (user) {
          req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
          };
        }
        next();
      });
    } catch {
      next();
    }
  } else {
    next();
  }
}
