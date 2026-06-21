import { pubClient } from "@/config/redis";
import { OTPEmailTemplates } from "@/email-templates/verification.otp";
import JwtHelper from "@/helpers/jwtHelper";
import { paginationHelpers } from "@/helpers/paginationHelpers";
import { IPaginationOptions } from "@/interfaces/pagination.interfaces";
import { BcryptInstance } from "@/lib/bcrypt";
import { HttpStatusCode } from "@/lib/httpStatus";
import ApiError from "@/middlewares/error";
import { Types } from "mongoose";
import { OTPService } from "../otp/otp.service";
import { UserModel } from "../users/users.model";
import { ADMIN_ENUMS, IAdmin, IChangePassword } from "./admin.interface";
import { AdminModel } from "./admin.model";

class Service {
  async create(data: IAdmin) {
    console.log("[createAdmin] 1. Checking account existence for:", data.email);
    await this.isAlreadyHaveAnAccount(data.email);
    console.log("[createAdmin] 2. Hashing password");
    data.password = await BcryptInstance.hash(data.password);

    console.log("[createAdmin] 3. Creating admin document in MongoDB");
    await AdminModel.create(data);
    console.log("[createAdmin] 4. Admin created successfully");
    // send verification email with OTP
    console.log("[createAdmin] 5. Sending account verification OTP");
    OTPService.sendAccountVerificationOtp(data.name, data.email, "admin").catch(
      (error) => {
        console.error(
          "Failed to send background verification OTP email:",
          error
        );
      }
    );
  }

  async resendVerificationOtp(email: string) {
    const isExist = await AdminModel.findOne({ email });
    if (!isExist) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Your account does not exist. Please create your account"
      );
    }

    if (isExist?.status === "active") {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Your account is already verified. Please login to your account"
      );
    } else if (isExist?.status === "admin_approval") {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Your account is under admin approval. Please wait until you account approved"
      );
    }

    await OTPService.sendAccountVerificationOtp(
      isExist.name,
      isExist.email,
      "admin"
    );
  }

  private async isAlreadyHaveAnAccount(email: string) {
    const admin = await AdminModel.findOne({ email });
    if (admin) {
      throw new ApiError(
        HttpStatusCode.CONFLICT,
        "You have already an account with this email. Please try to login"
      );
    } else {
      return;
    }
  }

  async adminLogin(
    email: string,
    password: string
  ): Promise<{
    token: string;
    refresh_token: string;
    admin: any;
  }> {
    let userRecord = await AdminModel.findOne({ email });
    let isUserModel = false;

    if (!userRecord) {
      userRecord = await UserModel.findOne({ email });
      if (!userRecord) {
        throw new ApiError(
          HttpStatusCode.NOT_FOUND,
          "The account you are trying to login does not exist in our system. Please create an account first"
        );
      }

      if (userRecord.role !== "admin" && userRecord.role !== "moderator") {
        throw new ApiError(
          HttpStatusCode.FORBIDDEN,
          "Only admins and moderators are allowed to login to this panel"
        );
      }

      if (userRecord.status !== "active") {
        throw new ApiError(
          400,
          "Your account is inactive. Please contact support to activate your account"
        );
      }

      isUserModel = true;
    } else {
      const accountStatus = userRecord.status;

      if (accountStatus === ADMIN_ENUMS.INACTIVE) {
        await OTPService.sendAccountVerificationOtp(
          userRecord.name,
          userRecord.email,
          "admin"
        );
        throw new ApiError(
          400,
          "Your account is not verified yet. We've sent a verification email. Please verify to access your account"
        );
      }

      if (accountStatus === ADMIN_ENUMS.ADMIN_APPROVAL) {
        throw new ApiError(
          400,
          "Your account is not approved yet. Please wait until admin approve your account"
        );
      }
    }

    const isPasswordMatched = await BcryptInstance.compare(
      password,
      userRecord.password
    );

    if (!isPasswordMatched) {
      throw new ApiError(
        400,
        "Invalid credentials. Please try with valid credentials"
      );
    }

    return await this.generateLoginCredentials(userRecord._id, isUserModel);
  }

  private async generateLoginCredentials(
    id: Types.ObjectId | string,
    isUserModel: boolean = false
  ): Promise<{
    token: string;
    refresh_token: string;
    admin: any;
  }> {
    let userObj: any;
    if (isUserModel) {
      userObj = await UserModel.findById(id).select({ password: 0 });
    } else {
      userObj = await AdminModel.findById(id).select({ password: 0 });
    }

    if (!userObj) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Account not found in our system."
      );
    }

    const payload = {
      id: userObj._id.toString(),
      email: userObj.email as string,
      role: userObj.role as string,
    };
    const { access_token, refresh_token } = await JwtHelper.generateTokens(
      payload as any
    );

    // Set login session in Redis (7 days = 604800 seconds)
    await pubClient.set(`session:${userObj._id.toString()}`, "active", {
      ex: 604800,
    });

    const responseUser = isUserModel
      ? {
          ...userObj.toObject(),
          image: userObj.profile_picture || "",
          profile_picture: userObj.profile_picture || "",
        }
      : {
          ...userObj.toObject(),
          profile_picture: userObj.image || "",
        };

    return {
      admin: responseUser,
      token: access_token,
      refresh_token,
    };
  }

  async verifyAccount(email: string, otp: number) {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "The account you are trying to login is not exist our system. Please create an admin account first"
      );
    }

    if (admin?.status === "active") {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Your account is already verified. Please login to your account"
      );
    } else if (admin?.status === "admin_approval") {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Your account is under admin approval. Please wait until you account approved"
      );
    }

    await OTPService.verifyOTP(email, otp);

    await AdminModel.updateOne(
      { email },
      { status: ADMIN_ENUMS.ADMIN_APPROVAL }
    );

    return await this.generateLoginCredentials(admin._id);
  }

  async isAdminExist(email: string) {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Admin account was not found"
      );
    }

    return admin;
  }

  async approveAdminAccount(email: string) {
    const isExist = await AdminModel.findOne({ email });
    if (!isExist) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "The admin account was not found!"
      );
    }

    if (isExist.status === ADMIN_ENUMS.ACTIVE) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "The admin account already approved and activated"
      );
    }

    await AdminModel.updateOne({ email }, { status: ADMIN_ENUMS.ACTIVE });

    // send approval mail
    await OTPEmailTemplates.sendAccountApprovalEmail(
      isExist.name,
      isExist.email
    );
  }

  async getLoggedInAdmin(id: string) {
    const admin = await AdminModel.findById(id).select({ password: 0 });
    if (admin) {
      return {
        ...admin.toObject(),
        profile_picture: admin.image || "",
      };
    } else {
      const user = await UserModel.findById(id).select({ password: 0 });
      if (user) {
        return {
          ...user.toObject(),
          image: user.profile_picture || "",
          profile_picture: user.profile_picture || "",
        };
      }
    }
    return null;
  }

  async getAllAdmins(options: IPaginationOptions, search_query: string) {
    const {
      limit = 5,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = paginationHelpers.calculatePagination(options);

    const searchCondition: any = {};
    if (search_query) {
      searchCondition.$or = [
        { name: { $regex: search_query, $options: "i" } },
        { email: { $regex: search_query, $options: "i" } },
        { designation: { $regex: search_query, $options: "i" } },
      ];
    }

    const result = await AdminModel.find({ ...searchCondition })
      .select({ password: 0 })
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminModel.countDocuments(searchCondition);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async getAdminById(id: string) {
    return await AdminModel.findById(id).select({ password: 0 });
  }

  async getAdminByEmail(email: string) {
    return await AdminModel.findOne({ email }).select({ password: 0 });
  }

  async updateAdmin(id: string, data: Partial<IAdmin>) {
    if (data.password) {
      delete data.password;
    }
    await AdminModel.findByIdAndUpdate(id, { ...data });
  }

  async deleteAdmin(id: string) {
    await AdminModel.findByIdAndDelete(id);
  }

  async changePassword(id: string, payload: IChangePassword) {
    const isUserExist = await AdminModel.findById(id);

    if (!isUserExist) {
      throw new ApiError(404, "Admin was not found");
    }

    const isPasswordMatched = await BcryptInstance.compare(
      payload.old_password,
      isUserExist.password
    );

    if (!isPasswordMatched) {
      throw new ApiError(
        409,
        "Old password is incorrect. Please provide the correct old password"
      );
    }

    const isUnchangedPassword = await BcryptInstance.compare(
      payload.new_password,
      isUserExist.password
    );

    if (isUnchangedPassword) {
      throw new ApiError(
        409,
        "Your provided old and new passwords are same. Please provide a different new password"
      );
    }

    const newPassword = await BcryptInstance.hash(payload?.new_password);

    await AdminModel.findByIdAndUpdate(id, {
      password: newPassword,
    });

    // Invalidate login session in Redis
    await pubClient.del(`session:${id}`);
  }

  async resetPassword(data: { email: string; password: string }) {
    const isExist = await AdminModel.findOne({ email: data.email });
    if (!isExist) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Admin was not found!");
    }
    const newPassword = await BcryptInstance.hash(data.password);
    await AdminModel.findByIdAndUpdate(isExist._id, {
      password: newPassword,
    });

    // Invalidate login session in Redis
    await pubClient.del(`session:${isExist._id.toString()}`);
  }
}

export const AdminService = new Service();
