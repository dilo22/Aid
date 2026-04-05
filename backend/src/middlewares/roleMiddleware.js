import { ApiError } from "../utils/apiError.js";

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Utilisateur non authentifié");
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(403, "Accès refusé");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};