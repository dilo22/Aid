import { Router } from "express";
import authRoutes from "./authRoutes.js";
import organizationRoutes from "./organizationRoutes.js";
import userRoutes from "./userRoutes.js";
import sheepRoutes from "./sheepRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import { authLimiter } from "../middlewares/rateLimiters.js";
const router = Router();

// ✅ Rate limit strict sur les routes d'authentification
router.use("/auth", authLimiter, authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/profiles", userRoutes);
router.use("/sheep", sheepRoutes);
router.use("/payments", paymentRoutes);

export default router;