import { Router } from "express";
import {
  getAppointmentSettings,
  updateAppointmentSettings,
  generateAppointments,
  getAppointments,
  getMyAppointments,
  updateAppointment,
  publishAppointments,
  sendAppointmentEmails,
  createSingleAppointment,
  getFidelesWithAppointments,
  exportFideles,
} from "../controllers/appointmentController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = Router();
router.use(requireAuth);

// Admin
router.get   ("/settings",           requireRole("admin"), getAppointmentSettings);
router.put   ("/settings",           requireRole("admin"), updateAppointmentSettings);
router.post  ("/generate/:type",     requireRole("admin"), generateAppointments);
router.get   ("/fideles",            requireRole("admin"), getFidelesWithAppointments);
router.get   ("/export/fideles",     requireRole("admin"), exportFideles);
router.get   ("/",                   requireRole("admin"), getAppointments);
router.post  ("/single",             requireRole("admin"), createSingleAppointment);
router.post  ("/publish/:type",      requireRole("admin"), publishAppointments);
router.post  ("/send-emails/:type",  requireRole("admin"), sendAppointmentEmails);
router.patch ("/:id",                requireRole("admin"), updateAppointment);

// Fidèle
router.get   ("/me", requireRole("fidel", "admin"), getMyAppointments);

export default router;