import { Router } from "express";
import { DeliveryManController } from "./delivery-man.controller";
import { deliveryManValidations } from "./delivery-man.validate";
import validateRequest from "@/middlewares/validateRequest";
import verifyToken from "@/middlewares/verifyToken";
import { ROLES } from "@/constants/roles";

const router = Router();

router.post(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest(deliveryManValidations.create),
  DeliveryManController.createDeliveryMan
);

router.get(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DeliveryManController.getAllDeliveryMen
);

router.get(
  "/:id/stats",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DeliveryManController.getDeliveryManStats
);

router.get(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DeliveryManController.getDeliveryManById
);

router.patch(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest(deliveryManValidations.update),
  DeliveryManController.updateDeliveryMan
);

router.delete(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  DeliveryManController.deleteDeliveryMan
);

export const DeliveryManRoutes = router;
