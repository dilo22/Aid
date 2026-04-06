export const errorMiddleware = (err, req, res, next) => {
  // ✅ Log systématique des erreurs serveur
  if (!err.statusCode || err.statusCode >= 500) {
    console.error(
      `[ERROR] ${req.method} ${req.originalUrl}`,
      {
        message: err.message,
        stack: err.stack,
        user: req.user?.id ?? "anonymous",
      }
    );
  }

  // ✅ Gestion JSON malformé
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "JSON invalide" });
  }

  // ✅ Gestion rate limit (express-rate-limit renvoie un objet spécial)
  if (err.status === 429) {
    return res.status(429).json({ message: err.message });
  }

  const statusCode = err.statusCode || 500;

  // ✅ En production : ne jamais exposer les détails d'une erreur 500
  const message = statusCode >= 500 && process.env.NODE_ENV === "production"
    ? "Erreur serveur interne"
    : err.message || "Erreur serveur";

  return res.status(statusCode).json({ message });
};