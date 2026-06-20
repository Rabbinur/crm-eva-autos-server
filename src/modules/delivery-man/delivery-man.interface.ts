export type IDeliveryMan = {
  name: string;
  phone: string;
  status: "active" | "inactive";
  nid: string;
  address: string;
  profile?: string;
};
