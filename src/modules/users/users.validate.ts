import z from "zod";
import { AUTH_PROVIDERS, USER_STATUS } from "./users.enum";
import { ROLES } from "@/constants/roles";

const create = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: "Name is required",
          invalid_type_error: "Name must be string/text",
        })
        .min(3, "Name must be at least 3 characters"),

      phone_number: z.string().nullable().optional(),

      profile_picture: z.string().nullable().optional(),

      email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Please provide a valid email" }),

      provider: z
        .enum([...Object.values(AUTH_PROVIDERS)] as [string, ...string[]])
        .default(AUTH_PROVIDERS.EMAIL),

      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(15, "Password must be less than 15 characters")
        .optional(),

      status: z
        .enum([...Object.values(USER_STATUS)] as [string, ...string[]])
        .default(USER_STATUS.ACTIVE),

      date_of_birth: z.string().nullable().optional(),

      gender: z.enum(["male", "female"]).nullable().optional(),
    })
    .strict()
    // Conditional password validation: required if provider = email
    .refine(
      (data) => {
        if (data.provider === AUTH_PROVIDERS.EMAIL) {
          return !!data.password && data.password.length > 0;
        }
        return true;
      },
      {
        message: "Password is required for email registered users",
        path: ["password"],
      }
    ),
});

const createUserByAdmin = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: "Name is required",
          invalid_type_error: "Name must be string/text",
        })
        .min(3, "Name must be at least 3 characters"),

      phone_number: z.string({
        required_error: "Phone number is required",
        invalid_type_error: "Phone number mus be string",
      }),

      profile_picture: z.string().nullable().optional(),

      email: z
        .string({ required_error: "Email is required" })
        .email({ message: "Please provide a valid email" }),

      provider: z
        .enum([...Object.values(AUTH_PROVIDERS)] as [string, ...string[]])
        .default(AUTH_PROVIDERS.EMAIL),

      role: z.enum(Object.values(ROLES) as [string, ...string[]], {}),

      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(15, "Password must be less than 15 characters"),
      status: z
        .enum([...Object.values(USER_STATUS)] as [string, ...string[]])
        .default(USER_STATUS.ACTIVE),

      date_of_birth: z.string().nullable().optional(),

      gender: z.enum(["male", "female"]).nullable().optional(),
    })
    .strict()
    // Conditional password validation: required if provider = email
    .refine(
      (data) => {
        if (data.provider === AUTH_PROVIDERS.EMAIL) {
          return !!data.password && data.password.length > 0;
        }
        return true;
      },
      {
        message: "Password is required for email registered users",
        path: ["password"],
      }
    ),
});

const updateUser = z.object({
  body: z
    .object({
      name: z.string().optional(),

      phone_number: z.string().optional(),

      profile_picture: z.string().optional(),

      email: z.string().optional(),

      role: z
        .enum(Object.values(ROLES) as [string, ...string[]], {})
        .optional(),

      provider: z
        .enum([...Object.values(AUTH_PROVIDERS)] as [string, ...string[]])
        .optional(),

      password: z.string().optional(),
      status: z
        .enum([...Object.values(USER_STATUS)] as [string, ...string[]])
        .optional(),

      date_of_birth: z.string().optional(),

      gender: z.enum(["male", "female"]).optional(),
    })
    .strict(),
});

const setPassword = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Please provide a valid email" }),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(15, "Password must be less than 15 characters"),
  }),
});

export const UserValidations = {
  create,
  createUserByAdmin,
  updateUser,
  setPassword,
};
