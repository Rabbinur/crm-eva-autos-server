import { schemaOptions } from "@/utils/schemaOptions";
import { model, Schema } from "mongoose";
import { IArea } from "./area.interface";

const areaSchema = new Schema<IArea>(
  {
    name: { type: String, required: true, unique: true },
    note: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    coverage_radius: {
      type: Number,
      required: true,
      default: 5,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    zoom: {
      type: Number,
      default: 12,
    },
  },
  schemaOptions
);

export const AreaModel = model("Area", areaSchema);
