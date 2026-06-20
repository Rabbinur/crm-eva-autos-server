import { MailService } from "@/config/email";
import { envConfig } from "../config";

class Templates {
  private wrapper(content: string) {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #1f2937; margin: 0; line-height: 1.6;">
        <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <!-- Navy Blue Gradient Header -->
          <div style="background: linear-gradient(135deg, #0a192f 0%, #172a45 100%); padding: 35px 30px; text-align: center; border-bottom: 3px solid #ef1f26;">
            <!-- Company Logo Area -->
            <div style="margin-bottom: 5px;">
              <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1px; font-family: sans-serif;">
                🍽️ Kamrul's<span style="color: #ef1f26;">HUB</span>
              </span>
              <div style="font-size: 10px; color: #8892b0; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; margin-top: 4px;">
                Distributor Network
              </div>
            </div>
          </div>

          <!-- Body Content Wrapper -->
          <div style="padding: 40px 30px; background-color: #ffffff;">
            ${content}
          </div>

          <!-- Support & Security Section -->
          <div style="background-color: #f9fafb; padding: 25px 30px; border-top: 1px solid #f3f4f6; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
              Need help? Contact our distributor support team at 
              <a href="mailto:rabbinur.cse.bubt@gmail.com" style="color: #ef1f26; text-decoration: none; font-weight: 600;">support@munchhub.com</a>
            </p>
          </div>

          <!-- Footer Links & Branding -->
          <div style="text-align: center; padding: 30px 20px; font-size: 12px; color: #9ca3af; background-color: #f9fafb;">
            <div style="margin-bottom: 15px;">
              <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Privacy Policy</a> | 
              <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Terms of Service</a> | 
              <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Support</a>
            </div>
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Kamrul Hub. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; color: #d1d5db;">This is an automated operational email from kamrul's Distributor CRM.</p>
          </div>
        </div>
      </div>
    `;
  }

  private generateOTPVerification(data: {
    name: string;
    email: string;
    otp: number;
    purpose?: string;
    expires_in_minutes?: number;
  }) {
    const { name, otp, purpose, expires_in_minutes = 2 } = data;

    const title = purpose ? `OTP for ${purpose}` : `OTP Verification`;

    const content = `
      <!-- Verification Badge -->
      <div style="text-align: center; margin-bottom: 25px;">
        <span style="background-color: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; display: inline-block; border: 1px solid #a7f3d0; text-align: center;">
          🔒 SECURE VERIFICATION CODE
        </span>
      </div>

      <h3 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700; text-align: center;">Hello, ${name}</h3>
      <p style="color: #4b5563; font-size: 14px; text-align: center; margin-bottom: 30px; line-height: 1.5;">
        You requested a verification code to complete your <strong>${purpose || "account action"}</strong>. Please use the secure code below:
      </p>

      <!-- Modern OTP Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
        <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;">
          Your One-Time Password
        </div>
        <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; color: #0f172a; margin: 10px 0; display: inline-block; text-align: center;">
          ${otp}
        </div>
        <div style="font-size: 12px; color: #ef1f26; font-weight: 500; margin-top: 10px;">
          ⏳ Valid for ${expires_in_minutes} minutes
        </div>
      </div>

      <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 20px;">
        For security, do not share this code with anyone, including kamrul's staff.
      </p>
    `;

    return { html: this.wrapper(content), subject: title };
  }

  async accountVerificationOtp(data: {
    name: string;
    email: string;
    otp: number;
    expires_in_minutes?: number;
  }) {
    const { html, subject } = this.generateOTPVerification({
      ...data,
      purpose: "Account Verification",
    });

    await MailService.sendEmail(subject, data.email, html);
  }

  async resetPasswordVerificationOtp(data: {
    name: string;
    email: string;
    otp: number;
    expires_in_minutes?: number;
  }) {
    const { html, subject } = this.generateOTPVerification({
      ...data,
      purpose: "Password Reset",
    });

    await MailService.sendEmail(subject, data.email, html);
  }

  async sendAccountApprovalEmail(name: string, email: string) {
    const adminDashboard =
      envConfig.app.env === "development"
        ? envConfig.clients.admin_dev
        : envConfig.clients.admin_prod;
    const subject = "Your Admin Account Has Been Approved";

    const content = `
      <!-- Verification Badge / Icon -->
      <div style="text-align: center; margin-bottom: 25px;">
        <span style="background-color: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; display: inline-block; border: 1px solid #a7f3d0; text-align: center;">
          ✅ ACCOUNT ACTIVATED
        </span>
      </div>

      <h3 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700; text-align: center;">Congratulations, ${name}!</h3>
      
      <p style="color: #4b5563; font-size: 14px; text-align: center; margin-bottom: 30px; line-height: 1.6;">
        Your administrator account has been successfully approved by the system administration team. You now have full access to manage the kamrul's distributor portal.
      </p>

      <!-- Professional CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${adminDashboard}" style="background-color: #ef1f26; color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
          Launch Admin Dashboard
        </a>
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 25px;">
        You can bookmark this dashboard link for easy future access.
      </p>
    `;

    const html = this.wrapper(content);
    await MailService.sendEmail(subject, email, html);
  }
}

export const OTPEmailTemplates = new Templates();
