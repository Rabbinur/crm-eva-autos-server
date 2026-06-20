import { Router } from "express";
import { LoadingSheetController } from "./loading-sheet.controller";
import { loadingSheetValidations } from "./loading-sheet.validate";
import validateRequest from "@/middlewares/validateRequest";
import verifyToken from "@/middlewares/verifyToken";
import { ROLES } from "@/constants/roles";

const router = Router();

router.post(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest(loadingSheetValidations.create),
  LoadingSheetController.createLoadingSheet
);

router.get(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  LoadingSheetController.getAllLoadingSheets
);

router.get(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  LoadingSheetController.getLoadingSheetById
);

router.patch(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest(loadingSheetValidations.update),
  LoadingSheetController.updateLoadingSheet
);

router.delete(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  LoadingSheetController.deleteLoadingSheet
);

export const LoadingSheetRoutes = router;
