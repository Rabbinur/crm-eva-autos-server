import z from "zod";

export const forgetPasswordValidation = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email. Please provide a valid email" }),
  }),
});
