import { ROLES } from "@/constants/roles";
import { JwtInstance } from "@/lib/jwt";
import { Router } from "express";
import { CustomerRoutes } from "./customer.routes";

const router = Router();

router.use(
  "/customer",
  JwtInstance.authenticate([ROLES.CUSTOMER]),
  CustomerRoutes
);

export const AppRoutes = router;
