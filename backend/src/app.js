import express from "express";
import cors from "cors";
// import helmet from "helmet";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { globalLimiter } from "./middlewares/rateLimitMiddleware.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://aid-adha.space",
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(globalLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routes);
app.use(errorMiddleware);

export default app;