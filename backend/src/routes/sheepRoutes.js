import { Router } from "express";
import { createSheep, getSheepList, updateSheep, deleteSheep } from "../controllers/sheepController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/",      requireRole("admin", "organization", "fidel"), getSheepList);
router.post("/",     requireRole("admin"), createSheep);
router.patch("/:id", requireRole("admin"), updateSheep); // ✅ PUT → PATCH
router.delete("/:id", requireRole("admin"), deleteSheep);

export default router;