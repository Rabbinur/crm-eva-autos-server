import { Router } from "express";
import { AdminController } from "./admin.controller";
import verifyToken from "@/middlewares/verifyToken";
import { ROLES } from "@/constants/roles";
import { upload } from "@/config/multer";

const router = Router();

// GET /api/v1/auth/admin/me
router.get(
  "/me",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MODERATOR]),
  AdminController.getLoggedInAdmin
);

// POST /api/v1/auth/admin/me
router.post(
  "/me",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MODERATOR]),
  upload.single("profile_picture"),
  AdminController.updateLoggedInAdmin
);

// POST /api/v1/auth/admin/change-password
router.post(
  "/change-password",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MODERATOR]),
  AdminController.changeLoggedInAdminPassword
);

export const AuthAdminRoutes = router;
