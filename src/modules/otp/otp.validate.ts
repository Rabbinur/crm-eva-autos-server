import z from "zod";

export const resendOtp = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
  }),
});

const verifyOtp = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email. Please provide a valid email" }),
    otp: z.coerce.number({
      required_error: "otp must be provided",
      invalid_type_error: "otp must be number",
    }),
  }),
});

export const otpValidations = { resendOtp, verifyOtp };
