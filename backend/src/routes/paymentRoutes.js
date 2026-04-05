import { Router } from "express";
import {
  getPaymentsBySheepId,
  getPaymentsByProfileId,
  createPayment,
  updatePayment,
  deletePayment,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/sheep/:sheepId", getPaymentsBySheepId);
router.get("/profile/:profileId", getPaymentsByProfileId);
router.post("/", createPayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;