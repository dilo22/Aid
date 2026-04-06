import { ApiError } from "../utils/apiError.js";

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // ✅ Double vérification au cas où requireAuth serait oublié sur une route
      if (!req.user) {
        throw new ApiError(401, "Utilisateur non authentifié");
      }

      // ✅ Vérification statut (filet de sécurité)
      if (req.user.status === "pending" || req.user.status === "rejected") {
        throw new ApiError(403, "Accès refusé — compte non actif");
      }

      if (!allowedRoles.includes(req.user.role)) {
        // ✅ Log des tentatives d'accès non autorisées
        console.warn(
          `[ACCESS DENIED] user=${req.user.id} role=${req.user.role} ` +
          `tried=${req.method} ${req.originalUrl} ` +
          `allowed=${allowedRoles.join(",")}`
        );
        throw new ApiError(403, "Accès refusé");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};