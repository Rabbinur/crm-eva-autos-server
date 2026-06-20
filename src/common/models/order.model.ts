import { Schema } from "mongoose";
import {
  IAddonOrderItem,
  IOrderItem,
  IOrderVariant,
} from "../../interfaces/common.interface";

const orderVariantSchema = new Schema<IOrderVariant>(
  {
    id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

export const orderItemSchema = new Schema<IOrderItem>(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number },
    price: { type: Number },
    variants: {
      type: [orderVariantSchema],
      required: false,
      default: [],
    },
  },
  { _id: false }
);

export const orderAddonSchema = new Schema<IAddonOrderItem>(
  {
    id: { type: Schema.Types.ObjectId, required: true, ref: "Addon" },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);
