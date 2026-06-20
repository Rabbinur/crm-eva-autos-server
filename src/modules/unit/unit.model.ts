import { model, Schema } from "mongoose";
import { IUnit } from "./unit.interface";
import { schemaOptions } from "@/utils/schemaOptions";

const unitSchema = new Schema<IUnit>(
  {
    name: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  schemaOptions
);

export const UnitModel = model("Unit", unitSchema);
