export type IBatch = {
  _id?: any;
  id?: string;
  batch_id?: string;
  packs_added: number;
  hold_qty?: number;
  pack_price: number;
  packs_total_price?: number;
  purchase_rate_carton: number;
  selling_rate_carton: number;
  dateAdded: Date;
};

export type IProduct = {
  name: string;
  weight: number;
  unit: string;
  product_summary: string;
  carton_packets: number;
  box_size?: number;
  company_name: string;
  category_name: string;
  lowStockThreshold: number;
  batches: IBatch[];
};
