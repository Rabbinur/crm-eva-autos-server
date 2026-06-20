import { Schema, model } from "mongoose";
import { AUTH_PROVIDERS, ICustomer } from "./customer.interface";
import { ROLES } from "@/constants/roles";
import { schemaOptions } from "@/utils/schemaOptions";
import { deliveryAddressSchema } from "@/common/models/delivery-address.model";

const customerSchema = new Schema<ICustomer>(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone_no: { type: String, default: null },
    date_of_birth: { type: String, default: null },
    role: { type: String, default: ROLES.CUSTOMER },

    delivery_addresses: { type: [deliveryAddressSchema], default: [], max: 3 },

    password: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    last_login_at: { type: Date, default: null },
    auth_provider: {
      type: String,
      enum: Object.values(AUTH_PROVIDERS),
      default: AUTH_PROVIDERS.EMAIL,
    },
    has_password: { type: Boolean, default: true },
  },
  schemaOptions
);

export const CustomerModel = model<ICustomer>("Customer", customerSchema);
