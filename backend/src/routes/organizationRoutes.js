import { Router } from "express";
import {
  createOrganization, getOrganizations,
  updateOrganization, deleteOrganization,
  getMyFidels, createFidelByOrganization,
  updateFidelByOrganization, deleteFidelByOrganization,
} from "../controllers/organizationController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/",    requireRole("admin"), getOrganizations);
router.post("/",   requireRole("admin"), createOrganization);
router.patch("/:id", requireRole("admin"), updateOrganization); // ✅ PUT → PATCH
router.delete("/:id", requireRole("admin"), deleteOrganization);

router.get("/me/fidels",      requireRole("organization"), getMyFidels);
router.post("/me/fidels",     requireRole("organization"), createFidelByOrganization);
router.patch("/me/fidels/:id", requireRole("organization"), updateFidelByOrganization);
router.delete("/me/fidels/:id", requireRole("organization"), deleteFidelByOrganization);

export default router;