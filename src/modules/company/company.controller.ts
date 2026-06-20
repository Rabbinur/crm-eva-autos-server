import { Request, Response } from "express";
import { CompanyService } from "./company.service";
import BaseController from "@/shared/baseController";
import { HttpStatusCode } from "@/lib/httpStatus";
import pickQueries from "@/shared/pickQueries";
import { paginationFields } from "@/constants/paginationFields";

class Controller extends BaseController {
  createCompany = this.catchAsync(async (req: Request, res: Response) => {
    const data = await CompanyService.createCompany(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Company created successfully",
      data,
    });
  });

  getAllCompanies = this.catchAsync(async (req: Request, res: Response) => {
    const options = pickQueries(req.query, paginationFields);
    const search_query = req.query.search_query as string;
    const data = await CompanyService.getAllCompanies(options, search_query);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Companies retrieved successfully",
      data,
    });
  });

  getCompanyById = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await CompanyService.getCompanyById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Company retrieved successfully",
      data,
    });
  });

  updateCompany = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await CompanyService.updateCompany(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Company updated successfully",
      data,
    });
  });

  deleteCompany = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await CompanyService.deleteCompany(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Company deleted successfully",
      data: null,
    });
  });
}

export const CompanyController = new Controller();
