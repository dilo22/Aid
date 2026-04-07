import cors from "cors";

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// 🔥 IMPORTANT → gérer le preflight
app.options("*", cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));