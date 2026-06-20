import { OrderEmailTemplates } from "./order.mails";
import { envConfig } from "../config";
import { ICateringOrderEmailTemplate } from "@/interfaces/common.interface";
import { MailService } from "@/config/email";

const frontend =
  envConfig.app.env === "development"
    ? envConfig.clients.public_dev
    : envConfig.clients.public_prod;

const getSubjectByStatus = (
  status: "placed" | "confirmed" | "cancelled" | "completed"
): string => {
  switch (status) {
    case "placed":
      return "Your Catering Order Has Been Successfully Placed";
    case "confirmed":
      return "Your Catering Order Has Been Confirmed";
    case "cancelled":
      return "Your Catering Order Has Been Cancelled";
    case "completed":
      return "Your Catering Order Has Been Completed";
    default:
      return "Catering Order Update";
  }
};

const generateCateringOrderEmail = (
  status: "placed" | "confirmed" | "cancelled" | "completed",
  data: ICateringOrderEmailTemplate
): string => {
  return OrderEmailTemplates.generate({
    customer_name: data.customer_name,
    order_type: "catering",
    status,
    payment_status: data.payment_status,
    tracking_url: `${frontend}/track-order/catering/${data.order_tracking_id}`,
    event_date: data.event_date,
    event_location: data.event_location || "",
    event_type: data.event_type || "",
    starting_time: data.starting_time || "",
    guests: data.number_of_guests,
    total_amount: 0,
  });
};

const sendEmail = async (
  status: "placed" | "confirmed" | "cancelled" | "completed",
  data: ICateringOrderEmailTemplate
) => {
  const subject = getSubjectByStatus(status);
  const htmlContent = generateCateringOrderEmail(status, data);

  return await MailService.sendEmail(
    subject,
    data.customer_email,
    htmlContent,
    [envConfig.google.app_user],
    [envConfig.google.app_user]
  );
};

const cateringOrderPlacedEmailTemplate = async (
  data: ICateringOrderEmailTemplate
) => await sendEmail("placed", data);

const cateringOrderConfirmedEmailTemplate = async (
  data: ICateringOrderEmailTemplate
) => await sendEmail("confirmed", data);

const cateringOrderCancelledEmailTemplate = async (
  data: ICateringOrderEmailTemplate
) => await sendEmail("cancelled", data);

const cateringOrderCompletedEmailTemplate = async (
  data: ICateringOrderEmailTemplate
) => await sendEmail("completed", data);

export const CateringEmailTemplates = {
  placed: cateringOrderPlacedEmailTemplate,
  confirmed: cateringOrderConfirmedEmailTemplate,
  cancelled: cateringOrderCancelledEmailTemplate,
  completed: cateringOrderCompletedEmailTemplate,
};
