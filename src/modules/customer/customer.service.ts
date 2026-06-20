import { OTPService } from "../otp/otp.service";
import {
  AUTH_PROVIDERS,
  ICustomer,
  ICustomerDeliveryAddress,
} from "./customer.interface";
import { CustomerModel } from "./customer.model";
import ApiError from "@/middlewares/error";
import { HttpStatusCode } from "@/lib/httpStatus";
import { BcryptInstance } from "@/lib/bcrypt";
import JwtHelper from "@/helpers/jwtHelper";
import { pubClient } from "@/config/redis";
import { IPaginationOptions } from "@/interfaces/pagination.interfaces";
import { paginationHelpers } from "@/helpers/paginationHelpers";
import axios from "axios";


class Service {
  // customer services
  async register(data: ICustomer) {
    const isExist = await CustomerModel.findOne({ email: data.email });

    if (isExist) {
      throw new ApiError(
        HttpStatusCode.CONFLICT,
        "You have already an account with this email. Please login to access you account"
      );
    }

    await OTPService.sendAccountVerificationOtp(
      data.full_name,
      data.email,
      "customer"
    );

    data.password = await BcryptInstance.hash(data.password);
    await CustomerModel.create(data);
  }

  async resendVerificationOtp(email: string) {
    const isExist = await CustomerModel.findOne({ email });
    if (!isExist) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Your account does not exist. Please create your account"
      );
    }

    if (isExist.status === "active") {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Your account is already verified. Please login to your account"
      );
    }

    await OTPService.sendAccountVerificationOtp(
      isExist.full_name,
      isExist.email,
      "customer"
    );
  }

  async verifyAccount(email: string, otp: number) {
    const customer = await CustomerModel.findOne({ email });
    if (!customer) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Your account does not exist. Please create your account"
      );
    }

    if (customer.status === "active") {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Your account is already verified. Please login to your account"
      );
    }

    await OTPService.verifyOTP(email, otp);
    await CustomerModel.updateOne(
      { email },
      { status: "active", last_login_at: new Date() }
    );

    return await this.generateLoginCredentials(customer);
  }

  async login(payload: {
    email: string;
    password: string;
    access_token: string;
  }) {
    if (payload.access_token) {
      return await this.googleLogin(payload.access_token);
    }

    // check user existence
    const isExist = await CustomerModel.findOneAndUpdate(
      { email: payload.email },
      {
        last_login_at: new Date(),
      }
    )
      .select({ delivery_addresses: 0 })
      .lean();
    if (!isExist) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Your account does not exist. Please create your account"
      );
    }

    // check user account verified of not
    if (isExist.status !== "active") {
      // send verification code
      await OTPService.sendAccountVerificationOtp(
        isExist.full_name,
        isExist.email,
        "customer"
      );

      throw new ApiError(
        HttpStatusCode.UNAUTHORIZED,
        "Your account is not verified yet. We've sent a verification code to your email"
      );
    }

    const createdWithSocialProvider =
      isExist.auth_provider !== AUTH_PROVIDERS.EMAIL && !isExist.has_password;

    if (createdWithSocialProvider) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "This account was created using a social login provider. Please sign in using your social account or set a password to enable email/password login."
      );
    }

    if (!isExist.password) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Password is not set for this user. Please sign in using your social account or set a password to enable email/password login."
      );
    }

    const isPasswordMatched = await BcryptInstance.compare(
      payload.password,
      isExist.password
    );

    if (!isPasswordMatched) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Invalid credentials. Please provide valid email and password"
      );
    }

    return this.generateLoginCredentials(isExist);
  }

  async googleLogin(access_token: string) {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const googleUser = response.data;

      if (!googleUser || !googleUser.email) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          "Invalid Google token or email not found"
        );
      }

      const isExist = await CustomerModel.findOne({ email: googleUser.email })
        .select({ delivery_addresses: 0, password: 0 })
        .lean();

      if (isExist) {
        return await this.generateLoginCredentials(isExist);
      } else {
        const userData = {
          full_name: googleUser.name,
          email: googleUser.email,
          status: "active",
          last_login_at: new Date(),
          auth_provider: AUTH_PROVIDERS.GOOGLE,
          has_password: false,
        };
        const newUser = await CustomerModel.create(userData);
        return await this.generateLoginCredentials(newUser);
      }
    } catch (error) {
      console.log(error);
      throw new ApiError(
        HttpStatusCode.UNAUTHORIZED,
        "Google login failed: Invalid or expired token"
      );
    }
  }

  private async generateLoginCredentials(customer: any): Promise<{
    access_token: string;
    refresh_token: string;
    user: ICustomer;
  }> {
    if (!customer) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Your account does not exist. Please create your account"
      );
    }

    const jwtPayload: any = {
      id: customer._id.toString(),
      email: customer.email,
      role: customer.role,
    };

    const { access_token, refresh_token } =
      await JwtHelper.generateTokens(jwtPayload);

    // Set login session in Redis (7 days = 604800 seconds)
    await pubClient.set(`session:${customer._id.toString()}`, "active", { ex: 604800 });

    delete customer.password;
    return {
      user: customer,
      access_token,
      refresh_token,
    };
  }

  async getLoggedInCustomer(id: string) {
    return await CustomerModel.findById(id).select({ password: 0 });
  }

  async getCustomerDeliveryAddress(id: string) {
    const data = await CustomerModel.findById(id).select({ password: 0 });
    return data?.delivery_addresses;
  }

  async update(id: string, data: Partial<ICustomer>) {
    await CustomerModel.findByIdAndUpdate(id, data);
  }

  async changePassword(
    id: string,
    data: { old_password: string; new_password: string }
  ) {
    const isExist = await CustomerModel.findById(id);
    if (!isExist) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Customer was not found!");
    }

    // const isOldPasswordMatched = await BcryptInstance.compare(
    //   data.old_password,
    //   isExist.password
    // );

    // if (!isOldPasswordMatched) {
    //   throw new ApiError(
    //     HttpStatusCode.UNAUTHORIZED,
    //     "You have provided wrong old password"
    //   );
    // }

    // const isSamePassword =
    //   data.old_password.trim() === data.new_password.trim();

    // if (isSamePassword) {
    //   throw new ApiError(
    //     HttpStatusCode.BAD_REQUEST,
    //     "Same password couldn't be changed. Please provide a different password"
    //   );
    // }

    // check new password
    if (!data.new_password) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "New password is required"
      );
    }

    const newPassword = await BcryptInstance.hash(data.new_password);

    await CustomerModel.findByIdAndUpdate(id, { password: newPassword });

    // Invalidate session in Redis
    await pubClient.del(`session:${id}`);
  }

  async resetPassword(data: { email: string; password: string }) {
    const isExist = await CustomerModel.findOne({ email: data.email });
    if (!isExist) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Customer was not found!");
    }
    const newPassword = await BcryptInstance.hash(data.password);
    await CustomerModel.findByIdAndUpdate(isExist._id, {
      password: newPassword,
    });

    // Invalidate session in Redis
    await pubClient.del(`session:${isExist._id.toString()}`);
  }

  async addDeliveryAddress(id: string, newAddress: ICustomerDeliveryAddress) {
    const customer = await CustomerModel.findById(id);
    if (!customer) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Customer account was not found!"
      );
    }

    const addresses = customer.delivery_addresses || [];

    if (addresses.length >= 3) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "You can only add up to 3 delivery addresses."
      );
    }

    const isDuplicate = this.checkDuplicate(addresses, newAddress);
    if (isDuplicate) {
      throw new ApiError(
        HttpStatusCode.CONFLICT,
        "This delivery address already exists."
      );
    }

    const hasDefault = addresses.some((addr) => addr.is_default);

    if (!hasDefault && !newAddress.is_default) {
      newAddress.is_default = true;
    }

    if (newAddress.is_default) {
      await CustomerModel.updateOne(
        { _id: id },
        { $set: { "delivery_addresses.$[].is_default": false } }
      );
    }

    await CustomerModel.findByIdAndUpdate(id, {
      $push: { delivery_addresses: newAddress },
    });
  }

  private checkDuplicate(
    addresses: ICustomerDeliveryAddress[],
    newAddress: ICustomerDeliveryAddress
  ): boolean {
    const normalize = (str: string) => str.trim().toLowerCase();
    const isDuplicate = addresses.some(
      (addr) =>
        normalize(addr.street) === normalize(newAddress.street) &&
        normalize(addr.city) === normalize(newAddress.city) &&
        normalize(addr.state) === normalize(newAddress.state) &&
        normalize(addr.zip_code) === normalize(newAddress.zip_code)
    );

    return isDuplicate;
  }

  async updateDeliveryAddress(
    customer_id: string,
    address_id: string,
    updatedAddress: ICustomerDeliveryAddress
  ) {
    const customer = await CustomerModel.findById(customer_id);
    if (!customer) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Customer account was not found!"
      );
    }

    const addresses = customer.delivery_addresses || [];

    const address = addresses.find(
      (addr: any) => addr._id?.toString() === address_id
    );

    if (!address) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Delivery address not found for this customer."
      );
    }

    const isDuplicate = this.checkDuplicate(
      addresses.filter((a: any) => a._id?.toString() !== address_id),
      updatedAddress
    );

    if (isDuplicate) {
      throw new ApiError(
        HttpStatusCode.CONFLICT,
        "This delivery address already exists."
      );
    }

    const isCurrentDefault = address.is_default === true;

    if (updatedAddress.is_default === true) {
      addresses.forEach((addr) => (addr.is_default = false));
      address.is_default = true;
    } else if (
      isCurrentDefault &&
      updatedAddress.is_default === false &&
      !addresses.some(
        (addr) => addr._id?.toString() !== address_id && addr.is_default
      )
    ) {
      address.is_default = true;
    }

    if (!addresses.some((addr) => addr.is_default)) {
      address.is_default = true;
    }

    const { is_default, ...rest } = updatedAddress;
    console.log({ is_default });
    Object.assign(address, rest);

    await customer.save();
  }

  async removeDeliveryAddress(customer_id: string, address_id: string) {
    const customer = await CustomerModel.findById(customer_id);
    if (!customer) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Customer account was not found!"
      );
    }

    const addresses = customer.delivery_addresses || [];

    const indexToRemove = addresses.findIndex(
      (addr: any) => addr._id?.toString() === address_id
    );

    if (indexToRemove === -1) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Delivery address not found for this customer."
      );
    }

    if (addresses.length === 1) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "You must have at least one delivery address."
      );
    }

    const wasDefault = addresses[indexToRemove].is_default === true;

    addresses.splice(indexToRemove, 1);

    if (wasDefault) {
      addresses.forEach((addr) => (addr.is_default = false));
      addresses[0].is_default = true;
    }

    if (!addresses.some((addr) => addr.is_default)) {
      addresses[0].is_default = true;
    }

    customer.delivery_addresses = addresses;
    await customer.save();
  }

  async getOrders(customer_id: string) {
    return [];
  }

  async getOrderCount(customer_id: string) {
    const customer = await CustomerModel.findById(customer_id);

    if (!customer) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "Customer was not found!");
    }

    return {
      total_orders: 0,
      takeaway: 0,
      reservation: 0,
      delivery: 0,
      catering: 0,
    };
  }

  // admin services
  async getAllCustomers(
    options: IPaginationOptions,
    status: "active" | "inactive",
    search_query: string
  ) {
    const {
      limit = 10,
      page = 1,
      skip,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = paginationHelpers.calculatePagination(options);

    const query: any = {};
    if (search_query) {
      query.$or = [
        { full_name: { $regex: search_query, $options: "i" } },
        { email: { $regex: search_query, $options: "i" } },
        { phone_no: { $regex: search_query, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const customersWithOrders = await CustomerModel.aggregate([
      {
        $match: query,
      },
      {
        $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $addFields: {
          orders: {
            total_reservation: 0,
            total_takeaway: 0,
            total_catering: 0,
            total_delivery: 0,
          },
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    const total = await CustomerModel.countDocuments(query);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: customersWithOrders,
    };
  }
}

export const CustomerService = new Service();
