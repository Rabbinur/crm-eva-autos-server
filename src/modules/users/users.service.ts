import ApiError from "@/middlewares/error";
import { IUser, IUserFilters } from "./users.interface";
import { UserModel } from "./users.model";
import { HttpStatusCode } from "@/lib/httpStatus";
import { BcryptInstance } from "@/lib/bcrypt";
import mongoose, { Types } from "mongoose";
import { IChangePassword } from "@/interfaces/common.interface";
import { emitter } from "@/events/eventEmitter";
import { IPaginationOptions } from "@/interfaces/pagination.interfaces";
import { paginationHelpers } from "@/helpers/paginationHelpers";
import { userSearchableFields } from "./users.constants";
import { AUTH_PROVIDERS, USER_STATUS } from "./users.enum";
import { IRoles, ROLES } from "@/constants/roles";
import { IDGeneratorService } from "@/utils/id-generators";
import { generateUserName } from "@/utils/generateUserName";

class Service {
  async create(data: IUser) {
    const isExist = await UserModel.findOne({
      email: data.email,
    });

    if (isExist) {
      throw new ApiError(
        HttpStatusCode.CONFLICT,
        `Already have an account with this email. Please login or create account with different email`
      );
    }

    // generate username
    if (data?.email) {
      data.username = generateUserName(data.email) ?? "";
    }

    data.user_id = IDGeneratorService.userIDGenerator(data.role);

    if (data.password) {
      data.password = await BcryptInstance.hash(data.password);
      data.has_password = true;
    }

    const user = await UserModel.create(data);
    return user;
  }

  async createFromGoogleAuth(data: IUser): Promise<IUser> {
    const isExist = await UserModel.findOne({
      email: data.email,
    });

    if (isExist) {
      return isExist;
    }

    return await UserModel.create(data);
  }

  async createFromAppleAuth(data: {
    name: string;
    email: string;
  }): Promise<IUser> {
    const isExist = await UserModel.findOne({
      email: data.email,
    });

    if (isExist) {
      return isExist;
    }

    const payload: any = {
      name: data.name,
      username: generateUserName(data.name || ""),
      user_id: IDGeneratorService.userIDGenerator("client" as IRoles),
      email: data.email,
      profile_picture: null,
      has_password: false,
      role: ROLES.CUSTOMER as IRoles,
      status: USER_STATUS.ACTIVE as USER_STATUS,
      provider: AUTH_PROVIDERS.APPLE,
      is_verified: true,
    };

    return await UserModel.create(payload);
  }

  async getLoggedInUser(id: string) {
    const user = await UserModel.findById(id).select({ password: 0 });

    if (!user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "User was not found!");
    }

    if (user?.status === USER_STATUS.BANNED) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Your account has been banned.  You can't access your account. Please contact to support team to activate your account"
      );
    }

    return user;
  }

  async getAllUsers(
    options: IPaginationOptions,
    filters: IUserFilters,
    search_query: string
  ) {
    const {
      limit = 10,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = paginationHelpers.calculatePagination(options);

    const { role, status } = filters;

    const andConditions: any = [];

    // search
    if (search_query) {
      andConditions.push({
        $or: userSearchableFields.map((field: string) => {
          return {
            [field]: {
              $regex: search_query,
              $options: "i",
            },
          };
        }),
      });
    }

    // filters
    if (role) {
      andConditions.push({
        role,
      });
    }

    if (status) {
      andConditions.push({
        status,
      });
    }
    const whereConditions =
      andConditions.length > 0 ? { $and: andConditions } : {};

    const result = await UserModel.find(whereConditions)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .select({ password: 0 });

    const total = await UserModel.countDocuments(whereConditions);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async changePassword(id: string, data: IChangePassword) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "User was not found!");
    }

    if (!user.password) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "User does not have password to change. Please try to create/set password"
      );
    }

    const isPasswordMatched = await BcryptInstance.compare(
      data.old_password,
      user?.password
    );

    if (!isPasswordMatched) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Your old password is wrong. Please provide your correct password"
      );
    }

    const isSamePassword = await BcryptInstance.compare(
      data.new_password,
      user.password
    );

    if (isSamePassword) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Same password couldn't be changed. Please provide a different password"
      );
    }

    const newPassword = await BcryptInstance.hash(data.new_password);

    await UserModel.findByIdAndUpdate(user._id, { password: newPassword });
  }

  async updateProfilePicture(
    id: Types.ObjectId | string,
    profile_picture: string
  ) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "User was not found!");
    }

    const result = await UserModel.findByIdAndUpdate(
      user._id,
      { profile_picture },
      { new: true }
    ).select({ password: 0 });

    // emit event to delete old image from AWS
    if (user?.profile_picture) {
      console.log("[UserService] Delete old profile picture", user?.name);
      emitter.emit("s3.file.deleted", user?.profile_picture);
    } else {
      console.log(
        "[UserService] User has no old profile picture: ",
        user?.name
      );
    }

    return result;
  }

  async getUserByIdWithPassword(id: string | Types.ObjectId) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "User was not found");
    }
    return user;
  }

  async getUserByIdWithoutPassword(id: string | Types.ObjectId) {
    const user = await UserModel.findById(id).select({ password: 0 });
    if (!user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "User was not found");
    }
    return user;
  }

  async getUserByDynamicKeyValue(
    key: keyof IUser,
    value: string | number
  ): Promise<IUser | null> {
    return await UserModel.findOne({ [key]: value });
  }

  async getUserByEmailOrPhoneNumber(credential: string) {
    return await UserModel.findOne({
      $or: [{ phone_number: credential }, { email: credential }],
    });
  }

  async getUserById(id: Types.ObjectId) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "User was not found");
    }
    return user;
  }

  async getUserByIdWithSession(
    id: Types.ObjectId,
    session: mongoose.mongo.ClientSession
  ) {
    return await UserModel.findById(id).session(session);
  }

  async getUserByEmail(email: string) {
    return await UserModel.findOne({ email });
  }

  async getUserByUserId(user_id: string) {
    return await UserModel.findOne({ user_id });
  }

  async updateUserById(id: string | Types.ObjectId, data: Partial<IUser>) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "User not found");
    }

    if (data.password) {
      data.password = await BcryptInstance.hash(data.password);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
    }).select({ password: 0 });

    return updatedUser;
  }

  async activateAccount(user_id: string) {
    const user = await UserModel.findOne({ user_id });
    if (!user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "User not found");
    }

    // check if user already activated and verified or not
    if (user.is_verified && user.status === "active") {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "User account already activated & verified"
      );
    }

    // Now, activate and verify (update) the user
    return await UserModel.findByIdAndUpdate(
      user._id,
      {
        is_verified: true,
        status: USER_STATUS.ACTIVE,
      },
      { new: true }
    );
  }

  async deleteAccount(id: Types.ObjectId) {
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "User was not found");
    }
    return { id };
  }

  async setPassword(email: string, password: string) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "User was not found");
    }

    if (user.has_password) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "User already has a password. Please use change password to update your password"
      );
    }

    const hashedPassword = await BcryptInstance.hash(password);

    await UserModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      has_password: true,
    });
  }
}

export const UserService = new Service();
