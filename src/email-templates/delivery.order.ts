import { OrderEmailTemplates } from "./order.mails";
import { envConfig } from "../config";
import { IDeliveryOrderEmailTemplate } from "@/interfaces/common.interface";
import { MailService } from "@/config/email";

const frontend =
  envConfig.app.env === "development"
    ? envConfig.clients.public_dev
    : envConfig.clients.public_prod;

const getSubjectByStatus = (
  status:
    | "placed"
    | "confirmed"
    | "cancelled"
    | "in_transit"
    | "delivered"
    | "returned"
): string => {
  switch (status) {
    case "placed":
      return "Your Delivery Order Has Been Successfully Placed";
    case "confirmed":
      return "Your Delivery Order Has Been Confirmed";
    case "cancelled":
      return "Your Delivery Order Has Been Cancelled";
    case "in_transit":
      return "Your Delivery Order Is On The Way";
    case "delivered":
      return "Your Delivery Order Has Been Delivered";
    case "returned":
      return "Your Delivery Order Has Been Returned";
    default:
      return "Delivery Order Update";
  }
};

const generateDeliveryOrderEmail = (
  status:
    | "placed"
    | "confirmed"
    | "cancelled"
    | "in_transit"
    | "delivered"
    | "returned",
  data: IDeliveryOrderEmailTemplate
): string => {
  return OrderEmailTemplates.generate({
    customer_name: data.customer_name,
    order_type: "delivery",
    status,
    total_amount: data.total_amount,
    payment_status: data.payment_status,
    delivery_date: data.delivery_date,
    delivery_time: data.delivery_time,
    tracking_url: `${frontend}/track-order/delivery/${data.order_tracking_id}`,
  });
};

const sendEmail = async (
  status:
    | "placed"
    | "confirmed"
    | "cancelled"
    | "in_transit"
    | "delivered"
    | "returned",
  data: IDeliveryOrderEmailTemplate
) => {
  const subject = getSubjectByStatus(status);
  const htmlContent = generateDeliveryOrderEmail(status, data);

  return await MailService.sendEmail(
    subject,
    data.customer_email,
    htmlContent,
    [envConfig.google.app_user],
    [envConfig.google.app_user]
  );
};

const foodDeliveryOrderPlacedEmailTemplate = async (
  data: IDeliveryOrderEmailTemplate
) => await sendEmail("placed", data);

const foodDeliveryOrderConfirmedEmailTemplate = async (
  data: IDeliveryOrderEmailTemplate
) => await sendEmail("confirmed", data);

const foodDeliveryOrderCancelledEmailTemplate = async (
  data: IDeliveryOrderEmailTemplate
) => await sendEmail("cancelled", data);

const foodDeliveryOrderInTransitEmailTemplate = async (
  data: IDeliveryOrderEmailTemplate
) => await sendEmail("in_transit", data);

const foodDeliveryOrderDeliveredEmailTemplate = async (
  data: IDeliveryOrderEmailTemplate
) => await sendEmail("delivered", data);

const foodDeliveryOrderReturnedEmailTemplate = async (
  data: IDeliveryOrderEmailTemplate
) => await sendEmail("returned", data);

export const FoodDeliveryEmailTemplates = {
  placed: foodDeliveryOrderPlacedEmailTemplate,
  confirmed: foodDeliveryOrderConfirmedEmailTemplate,
  cancelled: foodDeliveryOrderCancelledEmailTemplate,
  in_transit: foodDeliveryOrderInTransitEmailTemplate,
  delivered: foodDeliveryOrderDeliveredEmailTemplate,
  returned: foodDeliveryOrderReturnedEmailTemplate,
};
