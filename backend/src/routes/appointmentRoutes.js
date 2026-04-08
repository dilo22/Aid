import { Router } from "express";
import {
  getAppointmentSettings,
  updateAppointmentSettings,
  generateAppointments,
  getAppointments,
  getMyAppointments,
  updateAppointment,
  publishAppointments,
  exportFideles,
} from "../controllers/appointmentController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();
router.use(requireAuth);

// Admin
router.get   ("/settings",          requireRole("admin"), getAppointmentSettings);
router.put   ("/settings",          requireRole("admin"), updateAppointmentSettings);
router.post  ("/generate/:type",    requireRole("admin"), generateAppointments);
router.get   ("/",                  requireRole("admin"), getAppointments);
router.patch ("/:id",               requireRole("admin"), updateAppointment);
router.post  ("/publish/:type",     requireRole("admin"), publishAppointments);
router.get   ("/export/fideles",    requireRole("admin"), exportFideles);

// Fidèle
router.get   ("/me",                requireRole("fidel", "admin"), getMyAppointments);

export default router;