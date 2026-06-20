export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  CHEF: "chef",
  WAITER: "waiter",
  CASHIER: "cashier",
  CUSTOMER: "customer",
  DELIVERYMAN: "deliveryman",
  MODERATOR: "moderator",
  CLIENT: "client",
};

export type IRoles = (typeof ROLES)[keyof typeof ROLES];
