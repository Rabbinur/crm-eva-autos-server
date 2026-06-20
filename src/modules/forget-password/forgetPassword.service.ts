import ApiError from "@/middlewares/error";
import { AdminModel } from "../admin/admin.model";
import { CustomerModel } from "../customer/customer.model";
import { OTPService } from "../otp/otp.service";
import { HttpStatusCode } from "@/lib/httpStatus";

class Service {
  async adminForgetPassword(email: string) {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Your account was not found!"
      );
    }
    await OTPService.sendForgetPasswordOtp(admin.name, admin.email);
  }

  async customerForgetPassword(email: string) {
    const customer = await CustomerModel.findOne({ email });
    if (!customer) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Your account was not found!"
      );
    }
    await OTPService.sendForgetPasswordOtp(customer.full_name, customer.email);
  }
}

export const ForgetPasswordService = new Service();
