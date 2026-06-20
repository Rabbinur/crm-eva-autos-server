import { Router } from "express";
import { UserController } from "../users.controller";
import validateRequest from "@/middlewares/validateRequest";
import { UserValidations } from "../users.validate";
import verifyToken from "@/middlewares/verifyToken";
import { ROLES } from "@/constants/roles";

const router = Router();

router
  .route("/")
  .get(
    verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
    UserController.getAllUsers
  )
  .post(
    verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
    validateRequest(UserValidations.createUserByAdmin),
    UserController.createUserByAdmin
  );

router
  .route("/:id")
  .get(
    verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
    UserController.getUserById
  )
  .patch(
    verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
    validateRequest(UserValidations.updateUser),
    UserController.updateUser
  )
  .delete(
    verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
    UserController.deleteAccount
  );

export const UserAdminRoutes = router;
