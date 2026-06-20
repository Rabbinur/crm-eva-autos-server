import { model, Schema } from "mongoose";
import { IDeliveryMan } from "./delivery-man.interface";
import { schemaOptions } from "@/utils/schemaOptions";

const deliveryManSchema = new Schema<IDeliveryMan>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    nid: { type: String, required: true },
    address: { type: String, required: true },
    profile: { type: String },
  },
  schemaOptions
);

export const DeliveryManModel = model("DeliveryMan", deliveryManSchema);
