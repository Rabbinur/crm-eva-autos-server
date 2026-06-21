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
    const port = Number(envConfig.email.port);
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: envConfig.email.host,
      port: port,
      secure: secure,
      auth: {
        user: envConfig.email.user,
        pass: envConfig.email.pass,
      },
      // tls: {
      //   rejectUnauthorized: false,
      // },
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
    console.log("sending email to", to);
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `[EmailService] ✅ Email sent to:${to}, MailId:${info.messageId}`
      );
    } catch (error: any) {
      console.error(`[EmailService] ❌ Failed: ${error.message}`);
      console.log({ emailError: error });
      throw new ApiError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "Failed to send email. Please try again later."
      );
    }
  }
}

export const MailService = new Mail();
