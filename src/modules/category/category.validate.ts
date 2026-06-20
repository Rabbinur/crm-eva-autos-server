import { z } from "zod";

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Category name is required" }),
    company_name: z.string({ required_error: "Company name is required" }),
    status: z.enum(["Active", "Inactive"]).optional(),
  }),
});

const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    company_name: z.string().optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
  }),
});

export const categoryValidations = {
  create: createCategoryValidationSchema,
  update: updateCategoryValidationSchema,
};
