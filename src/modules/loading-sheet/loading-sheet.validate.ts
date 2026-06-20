import { z } from "zod";

const loadingSheetItemValidationSchema = z.object({
  productId: z.string({ required_error: "Product ID is required" }),
  productName: z.string({ required_error: "Product name is required" }),
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be an integer"),
  purchasePrice: z.number({ required_error: "Purchase price is required" }),
  sellingPrice: z.number({ required_error: "Selling price is required" }),
});

const createLoadingSheetValidationSchema = z.object({
  body: z.object({
    date: z.string({ required_error: "Date is required" }),
    deliveryManName: z.string({
      required_error: "Delivery representative name is required",
    }),
    deliveryManId: z.string({
      required_error: "Delivery representative ID is required",
    }),
    route: z.string().optional(),
    items: z.array(loadingSheetItemValidationSchema, {
      required_error: "Items are required",
    }),
    status: z.enum(["loading", "loaded", "in_transit", "settled"]).optional(),
  }),
});

const updateLoadingSheetValidationSchema = z.object({
  body: z.object({
    date: z.string().optional(),
    deliveryManName: z.string().optional(),
    deliveryManId: z.string().optional(),
    route: z.string().optional(),
    status: z.enum(["loading", "loaded", "in_transit", "settled"]).optional(),
  }),
});

export const loadingSheetValidations = {
  create: createLoadingSheetValidationSchema,
  update: updateLoadingSheetValidationSchema,
};
