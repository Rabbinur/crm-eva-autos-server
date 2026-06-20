import { Request, Response } from "express";
import { OTPService } from "./otp.service";
import BaseController from "@/shared/baseController";

class Controller extends BaseController {
  verifyOTP = this.catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    await OTPService.verifyOTP(email, otp);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Your OTP verification has been successful",
      data: null,
    });
  });
}

export const OTPController = new Controller();
