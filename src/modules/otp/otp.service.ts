import ApiError from "@/middlewares/error";
import { ADMIN_ENUMS } from "../admin/admin.interface";
import { AdminModel } from "../admin/admin.model";
import { pubClient } from "@/config/redis";
import { HttpStatusCode } from "@/lib/httpStatus";
import { OTPEmailTemplates } from "@/email-templates/verification.otp";

class Service {
  async sendAccountVerificationOtp(
    name: string,
    email: string,
    account_type: "admin" | "customer"
  ) {
    const isExist = await pubClient.get(`otp:${email}`);
    if (isExist) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "We've already sent an OTP to your email. Please check your email and verify your account"
      );
    }

    if (account_type === "admin") {
      const admin = await AdminModel.findOne({ email });
      if (admin) {
        if (admin.status === ADMIN_ENUMS.ACTIVE) {
          throw new ApiError(
            HttpStatusCode.BAD_REQUEST,
            "Your account already activated"
          );
        }
        if (admin.status === ADMIN_ENUMS.ADMIN_APPROVAL) {
          throw new ApiError(
            HttpStatusCode.BAD_REQUEST,
            "Your account already verified and still under approval stage. Please wait until your account approved and activated"
          );
        }
      }
    }

    const otp = await this.generateOtp();
    await pubClient.set(`otp:${email}`, otp.toString(), { ex: 120 });
    console.log(
      `A new account registered. New otp ${otp} has been sent to ${email}`
    );

    try {
      // send email to verify account
      await OTPEmailTemplates.accountVerificationOtp({ name, email, otp });
    } catch (error) {
      await pubClient.del(`otp:${email}`);
      throw error;
    }
  }

  async verifyOTP(email: string, otp: number) {
    const storedOtp = await pubClient.get(`otp:${email}`);

    if (!storedOtp) {
      throw new ApiError(
        HttpStatusCode.NOT_FOUND,
        "Your otp verification time has been expired. Please resend otp"
      );
    }

    if (Number(storedOtp) !== Number(otp)) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "Your provided otp was wrong. Please try with correct otp"
      );
    }

    // Clean up OTP key after successful verification
    await pubClient.del(`otp:${email}`);
  }

  async sendForgetPasswordOtp(name: string, email: string) {
    const isExist = await pubClient.get(`otp:${email}`);
    if (isExist) {
      throw new ApiError(
        HttpStatusCode.BAD_REQUEST,
        "We've already sent an OTP to your email. Please check your email and verify your account"
      );
    }

    // generate otp
    const otp = await this.generateOtp();
    await pubClient.set(`otp:${email}`, otp.toString(), { ex: 120 });

    try {
      // send email
      await OTPEmailTemplates.accountVerificationOtp({ name, email, otp });
    } catch (error) {
      await pubClient.del(`otp:${email}`);
      throw error;
    }
  }

  private async generateOtp(): Promise<number> {
    return Math.floor(100000 + Math.random() * 900000);
  }
}

export const OTPService = new Service();
