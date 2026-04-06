import { Router } from "express";
import {
  approveUser, rejectUser, // ✅ rejectUser ajouté
  getPendingUsers, getApprovedUsers,
  assignSheepToFidel, createFidelByAdmin,
} from "../controllers/userController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/pending",  getPendingUsers);
router.get("/approved", getApprovedUsers);
router.patch("/:userId/approve", approveUser);
router.patch("/:userId/reject",  rejectUser); // ✅ manquait
router.post("/:userId/assign-sheep", assignSheepToFidel);
router.post("/create-fidel", createFidelByAdmin);

export default router;