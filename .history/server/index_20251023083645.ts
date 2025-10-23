import express, { type Request, Response, NextFunction } from "express";
import cors, { type CorsOptions } from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { connectDatabase } from "./db";
import { httpLogger, logger } from "./logger";

const app = express();
app.use(express.json({ verify: (req, _res, buf) => { (req as any).rawBody = buf.toString("utf8"); } }));
app.use(express.urlencoded({ extended: false }));

// Configuration CORS montée avant les routes
const allowedOriginsEnv = (process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = allowedOriginsEnv.length > 0 ? allowedOriginsEnv : ["http://localhost:3000"];
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.use(httpLogger);

(async () => {
  try {
    // Initialiser la connexion MongoDB
    await connectDatabase();
    logger.info('Base de données MongoDB initialisée');
  } catch (error) {
    logger.warn("MongoDB indisponible, stockage de secours utilisé. Vérifiez MONGODB_URI dans .env");
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Important: n’activer Vite qu’en développement et après
  // avoir monté les autres routes pour que la route catch-all
  // ne perturbe pas les routes de l’API
  const apiOnly = process.env.API_ONLY === "true";
  const serveClient = process.env.SERVE_CLIENT !== "false";

  if (!apiOnly) {
    if (app.get("env") === "development") {
      await setupVite(app, server);
      logger.info("Vite dev middlewares initialisés");
    } else {
      if (serveClient) {
        serveStatic(app);
        logger.info("Fichiers statiques du client servis depuis public/");
      }
    }
  }

  // Toujours écouter sur le port défini par la variable d’environnement PORT
  // Par défaut 5000. Les autres ports peuvent être filtrés par le pare-feu.
  // Sert l’API (et le client uniquement si SERVE_CLIENT !== 'false').
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    logger.info({ port }, "HTTP server listening");
  });
})();
