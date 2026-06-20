import { Router } from "express";
import { OTPController } from "./otp.controller";
import { otpValidations } from "./otp.validate";
import validateRequest from "@/middlewares/validateRequest";

const router = Router();

router.post(
  "/verify",
  validateRequest(otpValidations.verifyOtp),
  OTPController.verifyOTP
);

export const OTPRoutes = router;
