import { envConfig } from "@/config/index";
import { HttpStatusCode } from "@/lib/httpStatus";
import ApiError from "@/middlewares/error";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

class Mail {
  async sendEmail(
    subject: string,
    to: string | string[],
    htmlContent: string,
    bcc?: string[],
    cc?: string[]
  ) {
    const transporter = nodemailer.createTransport({
      host: envConfig.email.host,
      port: envConfig.email.port,
      secure: true,
      auth: {
        user: envConfig.email.user,
        pass: envConfig.email.pass,
      },
    });

    const mailOptions: SMTPTransport.Options = {
      from: `kamrul's <${envConfig.email.user}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    if (bcc) {
      mailOptions.bcc = bcc;
    }

    if (cc) {
      mailOptions.cc = cc;
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `[EmailService] ✅ Email sent to:${to}, MailId:${info.messageId}`
      );
    } catch (error: any) {
      console.error(`[EmailService] ❌ Failed: ${error.message}`);
      throw new ApiError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "Failed to send email. Please try again later."
      );
    }
  }
}

export const MailService = new Mail();
