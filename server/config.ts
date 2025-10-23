export const NODE_ENV = process.env.NODE_ENV || "development";

export const JWT_SECRET = process.env.JWT_SECRET || "geant-casino-secret-key-2024";

export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

export const LOG_LEVEL = (() => {
  const lvl = process.env.LOG_LEVEL?.toLowerCase();
  if (lvl) return lvl;
  return NODE_ENV === "production" ? "warn" : "info";
})();

export const DEV_PRETTY_LOGS = (process.env.DEV_PRETTY_LOGS || "false").toLowerCase() === "true";
