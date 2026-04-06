import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();

// ✅ Headers de sécurité
app.use(helmet());

// ✅ CORS restrictif
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ✅ Limite de taille du body (anti-crash)
app.use(express.json({ limit: "10kb" }));

// ✅ Rate limiting global (anti-abus, anti-surcharge)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,                  // 300 requêtes par IP par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes, réessayez dans 15 minutes." },
});

// ✅ Rate limiting strict sur les routes sensibles (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 tentatives max par IP
  message: { error: "Trop de tentatives, réessayez dans 15 minutes." },
});

app.use(globalLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routes);
app.use(errorMiddleware);

export default app;