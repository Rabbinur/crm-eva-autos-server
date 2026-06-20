import { Request, Response } from "express";
import { SettlementService } from "./settlement.service";
import BaseController from "@/shared/baseController";
import { HttpStatusCode } from "@/lib/httpStatus";
import pickQueries from "@/shared/pickQueries";
import { paginationFields } from "@/constants/paginationFields";

class Controller extends BaseController {
  createSettlement = this.catchAsync(async (req: Request, res: Response) => {
    const data = await SettlementService.createSettlement(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Daily Settlement finalized and saved successfully",
      data,
    });
  });

  getAllSettlements = this.catchAsync(async (req: Request, res: Response) => {
    const options = pickQueries(req.query, paginationFields);
    const search_query = req.query.search_query as string;
    const start_date = req.query.start_date as string;
    const end_date = req.query.end_date as string;
    const data = await SettlementService.getAllSettlements(
      options,
      search_query,
      { start_date, end_date }
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Daily Settlements retrieved successfully",
      data,
    });
  });

  getSettlementById = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await SettlementService.getSettlementById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Daily Settlement retrieved successfully",
      data,
    });
  });
}

export const SettlementController = new Controller();
