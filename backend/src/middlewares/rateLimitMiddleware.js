import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // ✅ augmenté de 300 à 500
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes, réessayez dans 15 minutes." },
  skip: (req) => req.path === "/api/health", // ✅ skip health check
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives, réessayez dans 15 minutes." },
});