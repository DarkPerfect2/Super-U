import pino from "pino";
import pinoHttp from "pino-http";
import { DEV_PRETTY_LOGS, LOG_LEVEL, NODE_ENV } from "./config";

export const logger = pino({
  level: LOG_LEVEL,
  transport: NODE_ENV === "development" && DEV_PRETTY_LOGS ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      singleLine: false,
    },
  } : undefined,
});

export const httpLogger = pinoHttp({
  logger,
  redact: {
    paths: ["req.headers.authorization", "res.headers.set-cookie"],
    censor: "[redacted]",
  },
  customProps: (req, res) => ({
    requestId: (req.headers["x-request-id"] as string) || undefined,
    userId: (req as any).user?.id,
  }),
});
