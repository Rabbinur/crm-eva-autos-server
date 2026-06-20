import { model, Schema } from "mongoose";
import { ISaleBatchDetail } from "./settlement.interface";
import { schemaOptions } from "@/utils/schemaOptions";

const saleBatchDetailSchema = new Schema<ISaleBatchDetail>(
  {
    sale_id: {
      type: Schema.Types.ObjectId,
      ref: "Settlement",
      required: true,
    },
    batch_id: { type: Schema.Types.ObjectId, required: true },
    qty: { type: Number, required: true },
    purchase_price: { type: Number, required: true },
    selling_price: { type: Number, required: true },
    revenue: { type: Number, required: true },
    cost: { type: Number, required: true },
    profit: { type: Number, required: true },
  },
  schemaOptions
);

export const SaleBatchDetailModel = model<ISaleBatchDetail>(
  "SaleBatchDetail",
  saleBatchDetailSchema
);
