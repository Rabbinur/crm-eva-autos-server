import { OrderEmailTemplates } from "./order.mails";
import { envConfig } from "../config";
import { IReserveOrderEmailTemplate } from "@/interfaces/common.interface";
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
      return "Your Reservation Has Been Successfully Placed";
    case "confirmed":
      return "Your Reservation Has Been Confirmed";
    case "cancelled":
      return "Your Reservation Has Been Cancelled";
    case "completed":
      return "Your Reservation Has Been Completed";
    default:
      return "Reservation Update";
  }
};

const generateReservationEmail = (
  status: "placed" | "confirmed" | "cancelled" | "completed",
  data: IReserveOrderEmailTemplate
): string => {
  return OrderEmailTemplates.generate({
    customer_name: data.customer_name,
    order_type: "reservation",
    status,
    total_amount: data.total_amount,
    payment_status: data.payment_status,
    reservation_date: data.reservation_date,
    reservation_time: data.reservation_time,
    guests: data.number_of_guests,
    tracking_url: `${frontend}/track-order/reservation/${data.order_tracking_id}`,
  });
};

const sendEmail = async (
  status: "placed" | "confirmed" | "cancelled" | "completed",
  data: IReserveOrderEmailTemplate
) => {
  const subject = getSubjectByStatus(status);
  const htmlContent = generateReservationEmail(status, data);

  return await MailService.sendEmail(
    subject,
    data.customer_email,
    htmlContent,
    [envConfig.google.app_user],
    [envConfig.google.app_user]
  );
};

const reservationPlacedEmailTemplate = async (
  data: IReserveOrderEmailTemplate
) => await sendEmail("placed", data);

const reservationConfirmedEmailTemplate = async (
  data: IReserveOrderEmailTemplate
) => await sendEmail("confirmed", data);

const reservationCancelledEmailTemplate = async (
  data: IReserveOrderEmailTemplate
) => await sendEmail("cancelled", data);

const reservationCompletedEmailTemplate = async (
  data: IReserveOrderEmailTemplate
) => await sendEmail("completed", data);

export const ReservationEmailTemplates = {
  placed: reservationPlacedEmailTemplate,
  confirmed: reservationConfirmedEmailTemplate,
  cancelled: reservationCancelledEmailTemplate,
  completed: reservationCompletedEmailTemplate,
};
