import z from "zod";

const create = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    image: z.string().url("Invalid image URL").optional(),
    role: z.string().optional(),
    status: z.enum(["inactive", "admin_approval", "active"]).optional(),
    designation: z.string().optional(),
    bio: z.string().optional(),
  }),
});

const update = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().optional(),
    password: z.string().min(6).optional(),
    image: z.string().url().optional(),
    role: z.string().optional(),
    status: z.enum(["inactive", "admin_approval", "active"]).optional(),
    designation: z.string().optional(),
    bio: z.string().optional(),
  }),
});

const approveAccount = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email. Please provide a valid email" }),
  }),
});

const login = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email. Please provide a valid email" }),
    password: z.string({
      required_error: "Password must be provided",
    }),
  }),
});
const changePassword = z.object({
  body: z.object({
    old_password: z.string({
      required_error: "Old Password must be provided",
    }),
    new_password: z.string({
      required_error: "New Password must be provided",
    }),
  }),
});

export const adminValidations = {
  create,
  update,
  approveAccount,
  login,
  changePassword,
};
