import { customerDeliveryAddressValidationSchema } from "@/common/validation";
import z from "zod";

export const register = z.object({
  body: z
    .object({
      full_name: z
        .string({ required_error: "Full name is required" })
        .min(1, "Full name cannot be empty"),
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email format"),
      phone_no: z.string().optional(),
      date_of_birth: z.string().optional(),
      password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters"),
      delivery_addresses: z
        .array(customerDeliveryAddressValidationSchema)
        .optional(),
    })
    .strict(),
});

export const update = z.object({
  body: z
    .object({
      full_name: z.string().optional(),
      phone_no: z.string().optional(),
      date_of_birth: z.string().optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.full_name !== undefined ||
        data.phone_no !== undefined ||
        data.date_of_birth !== undefined,
      {
        message: "At least one field is required",
        path: [],
      }
    ),
});

export const changePassword = z.object({
  body: z
    .object({
      old_password: z.string({ required_error: "old_password is required" }),
      new_password: z.string({ required_error: "new_password is required" }),
    })
    .strict(),
});

export const login = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export const customerValidations = { register, login, update, changePassword };
