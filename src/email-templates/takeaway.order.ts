import { OrderEmailTemplates } from "./order.mails";
import { envConfig } from "../config";
import { ITakeawayOrderEmailTemplate } from "@/interfaces/common.interface";
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
      return "Your Takeaway Order Has Been Successfully Placed";
    case "confirmed":
      return "Your Takeaway Order Has Been Confirmed";
    case "cancelled":
      return "Your Takeaway Order Has Been Cancelled";
    case "completed":
      return "Your Takeaway Order Has Been Completed";
    default:
      return "Takeaway Order Update";
  }
};

const generateTakeawayOrderEmail = (
  status: "placed" | "confirmed" | "cancelled" | "completed",
  data: ITakeawayOrderEmailTemplate
): string => {
  return OrderEmailTemplates.generate({
    customer_name: data.customer_name,
    order_type: "takeaway",
    status,
    total_amount: data.total_amount,
    payment_status: data.payment_status,
    tracking_url: `${frontend}/track-order/takeaway/${data.order_tracking_id}`,
  });
};

const sendEmail = async (
  status: "placed" | "confirmed" | "cancelled" | "completed",
  data: ITakeawayOrderEmailTemplate
) => {
  const subject = getSubjectByStatus(status);
  const htmlContent = generateTakeawayOrderEmail(status, data);

  return await MailService.sendEmail(
    subject,
    data.customer_email,
    htmlContent,
    [envConfig.google.app_user],
    [envConfig.google.app_user]
  );
};

const takeawayOrderPlacedEmailTemplate = async (
  data: ITakeawayOrderEmailTemplate
) => await sendEmail("placed", data);

const takeawayOrderConfirmedEmailTemplate = async (
  data: ITakeawayOrderEmailTemplate
) => await sendEmail("confirmed", data);

const takeawayOrderCancelledEmailTemplate = async (
  data: ITakeawayOrderEmailTemplate
) => await sendEmail("cancelled", data);

const takeawayOrderCompletedEmailTemplate = async (
  data: ITakeawayOrderEmailTemplate
) => await sendEmail("completed", data);

export const TakeawayEmailTemplates = {
  placed: takeawayOrderPlacedEmailTemplate,
  confirmed: takeawayOrderConfirmedEmailTemplate,
  cancelled: takeawayOrderCancelledEmailTemplate,
  completed: takeawayOrderCompletedEmailTemplate,
};
