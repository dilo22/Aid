import { Router } from "express";
import {
  approveUser,
  rejectUser,
  getPendingUsers,
  getApprovedUsers,
  assignSheepToFidel,
  createFidelByAdmin,
  updateMe,
  deleteFidelByAdmin,
} from "../controllers/userController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(requireAuth);

// utilisateur connecté
router.patch("/me", updateMe);

// admin uniquement
router.use(requireRole("admin"));

router.get("/pending", getPendingUsers);
router.get("/approved", getApprovedUsers);
router.patch("/:userId/approve", approveUser);
router.patch("/:userId/reject", rejectUser);
router.post("/:userId/assign-sheep", assignSheepToFidel);
router.post("/create-fidel", createFidelByAdmin);
router.delete("/:userId", deleteFidelByAdmin);

export default router;