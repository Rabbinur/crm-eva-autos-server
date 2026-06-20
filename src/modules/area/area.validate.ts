import { z } from "zod";

const createAreaValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Area name is required" }),
    note: z.string().optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
    coverage_radius: z.number({
      required_error: "Coverage radius is required",
    }),
    latitude: z.number({ required_error: "Latitude is required" }),
    longitude: z.number({ required_error: "Longitude is required" }),
    zoom: z.number().optional(),
  }),
});

const updateAreaValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    note: z.string().optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
    coverage_radius: z.number().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    zoom: z.number().optional(),
  }),
});

export const areaValidations = {
  create: createAreaValidationSchema,
  update: updateAreaValidationSchema,
};
