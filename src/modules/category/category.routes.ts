import { Router } from "express";
import { CategoryController } from "./category.controller";
import { categoryValidations } from "./category.validate";
import validateRequest from "@/middlewares/validateRequest";
import verifyToken from "@/middlewares/verifyToken";
import { ROLES } from "@/constants/roles";

const router = Router();

router.post(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest(categoryValidations.create),
  CategoryController.createCategory
);

router.get(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  CategoryController.getAllCategories
);

router.get(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  CategoryController.getCategoryById
);

router.patch(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest(categoryValidations.update),
  CategoryController.updateCategory
);

router.delete(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;
