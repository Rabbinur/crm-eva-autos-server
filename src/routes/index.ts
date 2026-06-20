import express from "express";
import { AdminRoutes } from "@/modules/admin/admin.route";
import { AuthAdminRoutes } from "@/modules/admin/auth-admin.route";
import { OTPRoutes } from "@/modules/otp/otp.route";
import { CustomerRoutes } from "@/modules/customer/customer.routes";
import { ForgetPasswordRoutes } from "@/modules/forget-password/forgetPassword.routes";
import { StatisticsRoutes } from "@/modules/statistics/statistics.routes";
import { UserAdminRoutes } from "@/modules/users/routes/admin.routes";
import { CategoryRoutes } from "@/modules/category/category.routes";
import { ProductRoutes } from "@/modules/product/product.routes";
import { UnitRoutes } from "@/modules/unit/unit.routes";
import { CompanyRoutes } from "@/modules/company/company.routes";
import { DeliveryManRoutes } from "@/modules/delivery-man/delivery-man.routes";
import { LoadingSheetRoutes } from "@/modules/loading-sheet/loading-sheet.routes";
import { SettlementRoutes } from "@/modules/settlement/settlement.routes";
import { AreaRoutes } from "@/modules/area/area.routes";
import { DamageRecordRoutes } from "@/modules/damage-record/damage-record.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth/admin",
    route: AuthAdminRoutes,
  },
  {
    path: "/admin/users",
    route: UserAdminRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/otp",
    route: OTPRoutes,
  },
  {
    path: "/customer",
    route: CustomerRoutes,
  },
  {
    path: "/forget-password",
    route: ForgetPasswordRoutes,
  },
  {
    path: "/statistics",
    route: StatisticsRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/products",
    route: ProductRoutes,
  },
  {
    path: "/units",
    route: UnitRoutes,
  },
  {
    path: "/companies",
    route: CompanyRoutes,
  },
  {
    path: "/delivery-men",
    route: DeliveryManRoutes,
  },
  {
    path: "/loading-sheets",
    route: LoadingSheetRoutes,
  },
  {
    path: "/settlements",
    route: SettlementRoutes,
  },
  {
    path: "/areas",
    route: AreaRoutes,
  },
  {
    path: "/damage-records",
    route: DamageRecordRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
