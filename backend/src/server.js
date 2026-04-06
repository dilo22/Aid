import dotenv from "dotenv";

// ✅ Toujours en premier, avant tout autre import
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
});

// ✅ Erreur non catchée dans une Promise → log + arrêt propre
process.on("unhandledRejection", (reason, promise) => {
  console.error("[UNHANDLED REJECTION]", reason);
  server.close(() => process.exit(1));
});

// ✅ Erreur synchrone non catchée → log + arrêt propre
process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT EXCEPTION]", error);
  server.close(() => process.exit(1));
});

// ✅ Arrêt propre sur signal Vercel (SIGTERM)
process.on("SIGTERM", () => {
  console.log("[SERVER] SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("[SERVER] Closed");
    process.exit(0);
  });
});