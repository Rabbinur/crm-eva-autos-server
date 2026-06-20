import { model, Schema } from "mongoose";
import { IDamageRecord } from "./settlement.interface";
import { schemaOptions } from "@/utils/schemaOptions";

const damageRecordSchema = new Schema<IDamageRecord>(
  {
    batch_id: { type: Schema.Types.ObjectId, required: true },
    qty: { type: Number, required: true },
    purchase_price: { type: Number, required: true },
    loss_amount: { type: Number, required: true },
  },
  schemaOptions
);

export const DamageRecordModel = model<IDamageRecord>(
  "DamageRecord",
  damageRecordSchema
);
