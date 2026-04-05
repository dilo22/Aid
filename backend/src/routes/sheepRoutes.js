import { Router } from "express";
import {
  createSheep,
  getSheepList,
  updateSheep,
  deleteSheep,
} from "../controllers/sheepController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("admin", "organization", "fidel"),
  getSheepList
);

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  createSheep
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  updateSheep
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  deleteSheep
);

export default router;