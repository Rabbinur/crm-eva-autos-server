import { model, Schema } from "mongoose";
import { IAdmin } from "./admin.interface";
import { schemaOptions } from "@/utils/schemaOptions";

const adminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
    },
    bio: {
      type: String,
    },
    role: {
      type: String,
      default: "admin",
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ["inactive", "admin_approval", "active"],
      default: "inactive",
    },
    phone_number: {
      type: String,
      default: null,
    },
    driving_license: {
      type: String,
      default: null,
    },
    work_place: {
      type: String,
      default: null,
    },
    date_of_birth: {
      type: Date,
      default: null,
    },
  },
  schemaOptions
);

export const AdminModel = model("Admin", adminSchema);
