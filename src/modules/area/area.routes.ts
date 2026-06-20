import { Router } from "express";
import { AreaController } from "./area.controller";
import { areaValidations } from "./area.validate";
import validateRequest from "@/middlewares/validateRequest";
import verifyToken from "@/middlewares/verifyToken";
import { ROLES } from "@/constants/roles";

const router = Router();

router.post(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest(areaValidations.create),
  AreaController.createArea
);

router.get(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  AreaController.getAllAreas
);

router.get(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  AreaController.getAreaById
);

router.patch(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest(areaValidations.update),
  AreaController.updateArea
);

router.delete(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  AreaController.deleteArea
);

export const AreaRoutes = router;
