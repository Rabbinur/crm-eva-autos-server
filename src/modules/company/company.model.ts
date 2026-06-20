import { model, Schema } from "mongoose";
import { ICompany } from "./company.interface";
import { schemaOptions } from "@/utils/schemaOptions";

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true },
    contact: { type: String },
    address: { type: String },
    logo: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  schemaOptions
);

export const CompanyModel = model("Company", companySchema);
