import { Request, Response } from "express";
import { LoadingSheetService } from "./loading-sheet.service";
import BaseController from "@/shared/baseController";
import { HttpStatusCode } from "@/lib/httpStatus";
import pickQueries from "@/shared/pickQueries";
import { paginationFields } from "@/constants/paginationFields";

class Controller extends BaseController {
  createLoadingSheet = this.catchAsync(async (req: Request, res: Response) => {
    const data = await LoadingSheetService.createLoadingSheet(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Loading sheet created successfully",
      data,
    });
  });

  getAllLoadingSheets = this.catchAsync(async (req: Request, res: Response) => {
    const options = pickQueries(req.query, paginationFields);
    const search_query = req.query.search_query as string;
    const data = await LoadingSheetService.getAllLoadingSheets(options, search_query);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Loading sheets retrieved successfully",
      data,
    });
  });

  getLoadingSheetById = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await LoadingSheetService.getLoadingSheetById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Loading sheet retrieved successfully",
      data,
    });
  });

  updateLoadingSheet = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await LoadingSheetService.updateLoadingSheet(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Loading sheet updated successfully",
      data,
    });
  });

  deleteLoadingSheet = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await LoadingSheetService.deleteLoadingSheet(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Loading sheet deleted successfully",
      data: null,
    });
  });
}

export const LoadingSheetController = new Controller();
