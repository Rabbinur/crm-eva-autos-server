import { Request, Response } from "express";
import { ForgetPasswordService } from "./forgetPassword.service";
import BaseController from "@/shared/baseController";
import { HttpStatusCode } from "@/lib/httpStatus";

class Controller extends BaseController {
  adminForgetPassword = this.catchAsync(async (req: Request, res: Response) => {
    await ForgetPasswordService.adminForgetPassword(req.body.email);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "We've sent a verification code to your email",
      data: null,
    });
  });

  customerForgetPassword = this.catchAsync(
    async (req: Request, res: Response) => {
      await ForgetPasswordService.customerForgetPassword(req.body.email);
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "We've sent a verification code to your email",
        data: null,
      });
    }
  );
}

export const ForgetPasswordController = new Controller();
