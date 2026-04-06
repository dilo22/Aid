import { Router } from "express";
import {
  getPaymentsBySheepId, getPaymentsByProfileId,
  createPayment, updatePayment, deletePayment,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(requireAuth);

// ✅ Lecture : admin + organization + fidel (le controller filtre par rôle)
router.get("/sheep/:sheepId",      requireRole("admin", "organization"), getPaymentsBySheepId);
router.get("/profile/:profileId",  requireRole("admin", "organization", "fidel"), getPaymentsByProfileId);

// ✅ Écriture : admin + organization uniquement
router.post("/",      requireRole("admin", "organization"), createPayment);
router.patch("/:id",  requireRole("admin", "organization"), updatePayment); // ✅ PUT → PATCH
router.delete("/:id", requireRole("admin", "organization"), deletePayment);

export default router;