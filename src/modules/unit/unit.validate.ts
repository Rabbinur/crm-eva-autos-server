import { z } from "zod";

const createUnitValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Unit name is required" }),
    status: z.enum(["Active", "Inactive"]).optional(),
  })
});

const updateUnitValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
  })
});

export const unitValidations = {
  create: createUnitValidationSchema,
  update: updateUnitValidationSchema,
};
