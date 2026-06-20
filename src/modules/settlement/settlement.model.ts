import { model, Schema } from "mongoose";
import { ISettlement, ISettlementItem } from "./settlement.interface";
import { schemaOptions } from "@/utils/schemaOptions";

const settlementItemSchema = new Schema<ISettlementItem>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  loadedQuantity: { type: Number, required: true },
  soldQuantity: { type: Number, required: true },
  returnedQuantity: { type: Number, required: true },
  damagedQuantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
});

export function generateSettlementInvoiceNo(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SET-${code}`;
}

const settlementSchema = new Schema<ISettlement>(
  {
    invoiceNo: {
      type: String,
      unique: true,
      default: generateSettlementInvoiceNo,
    },
    loadingSheetInvoiceNo: { type: String },
    date: { type: String, required: true },
    deliveryManName: { type: String, required: true },
    deliveryManId: { type: String, required: true },
    route: { type: String },
    loadingSheetId: { type: String, required: true },
    totalLoaded: { type: Number, required: true },
    totalSold: { type: Number, required: true },
    totalReturned: { type: Number, required: true },
    totalDamaged: { type: Number, required: true },
    totalSales: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
    totalLoss: { type: Number, required: true },
    status: { type: String, enum: ["finalized"], default: "finalized" },
    items: { type: [settlementItemSchema], required: true },
  },
  schemaOptions
);

export const SettlementModel = model("Settlement", settlementSchema);
