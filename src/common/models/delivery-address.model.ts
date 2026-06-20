import { ICustomerDeliveryAddress } from "@/modules/customer/customer.interface";
import { schemaOptions } from "@/utils/schemaOptions";
import { Schema } from "mongoose";

export const deliveryAddressSchema = new Schema<ICustomerDeliveryAddress>(
  {
    label: { type: String },
    street: { type: String },
    area: { type: String },
    city: { type: String },
    state: { type: String },
    zip_code: { type: String },
    country: { type: String },
    instructions: { type: String },
    is_default: { type: Boolean, default: false },
    full_address: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  schemaOptions
);

deliveryAddressSchema.pre("save", function (next) {
  const parts = [
    this.street,
    this.area,
    this.city,
    this.state,
    this.zip_code,
    this.country,
  ]
    .filter(Boolean)
    .map((p: any) => p.trim());

  this.full_address = parts.join(", ");

  next();
});

deliveryAddressSchema.virtual("computed_full_address").get(function () {
  const parts = [
    this.street,
    this.area,
    this.city,
    this.state,
    this.zip_code,
    this.country,
  ];
  return parts.filter(Boolean).join(", ");
});
