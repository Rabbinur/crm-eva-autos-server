import { Request, Response } from "express";
import { CustomerService } from "./customer.service";
import BaseController from "@/shared/baseController";
import { HttpStatusCode } from "@/lib/httpStatus";
import pickQueries from "@/shared/pickQueries";
import { paginationFields } from "@/constants/paginationFields";
import { emitter } from "@/events/eventEmitter";

class Controller extends BaseController {
  register = this.catchAsync(async (req: Request, res: Response) => {
    await CustomerService.register(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Your account has been created successfully",
      data: null,
    });
  });

  resendVerificationOtp = this.catchAsync(
    async (req: Request, res: Response) => {
      await CustomerService.resendVerificationOtp(req.body.email);
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message:
          "We've sent a verification otp to your email. Please check the mailbox and verify the account",
        data: null,
      });
    }
  );

  verifyAccount = this.catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const data = await CustomerService.verifyAccount(email, otp);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Your account has been verified and authenticated successfully.",
      data,
    });
  });

  login = this.catchAsync(async (req: Request, res: Response) => {
    const data = await CustomerService.login(req.body);

    // fire event to with guest and user id to check Guest Cart
    emitter.emit("user.logged_in", {
      userId: data.user.id || data.user._id,
      guestId: req.cookies.guest_id,
    });

    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "You have logged in successfully",
      data,
    });
  });

  getLoggedInCustomer = this.catchAsync(async (req: Request, res: Response) => {
    const data = await CustomerService.getLoggedInCustomer(req.user?.id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Customer retrieved successfully",
      data,
    });
  });

  getOrders = this.catchAsync(async (req: Request, res: Response) => {
    const data = await CustomerService.getOrders(req.user?.id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Customer orders retrieved successfully",
      data,
    });
  });

  getOrderCount = this.catchAsync(async (req: Request, res: Response) => {
    const data = await CustomerService.getOrderCount(req.user?.id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Customer orders count retrieved successfully",
      data,
    });
  });

  getCustomerDeliveryAddress = this.catchAsync(
    async (req: Request, res: Response) => {
      const data = await CustomerService.getCustomerDeliveryAddress(
        req.user?.id
      );
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Customer delivery addresses retrieved successfully",
        data,
      });
    }
  );

  update = this.catchAsync(async (req: Request, res: Response) => {
    await CustomerService.update(req.user?.id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Your account is updated successfully",
      data: null,
    });
  });

  changePassword = this.catchAsync(async (req: Request, res: Response) => {
    await CustomerService.changePassword(req.user?.id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Your password successfully",
      data: null,
    });
  });

  resetPassword = this.catchAsync(async (req: Request, res: Response) => {
    await CustomerService.resetPassword(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Your password has been reset successfully",
      data: null,
    });
  });

  addDeliveryAddress = this.catchAsync(async (req: Request, res: Response) => {
    await CustomerService.addDeliveryAddress(req.params.id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Your delivery address added successfully",
      data: null,
    });
  });

  updateDeliveryAddress = this.catchAsync(
    async (req: Request, res: Response) => {
      await CustomerService.updateDeliveryAddress(
        req.params.id,
        req.params.address_id,
        req.body
      );
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Your delivery address updated successfully",
        data: null,
      });
    }
  );

  removeDeliveryAddress = this.catchAsync(
    async (req: Request, res: Response) => {
      await CustomerService.removeDeliveryAddress(
        req.params.id,
        req.params.address_id
      );
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Your delivery address removed successfully",
        data: null,
      });
    }
  );

  getAllCustomers = this.catchAsync(async (req: Request, res: Response) => {
    const options = pickQueries(req.query, paginationFields);
    const result = await CustomerService.getAllCustomers(
      options,
      req.query.status as "inactive" | "active",
      req.query.search_query as string
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Customers retrieved successfully",
      data: result,
    });
  });
}

export const CustomerController = new Controller();
