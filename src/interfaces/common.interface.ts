import { IRoles } from "@/constants/roles";
import { IUser } from "@/modules/users/users.interface";
import { Types } from "mongoose";

export type IOrderVariant = {
  id: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
};

export type IOrderItem = {
  id: Types.ObjectId;
  name: string;
  price: number;
  thumbnail?: string;
  quantity: number;
  variants?: IOrderVariant[];
};

export type IAddonOrderItem = {
  id: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
};

export type IDeliveryOrderEmailTemplate = {
  customer_name: string;
  customer_email: string;
  total_amount: number;
  payment_status: string;
  delivery_date: string;
  delivery_time: string;
  order_tracking_id: string;
};

export type ITakeawayOrderEmailTemplate = {
  customer_name: string;
  customer_email: string;
  total_amount: number;
  payment_status: string;
  order_tracking_id: string;
};

export type IReserveOrderEmailTemplate = {
  customer_name: string;
  customer_email: string;
  total_amount: number;
  reservation_date: string;
  reservation_time: string;
  number_of_guests: number;
  payment_status: string;
  order_tracking_id: string;
};

export type ICateringOrderEmailTemplate = {
  customer_name: string;
  customer_email: string;
  payment_status: string;
  event_date: string;
  event_location: string;
  event_type: string;
  number_of_guests: number;
  starting_time: string;
  order_tracking_id: string;
};

export type IJWtPayload = {
  id: Types.ObjectId;
  name: string;
  email: string;
  username: string;
  phone_number: string;
  profile_picture: string;
  user_id: string;
  role: IRoles;
};

export type IChangePassword = {
  old_password: string;
  new_password: string;
};

export type ILoginCredentials = {
  email: string;
  password: string;
};

export type IResetPassword = {
  user_id: string;
  password: string;
};

export type ILoginResponse = {
  access_token: string;
  refresh_token: string;
  user: IUser;
};

export type IGenericErrorMessage = {
  path: string | number;
  message: string;
};

export type IOrderMessageUser = {
  id: number | string;
  name: string;
  email: string;
  role: string;
  user_id: string;
  profile_picture: string;
};

export type ISocketOrderPayload = {
  _id: Types.ObjectId;
  order_id: number;
  customer_phone_no: string;
  customer_name: string;
  total_items: number;
  total_addons: number;
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  number_of_guests?: number;
};
