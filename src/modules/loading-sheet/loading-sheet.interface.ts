import { Types } from "mongoose";

export type ILoadingSheetItem = {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  soldQuantity?: number;
  returnedQuantity?: number;
  damagedQuantity?: number;
  freeQuantity?: number;
};

export type ILoadingSheet = {
  _id?: Types.ObjectId;
  id?: string;
  invoice_no?: string;
  delivery_man_id: string;
  delivery_man_name: string;
  status: "loading" | "loaded" | "in_transit" | "settled";
  loading_date: Date;
  settlement_date?: Date;
  route?: string;
  items?: ILoadingSheetItem[];
};

export type ILoadingSheetDetail = {
  _id?: Types.ObjectId;
  id?: string;
  loading_sheet_id: Types.ObjectId;
  product_id: string;
  product_name: string;
  batch_id: Types.ObjectId;
  loaded_qty: number;
  sold_qty: number;
  returned_qty: number;
  damaged_qty: number;
  free_qty: number;
  purchase_price: number;
  selling_price: number;
};
