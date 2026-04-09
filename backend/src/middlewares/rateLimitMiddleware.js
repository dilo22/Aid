import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // ✅ augmenté
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes, réessayez dans 15 minutes." },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // ✅ augmenté de 10 à 20
  message: { error: "Trop de tentatives, réessayez dans 15 minutes." },
});