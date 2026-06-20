import { Types } from "mongoose";

export enum AUTH_PROVIDERS {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  GITHUB = "github",
  EMAIL = "email",
  APPLE = "apple",
  TWITTER = "twitter",
  LINKEDIN = "linkedin",
  INSTAGRAM = "instagram",
}

export type ICustomerDeliveryAddress = {
  _id: Types.ObjectId;
  label: string; // e.g., "Home", "Work"
  street: string;
  area?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  full_address: string;
  instructions?: string;
  location: {
    lat: number;
    lng: number;
  };
  is_default?: boolean;
};

export type ICustomer = {
  _id: Types.ObjectId;
  id: Types.ObjectId;
  full_name: string;
  email: string;
  phone_no: string;
  date_of_birth?: string;
  role: string;

  delivery_addresses?: ICustomerDeliveryAddress[];

  password: string;
  status?: "inactive" | "active";
  last_login_at: Date;
  auth_provider: AUTH_PROVIDERS;
  has_password: boolean;
};
