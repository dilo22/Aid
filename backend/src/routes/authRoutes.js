import { Router } from "express";
import { getMe, register, changePassword } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { authLimiter } from "../middlewares/rateLimitMiddleware.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/change-password", authLimiter, requireAuth, changePassword);
router.get("/me", requireAuth, getMe);

export default router;