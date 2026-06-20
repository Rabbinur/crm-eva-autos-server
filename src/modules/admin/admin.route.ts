import { Router } from "express";
import { AdminController } from "./admin.controller";
import { adminValidations } from "./admin.validate";
import { otpValidations } from "../otp/otp.validate";
import validateRequest from "@/middlewares/validateRequest";
import verifyToken from "@/middlewares/verifyToken";
import { ROLES } from "@/constants/roles";

const router = Router();

router.post(
  "/",
  validateRequest(adminValidations.create),
  AdminController.createAdmin
);

router.post(
  "/login",
  validateRequest(adminValidations.login),
  AdminController.adminLogin
);

router.post(
  "/verify",
  validateRequest(otpValidations.verifyOtp),
  AdminController.verifyAccount
);

router.post(
  "/resend-otp",
  validateRequest(otpValidations.resendOtp),
  AdminController.resendVerificationOtp
);

router.post(
  "/approve",
  validateRequest(adminValidations.approveAccount),
  AdminController.approveAdminAccount
);

router.get(
  "/auth",
  verifyToken([ROLES.ADMIN]),
  AdminController.getLoggedInAdmin
);

router.get("/", verifyToken([ROLES.ADMIN]), AdminController.getAllAdmins);

router.get("/:id", verifyToken([ROLES.ADMIN]), AdminController.getAdminById);

router.get(
  "/email/:email",
  verifyToken([ROLES.ADMIN]),
  AdminController.getAdminByEmail
);

router.patch(
  "/:id",
  verifyToken([ROLES.ADMIN]),
  validateRequest(adminValidations.update),
  AdminController.updateAdmin
);

router.patch(
  "/:id/password",
  verifyToken([ROLES.ADMIN]),
  validateRequest(adminValidations.changePassword),
  AdminController.changePassword
);
router.patch(
  "/reset-password",
  validateRequest(adminValidations.login),
  AdminController.resetPassword
);

router.delete("/:id", AdminController.deleteAdmin);

export const AdminRoutes = router;
