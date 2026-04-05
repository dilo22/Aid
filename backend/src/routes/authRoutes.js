import { Router } from "express";
import {
  getMe,
  register,
  changePassword,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/change-password", requireAuth, changePassword);
router.get("/me", requireAuth, getMe);

export default router;