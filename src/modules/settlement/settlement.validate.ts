import { z } from "zod";

const settlementItemValidationSchema = z.object({
  productId: z.string({ required_error: "Product ID is required" }),
  productName: z.string({ required_error: "Product name is required" }),
  loadedQuantity: z
    .number({ required_error: "Loaded quantity is required" })
    .int("Loaded quantity must be an integer"),
  soldQuantity: z
    .number({ required_error: "Sold quantity is required" })
    .int("Sold quantity must be an integer"),
  returnedQuantity: z
    .number({ required_error: "Returned quantity is required" })
    .int("Returned quantity must be an integer"),
  damagedQuantity: z
    .number({ required_error: "Damaged quantity is required" })
    .int("Damaged quantity must be an integer"),
  freeQuantity: z.number().int("Free quantity must be an integer").optional(),
  purchasePrice: z.number({ required_error: "Purchase price is required" }),
  sellingPrice: z.number({ required_error: "Selling price is required" }),
});

const createSettlementValidationSchema = z.object({
  body: z.object({
    date: z.string({ required_error: "Date is required" }),
    deliveryManName: z.string({
      required_error: "Delivery representative name is required",
    }),
    deliveryManId: z.string({
      required_error: "Delivery representative ID is required",
    }),
    route: z.string().optional(),
    loadingSheetId: z.string({
      required_error: "Loading sheet ID is required",
    }),
    totalLoaded: z
      .number({ required_error: "Total loaded pieces quantity is required" })
      .int("Total loaded pieces must be an integer"),
    totalSold: z
      .number({ required_error: "Total sold pieces quantity is required" })
      .int("Total sold pieces must be an integer"),
    totalReturned: z
      .number({ required_error: "Total returned pieces quantity is required" })
      .int("Total returned pieces must be an integer"),
    totalDamaged: z
      .number({ required_error: "Total damaged pieces quantity is required" })
      .int("Total damaged pieces must be an integer"),
    totalSales: z.number({ required_error: "Total sales value is required" }),
    totalProfit: z.number({ required_error: "Total net profit is required" }),
    totalLoss: z.number({ required_error: "Total loss value is required" }),
    status: z.enum(["finalized"]).optional(),
    items: z.array(settlementItemValidationSchema, {
      required_error: "Items are required",
    }),
  }),
});

export const settlementValidations = {
  create: createSettlementValidationSchema,
};
