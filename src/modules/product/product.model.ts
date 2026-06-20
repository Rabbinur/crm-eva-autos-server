import { model, Schema } from "mongoose";
import { IBatch, IProduct } from "./product.interface";
import { schemaOptions } from "@/utils/schemaOptions";

export function generateBatchId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BAT-${code}`;
}

const batchSchema = new Schema<IBatch>({
  id: { type: String },
  batch_id: { type: String, default: generateBatchId },
  packs_added: { type: Number, required: true },
  hold_qty: { type: Number, default: 0 },
  pack_price: { type: Number, required: true },
  packs_total_price: { type: Number },
  purchase_rate_carton: { type: Number, required: true },
  selling_rate_carton: { type: Number, required: true },
  dateAdded: { type: Date, default: Date.now },
});

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    unit: { type: String, required: true },
    product_summary: { type: String },
    carton_packets: { type: Number, required: true },
    box_size: { type: Number },
    company_name: { type: String, required: true },
    category_name: { type: String, required: true },
    lowStockThreshold: { type: Number, required: true },
    batches: { type: [batchSchema], default: [] },
  },
  {
    ...schemaOptions,
    optimisticConcurrency: true,
  }
);

export const ProductModel = model("Product", productSchema);
