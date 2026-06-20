import { Router } from "express";
import { ForgetPasswordController } from "./forgetPassword.controller";
import { forgetPasswordValidation } from "./forgetPassword.validate";
import validateRequest from "@/middlewares/validateRequest";

const router = Router();

router.post(
  "/admin",
  validateRequest(forgetPasswordValidation),
  ForgetPasswordController.adminForgetPassword
);

router.post(
  "/customer",
  validateRequest(forgetPasswordValidation),
  ForgetPasswordController.customerForgetPassword
);

export const ForgetPasswordRoutes = router;
