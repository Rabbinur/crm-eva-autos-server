import { Types } from "mongoose";

export type ISettlementItem = {
  productId: string;
  productName: string;
  loadedQuantity: number;
  soldQuantity: number;
  returnedQuantity: number;
  damagedQuantity: number;
  freeQuantity?: number;
  purchasePrice: number;
  sellingPrice: number;
};

export type ISettlement = {
  _id?: Types.ObjectId;
  id?: string;
  invoiceNo?: string;
  loadingSheetInvoiceNo?: string;
  date: string;
  deliveryManName: string;
  deliveryManId: string;
  route?: string;
  loadingSheetId: string;
  totalLoaded: number;
  totalSold: number;
  totalReturned: number;
  totalDamaged: number;
  totalSales: number;
  totalProfit: number;
  totalLoss: number;
  status: "finalized";
  items: ISettlementItem[];
};

export type ISaleBatchDetail = {
  _id?: Types.ObjectId;
  id?: string;
  sale_id: Types.ObjectId;
  batch_id: Types.ObjectId;
  qty: number;
  purchase_price: number;
  selling_price: number;
  revenue: number;
  cost: number;
  profit: number;
};

export type IDamageRecord = {
  _id?: Types.ObjectId;
  id?: string;
  batch_id: Types.ObjectId;
  qty: number;
  purchase_price: number;
  loss_amount: number;
};
