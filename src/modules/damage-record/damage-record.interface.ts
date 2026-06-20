import { Types } from "mongoose";

export type IDamageRecordItem = {
  product_id: Types.ObjectId | string;
  product_name: string;
  batch_id: string; // The sub-document batch _id or batch_id string (e.g. BAT-XXXXXX)
  qty: number;
  purchase_price: number;
  loss_amount: number;
};

export type IDamageRecord = {
  _id?: Types.ObjectId;
  id?: string;
  damage_number: string;
  source_type:
    | "Delivery Settlement"
    | "Warehouse"
    | "Expired"
    | "Supplier Return"
    | "Customer Return";
  source_reference_id?: Types.ObjectId | string;
  created_by: string;
  approved_by?: string;
  status: "Pending" | "Approved" | "Rejected" | "Disposed";
  damage_date: string; // date in format YYYY-MM-DD
  damage_reason?: string;
  qty: number; // sum of items qty
  loss_amount: number; // sum of items loss_amount
  items: IDamageRecordItem[];
  createdAt?: Date;
  updatedAt?: Date;
};
