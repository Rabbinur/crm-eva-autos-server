import { z } from "zod";

const createCompanyValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Company name is required" }),
    contact: z.string().optional(),
    address: z.string().optional(),
    logo: z.string().optional().nullable(),
    status: z.enum(["Active", "Inactive"]).optional(),
  }),
});

const updateCompanyValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    contact: z.string().optional(),
    address: z.string().optional(),
    logo: z.string().optional().nullable(),
    status: z.enum(["Active", "Inactive"]).optional(),
  }),
});

export const companyValidations = {
  create: createCompanyValidationSchema,
  update: updateCompanyValidationSchema,
};
