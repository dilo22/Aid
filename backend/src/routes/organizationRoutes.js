import { Router } from "express";
import {
  createOrganization,
  getOrganizations,
  updateOrganization,
  deleteOrganization,
  getMyFidels,
  createFidelByOrganization,
  updateFidelByOrganization,
  deleteFidelByOrganization,
} from "../controllers/organizationController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(requireAuth);

// routes admin organizations
router.get("/", requireRole("admin"), getOrganizations);
router.post("/", requireRole("admin"), createOrganization);
router.put("/:id", requireRole("admin"), updateOrganization);
router.delete("/:id", requireRole("admin"), deleteOrganization);

// routes organization -> fidèles
router.get("/me/fidels", requireRole("organization"), getMyFidels);
router.post("/me/fidels", requireRole("organization"), createFidelByOrganization);
router.patch("/me/fidels/:id", requireRole("organization"), updateFidelByOrganization);
router.delete("/me/fidels/:id", requireRole("organization"), deleteFidelByOrganization);

export default router;