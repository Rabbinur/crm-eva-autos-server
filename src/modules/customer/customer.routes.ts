import { Router } from "express";
import { CustomerController } from "./customer.controller";
import { customerValidations } from "./customer.validate";
import { otpValidations } from "../otp/otp.validate";
import validateRequest from "@/middlewares/validateRequest";
import verifyToken from "@/middlewares/verifyToken";
import { ROLES } from "@/constants/roles";
import {
  customerDeliveryAddressValidationSchema,
  updateCustomerDeliveryAddressValidationSchema,
} from "@/common/validation";

const router = Router();

// customer routes
router.post(
  "/",
  validateRequest(customerValidations.register),
  CustomerController.register
);

router.post(
  "/verify",
  validateRequest(otpValidations.verifyOtp),
  CustomerController.verifyAccount
);

router.post(
  "/resend-otp",
  validateRequest(otpValidations.resendOtp),
  CustomerController.resendVerificationOtp
);

router.post("/login", CustomerController.login);

router.get(
  "/auth",
  verifyToken([ROLES.CUSTOMER]),
  CustomerController.getLoggedInCustomer
);

router.get(
  "/orders",
  // verifyToken([ROLES.CUSTOMER]),
  CustomerController.getOrders
);

router.get(
  "/orders/count",
  verifyToken([ROLES.CUSTOMER]),
  CustomerController.getOrderCount
);

router.get(
  "/delivery-address",
  verifyToken([ROLES.CUSTOMER]),
  CustomerController.getCustomerDeliveryAddress
);

router.patch(
  "/",
  verifyToken([ROLES.CUSTOMER]),
  validateRequest(customerValidations.update),
  CustomerController.update
);

router.patch(
  "/change-password",
  verifyToken([ROLES.CUSTOMER]),
  CustomerController.changePassword
);

router.patch(
  "/reset-password",
  validateRequest(customerValidations.login),
  CustomerController.resetPassword
);

router.post(
  "/:id/add-delivery-address",
  verifyToken([ROLES.CUSTOMER]),
  validateRequest(customerDeliveryAddressValidationSchema),
  CustomerController.addDeliveryAddress
);

router.patch(
  "/:id/update-delivery-address/:address_id",
  verifyToken([ROLES.CUSTOMER]),
  validateRequest(updateCustomerDeliveryAddressValidationSchema),
  CustomerController.updateDeliveryAddress
);

router.delete(
  "/:id/delete-delivery-address/:address_id",
  verifyToken([ROLES.CUSTOMER]),
  CustomerController.removeDeliveryAddress
);

// admins routes
router.get("/", verifyToken([ROLES.ADMIN]), CustomerController.getAllCustomers);

export const CustomerRoutes = router;
