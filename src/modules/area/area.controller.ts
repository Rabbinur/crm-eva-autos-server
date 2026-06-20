import { Request, Response } from "express";
import { AreaService } from "./area.service";
import BaseController from "@/shared/baseController";
import { HttpStatusCode } from "@/lib/httpStatus";
import pickQueries from "@/shared/pickQueries";
import { paginationFields } from "@/constants/paginationFields";

class Controller extends BaseController {
  createArea = this.catchAsync(async (req: Request, res: Response) => {
    const data = await AreaService.createArea(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Area created successfully",
      data,
    });
  });

  getAllAreas = this.catchAsync(async (req: Request, res: Response) => {
    const options = pickQueries(req.query, paginationFields);
    const search_query = req.query.search_query as string;
    const data = await AreaService.getAllAreas(options, search_query);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Areas retrieved successfully",
      data,
    });
  });

  getAreaById = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await AreaService.getAreaById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Area retrieved successfully",
      data,
    });
  });

  updateArea = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await AreaService.updateArea(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Area updated successfully",
      data,
    });
  });

  deleteArea = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await AreaService.deleteArea(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Area deleted successfully",
      data: null,
    });
  });
}

export const AreaController = new Controller();
