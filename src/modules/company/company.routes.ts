import { Router } from "express";
import { CompanyController } from "./company.controller";
import { companyValidations } from "./company.validate";
import validateRequest from "@/middlewares/validateRequest";
import verifyToken from "@/middlewares/verifyToken";
import { ROLES } from "@/constants/roles";

const router = Router();

router.post(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest(companyValidations.create),
  CompanyController.createCompany
);

router.get(
  "/",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  CompanyController.getAllCompanies
);

router.get(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  CompanyController.getCompanyById
);

router.patch(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  validateRequest(companyValidations.update),
  CompanyController.updateCompany
);

router.delete(
  "/:id",
  verifyToken([ROLES.ADMIN, ROLES.SUPER_ADMIN]),
  CompanyController.deleteCompany
);

export const CompanyRoutes = router;
