import { Router } from "express";
import { getMe, register, changePassword } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { authLimiter } from "../app.js";

const router = Router();

// ✅ Rate limit strict sur register et login
router.post("/register", authLimiter, register);
router.post("/change-password", authLimiter, requireAuth, changePassword);
router.get("/me", requireAuth, getMe);

export default router;