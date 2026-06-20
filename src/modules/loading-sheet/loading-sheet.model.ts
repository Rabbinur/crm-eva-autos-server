import { model, Schema } from "mongoose";
import { ILoadingSheet, ILoadingSheetDetail } from "./loading-sheet.interface";
import { schemaOptions } from "@/utils/schemaOptions";

export function generateInvoiceNo(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `INV-${code}`;
}

const loadingSheetSchema = new Schema<ILoadingSheet>(
  {
    invoice_no: { type: String, unique: true, default: generateInvoiceNo },
    delivery_man_id: { type: String, required: true },
    delivery_man_name: { type: String, required: true },
    status: {
      type: String,
      enum: ["loading", "loaded", "in_transit", "settled"],
      default: "loading",
    },
    loading_date: { type: Date, default: Date.now },
    settlement_date: { type: Date },
    route: { type: String },
  },
  schemaOptions
);

const loadingSheetDetailSchema = new Schema<ILoadingSheetDetail>(
  {
    loading_sheet_id: {
      type: Schema.Types.ObjectId,
      ref: "LoadingSheet",
      required: true,
    },
    product_id: { type: String, required: true },
    product_name: { type: String, required: true },
    batch_id: { type: Schema.Types.ObjectId, required: true },
    loaded_qty: { type: Number, required: true },
    sold_qty: { type: Number, default: 0 },
    returned_qty: { type: Number, default: 0 },
    damaged_qty: { type: Number, default: 0 },
    free_qty: { type: Number, default: 0 },
    purchase_price: { type: Number, required: true },
    selling_price: { type: Number, required: true },
  },
  schemaOptions
);

export const LoadingSheetModel = model<ILoadingSheet>(
  "LoadingSheet",
  loadingSheetSchema
);
export const LoadingSheetDetailModel = model<ILoadingSheetDetail>(
  "LoadingSheetDetail",
  loadingSheetDetailSchema
);
