import { model, Schema } from "mongoose";
import { IDamageRecord, IDamageRecordItem } from "./damage-record.interface";
import { schemaOptions } from "@/utils/schemaOptions";

export function generateDamageNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DMG-${code}`;
}

const damageRecordItemSchema = new Schema<IDamageRecordItem>({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  product_name: { type: String, required: true },
  batch_id: { type: String, required: true },
  qty: { type: Number, required: true },
  purchase_price: { type: Number, required: true },
  loss_amount: { type: Number, required: true },
});

const damageRecordSchema = new Schema<IDamageRecord>(
  {
    damage_number: {
      type: String,
      unique: true,
      default: generateDamageNumber,
    },
    source_type: {
      type: String,
      enum: [
        "Delivery Settlement",
        "Warehouse",
        "Expired",
        "Supplier Return",
        "Customer Return",
      ],
      required: true,
    },
    source_reference_id: { type: Schema.Types.ObjectId },
    created_by: { type: String, required: true },
    approved_by: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Disposed"],
      default: "Pending",
    },
    damage_date: { type: String, required: true },
    damage_reason: { type: String },
    qty: { type: Number, required: true },
    loss_amount: { type: Number, required: true },
    items: { type: [damageRecordItemSchema], required: true },
  },
  schemaOptions
);

export const DamageRecordModel = model<IDamageRecord>(
  "DamageRecord",
  damageRecordSchema
);
