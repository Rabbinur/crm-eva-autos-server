import { Router } from "express";
import { SettlementController } from "./settlement.controller";
import { settlementValidations } from "./settlement.validate";
import validateRequest from "@/middlewares/validateRequest";
import verifyToken from "@/middlewares/verifyToken";
import { ROLES } from "@/constants/roles";

const router = Router();

router.post(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest(settlementValidations.create),
  SettlementController.createSettlement
);

router.get(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  SettlementController.getAllSettlements
);

router.get(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  SettlementController.getSettlementById
);

export const SettlementRoutes = router;
