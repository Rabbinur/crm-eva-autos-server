import { Types } from "mongoose";
import { AUTH_PROVIDERS } from "./users.enum";
import { IRoles } from "@/constants/roles";

export type IUser = {
  id: Types.ObjectId;
  _id: Types.ObjectId;
  name: string;
  username: string; // auto generated from name
  user_id: string;
  phone_number?: string;
  profile_picture?: string;
  email: string;
  role: IRoles;
  is_verified?: boolean;
  password?: string;
  has_password?: boolean;
  status: IUserStatus;
  provider: AUTH_PROVIDERS;
  date_of_birth?: Date;
  gender?: "male" | "female";
  last_login_at?: Date;
  driving_license?: string;
  work_place?: string;
};

type IUserStatus = "inactive" | "active" | "banned";

export type IUserFilters = {
  role: IRoles;
  status: "inactive" | "active";
};
