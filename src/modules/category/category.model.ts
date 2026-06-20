import { model, Schema } from "mongoose";
import { ICategory } from "./category.interface";
import { schemaOptions } from "@/utils/schemaOptions";

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    company_name: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  schemaOptions
);

categorySchema.index({ name: 1, company_name: 1 }, { unique: true });

export const CategoryModel = model("Category", categorySchema);
