import { z } from "zod";

const batchValidationSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  batch_id: z.string().optional(),
  packs_added: z
    .number({ required_error: "Packs added is required" })
    .int("Packs added must be an integer"),
  pack_price: z.number({ required_error: "Pack price is required" }),
  packs_total_price: z.number().optional(),
  purchase_rate_carton: z.number({
    required_error: "Purchase rate per carton is required",
  }),
  selling_rate_carton: z.number({
    required_error: "Selling rate per carton is required",
  }),
  dateAdded: z.string().optional(),
});

const createBatchValidationSchema = z.object({
  body: batchValidationSchema,
});

const createProductValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Product name is required" }),
    weight: z.number({ required_error: "Product weight is required" }),
    unit: z.string({ required_error: "Unit is required" }),
    product_summary: z.string().optional(),
    carton_packets: z
      .number({ required_error: "Carton packets quantity is required" })
      .int("Carton packets quantity must be an integer"),
    box_size: z.number().int("Box size must be an integer").optional(),
    company_name: z.string({ required_error: "Company name is required" }),
    category_name: z.string({ required_error: "Category name is required" }),
    lowStockThreshold: z
      .number({ required_error: "Low stock threshold is required" })
      .int("Low stock threshold must be an integer"),
    batches: z.array(batchValidationSchema).optional(),
  }),
});

const updateProductValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    weight: z.number().optional(),
    unit: z.string().optional(),
    product_summary: z.string().optional(),
    carton_packets: z
      .number()
      .int("Carton packets quantity must be an integer")
      .optional(),
    box_size: z.number().int("Box size must be an integer").optional(),
    company_name: z.string().optional(),
    category_name: z.string().optional(),
    lowStockThreshold: z
      .number()
      .int("Low stock threshold must be an integer")
      .optional(),
    batches: z.array(batchValidationSchema).optional(),
  }),
});

export const productValidations = {
  create: createProductValidationSchema,
  update: updateProductValidationSchema,
  addBatch: createBatchValidationSchema,
};
