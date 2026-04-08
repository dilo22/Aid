import { Router } from "express";
import authRoutes from "./authRoutes.js";
import organizationRoutes from "./organizationRoutes.js";
import userRoutes from "./userRoutes.js";
import sheepRoutes from "./sheepRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import { authLimiter } from "../middlewares/rateLimitMiddleware.js";
import appointmentRoutes from "./appointmentRoutes.js";


const router = Router();

router.use("/auth", authLimiter, authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/profiles", userRoutes);
router.use("/sheep", sheepRoutes);
router.use("/payments", paymentRoutes);
router.use("/appointments", appointmentRoutes);


export default router;