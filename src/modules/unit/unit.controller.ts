import { Request, Response } from "express";
import { UnitService } from "./unit.service";
import BaseController from "@/shared/baseController";
import { HttpStatusCode } from "@/lib/httpStatus";
import pickQueries from "@/shared/pickQueries";
import { paginationFields } from "@/constants/paginationFields";

class Controller extends BaseController {
  createUnit = this.catchAsync(async (req: Request, res: Response) => {
    const data = await UnitService.createUnit(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Unit created successfully",
      data,
    });
  });

  getAllUnits = this.catchAsync(async (req: Request, res: Response) => {
    const options = pickQueries(req.query, paginationFields);
    const search_query = req.query.search_query as string;
    const data = await UnitService.getAllUnits(options, search_query);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Units retrieved successfully",
      data,
    });
  });

  getUnitById = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await UnitService.getUnitById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Unit retrieved successfully",
      data,
    });
  });

  updateUnit = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await UnitService.updateUnit(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Unit updated successfully",
      data,
    });
  });

  deleteUnit = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await UnitService.deleteUnit(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Unit deleted successfully",
      data: null,
    });
  });
}

export const UnitController = new Controller();
