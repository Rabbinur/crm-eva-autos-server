import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import BaseController from "@/shared/baseController";
import { HttpStatusCode } from "@/lib/httpStatus";
import pickQueries from "@/shared/pickQueries";
import { paginationFields } from "@/constants/paginationFields";
import { UserModel } from "../users/users.model";
import { AdminModel } from "./admin.model";
import { UserService } from "../users/users.service";
import { AWSFileUploader } from "../aws/uploader";
import ApiError from "@/middlewares/error";

class Controller extends BaseController {
  createAdmin = this.catchAsync(async (req: Request, res: Response) => {
    await AdminService.create(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message:
        "Your admin account has been created. We've sent a verification OTP to your email. Please check mailbox and verify your account",
      data: null,
    });
  });
  resendVerificationOtp = this.catchAsync(
    async (req: Request, res: Response) => {
      await AdminService.resendVerificationOtp(req.body.email);
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
    const data = await AdminService.verifyAccount(email, otp);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message:
        "Your account has been verified successfully. Please wait until admin approve your account",
      data,
    });
  });

  approveAdminAccount = this.catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    await AdminService.approveAdminAccount(email);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "The admin account has been activated successfully.",
      data: null,
    });
  });

  adminLogin = this.catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const data = await AdminService.adminLogin(email, password);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "You've logged in successfully.",
      data,
    });
  });

  getLoggedInAdmin = this.catchAsync(async (req: Request, res: Response) => {
    const data = await AdminService.getLoggedInAdmin(req.user?.id as string);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Admin retrieved successfully.",
      data,
    });
  });

  getAllAdmins = this.catchAsync(async (req: Request, res: Response) => {
    const options = pickQueries(req.query, paginationFields);
    const data = await AdminService.getAllAdmins(
      options,
      req.query.search_query as string
    );
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Admins retrieved successfully",
      data: data,
    });
  });

  getAdminById = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await AdminService.getAdminById(id);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Admin retrieved successfully",
      data: data,
    });
  });

  getAdminByEmail = this.catchAsync(async (req: Request, res: Response) => {
    const email = req.params.email;
    const data = await AdminService.getAdminByEmail(email);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Admin retrieved successfully",
      data: data,
    });
  });

  updateAdmin = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await AdminService.updateAdmin(id, req.body);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Admin updated successfully",
      data: null,
    });
  });

  deleteAdmin = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await AdminService.deleteAdmin(id);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Admin deleted successfully",
      data: null,
    });
  });

  changePassword = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await AdminService.changePassword(id, req.body);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Your password has been changed successfully",
      data: null,
    });
  });

  resetPassword = this.catchAsync(async (req: Request, res: Response) => {
    await AdminService.resetPassword(req.body);
    this.sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "Your password has been reset successfully",
      data: null,
    });
  });

  updateLoggedInAdmin = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.user?.id as string;
    const file = req.file;
    const updateData = { ...req.body };

    // Find if it's an admin or user
    const admin = await AdminModel.findById(id);
    const user = !admin ? await UserModel.findById(id) : null;

    if (!admin && !user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "User or Admin not found");
    }

    let profilePictureUrl = "";
    if (file) {
      profilePictureUrl = await AWSFileUploader.uploadSingleFile(
        file,
        "profile"
      );
    }

    if (admin) {
      if (profilePictureUrl) {
        // Delete old image if it exists
        if (admin.image) {
          try {
            await AWSFileUploader.deleteSingleFile(admin.image);
          } catch (err) {
            console.error("Error deleting old profile image:", err);
          }
        }
        updateData.image = profilePictureUrl;
      }

      const updatedAdmin = await AdminModel.findByIdAndUpdate(id, updateData, {
        new: true,
      }).select({ password: 0 });

      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Profile updated successfully",
        data: {
          ...updatedAdmin?.toObject(),
          profile_picture: updatedAdmin?.image || "",
        },
      });
    } else if (user) {
      if (profilePictureUrl) {
        // Delete old image if it exists
        if (user.profile_picture) {
          try {
            await AWSFileUploader.deleteSingleFile(user.profile_picture);
          } catch (err) {
            console.error("Error deleting old profile image:", err);
          }
        }
        updateData.profile_picture = profilePictureUrl;
      }

      const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
        new: true,
      }).select({ password: 0 });

      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Profile updated successfully",
        data: {
          ...updatedUser?.toObject(),
          image: updatedUser?.profile_picture || "",
          profile_picture: updatedUser?.profile_picture || "",
        },
      });
    }
  });

  changeLoggedInAdminPassword = this.catchAsync(
    async (req: Request, res: Response) => {
      const id = req.user?.id;
      const { current_password, new_password } = req.body;

      const admin = await AdminModel.findById(id);
      if (admin) {
        await AdminService.changePassword(id, {
          old_password: current_password,
          new_password,
        });
      } else {
        await UserService.changePassword(id, {
          old_password: current_password,
          new_password,
        });
      }

      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Your password has been changed successfully",
        data: null,
      });
    }
  );
}

export const AdminController = new Controller();
