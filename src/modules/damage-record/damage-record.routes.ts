import { Router } from "express";
import { DamageRecordController } from "./damage-record.controller";
import verifyToken from "@/middlewares/verifyToken";
import { ROLES } from "@/constants/roles";

const router = Router();

// Create damage record
router.post(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DamageRecordController.createDamageRecord
);

// Get all damage records
router.get(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DamageRecordController.getAllDamageRecords
);

// Get aggregated damage stock
router.get(
  "/stock",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DamageRecordController.getDamageStockSummary
);

// Get damage reports
router.get(
  "/reports",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DamageRecordController.getDamageReports
);

// Update status (Approve / Reject / Dispose)
router.patch(
  "/:id/status",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DamageRecordController.updateDamageStatus
);

export const DamageRecordRoutes = router;
