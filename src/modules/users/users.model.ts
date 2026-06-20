import { Schema, model } from "mongoose";
import { IUser } from "./users.interface";
import { ROLES } from "@/constants/roles";
import { schemaOptions } from "@/utils/schemaOptions";
import { AUTH_PROVIDERS, USER_STATUS } from "./users.enum";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, unique: true, index: true },
    phone_number: { type: String, default: null },
    profile_picture: { type: String, default: null },
    email: { type: String, required: true, unique: true, index: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    is_verified: { type: Boolean, default: false },
    has_password: { type: Boolean, default: false },
    // id provider is email then password is required
    password: {
      type: String,
      validate: {
        validator: function (this: IUser, v: string) {
          if (
            this.provider &&
            this.provider === (AUTH_PROVIDERS.EMAIL as string)
          ) {
            return v != null && v.length > 0;
          }
          return true;
        },
        message: "Password is required for email registered users",
      },
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.INACTIVE,
    },
    date_of_birth: { type: Date, default: null },
    driving_license: { type: String, default: null },
    work_place: { type: String, default: null },
    provider: {
      type: String,
      enum: Object.values(AUTH_PROVIDERS) as AUTH_PROVIDERS[],
      default: AUTH_PROVIDERS.EMAIL,
    },
    gender: { type: String, enum: ["male", "female"], default: null },
    last_login_at: { type: Date, default: null },
  },
  schemaOptions
);

export const UserModel = model<IUser>("User", userSchema);
