import { z } from "zod";

const createDeliveryManValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    phone: z.string({ required_error: "Phone is required" }),
    status: z.enum(["active", "inactive"]).optional(),
    nid: z.string({ required_error: "NID is required" }),
    address: z.string({ required_error: "Address is required" }),
    profile: z.string().optional(),
  })
});

const updateDeliveryManValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    nid: z.string().optional(),
    address: z.string().optional(),
    profile: z.string().optional(),
  })
});

export const deliveryManValidations = {
  create: createDeliveryManValidationSchema,
  update: updateDeliveryManValidationSchema,
};
