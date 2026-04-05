import { Router } from "express";
import authRoutes from "./authRoutes.js";
import organizationRoutes from "./organizationRoutes.js";
import userRoutes from "./userRoutes.js";
import sheepRoutes from "./sheepRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/profiles", userRoutes);
router.use("/sheep", sheepRoutes);
router.use("/payments", paymentRoutes);

export default router;