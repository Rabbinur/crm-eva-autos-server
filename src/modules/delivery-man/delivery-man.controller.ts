import { Request, Response } from "express";
import { DeliveryManService } from "./delivery-man.service";
import BaseController from "@/shared/baseController";
import { HttpStatusCode } from "@/lib/httpStatus";
import pickQueries from "@/shared/pickQueries";
import { paginationFields } from "@/constants/paginationFields";

class Controller extends BaseController {
  createDeliveryMan = this.catchAsync(async (req: Request, res: Response) => {
    const data = await DeliveryManService.createDeliveryMan(req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Delivery representative created successfully",
      data,
    });
  });

  getAllDeliveryMen = this.catchAsync(async (req: Request, res: Response) => {
    const options = pickQueries(req.query, paginationFields);
    const search_query = req.query.search_query as string;
    const data = await DeliveryManService.getAllDeliveryMen(
      options,
      search_query
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Delivery representatives retrieved successfully",
      data,
    });
  });

  getDeliveryManById = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await DeliveryManService.getDeliveryManById(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Delivery representative retrieved successfully",
      data,
    });
  });

  getDeliveryManStats = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await DeliveryManService.getDeliveryManStats(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Delivery representative statistics retrieved successfully",
      data,
    });
  });

  updateDeliveryMan = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await DeliveryManService.updateDeliveryMan(id, req.body);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Delivery representative updated successfully",
      data,
    });
  });

  deleteDeliveryMan = this.catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await DeliveryManService.deleteDeliveryMan(id);
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Delivery representative deleted successfully",
      data: null,
    });
  });
}

export const DeliveryManController = new Controller();
