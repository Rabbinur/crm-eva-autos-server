import { Request, Response } from "express";
import { DamageRecordService } from "./damage-record.service";
import BaseController from "@/shared/baseController";
import { HttpStatusCode } from "@/lib/httpStatus";
import pickQueries from "@/shared/pickQueries";
import { paginationFields } from "@/constants/paginationFields";

class Controller extends BaseController {
  createDamageRecord = this.catchAsync(async (req: Request, res: Response) => {
    // Extract operator name/role if present, default to "Admin"
    const operator = (req as any).user?.name || "Admin";
    const data = await DamageRecordService.createDamageRecord(
      req.body,
      operator
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.CREATED,
      success: true,
      message: "Damage record created successfully",
      data,
    });
  });

  updateDamageStatus = this.catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const operator = (req as any).user?.name || "Admin";
    const data = await DamageRecordService.updateDamageStatus(
      id,
      status,
      operator
    );
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: `Damage record status updated to ${status} successfully`,
      data,
    });
  });

  getAllDamageRecords = this.catchAsync(async (req: Request, res: Response) => {
    const options = pickQueries(req.query, paginationFields);
    const search_query = req.query.search_query as string;
    const start_date = req.query.start_date as string;
    const end_date = req.query.end_date as string;
    const status = req.query.status as string;
    const source_type = req.query.source_type as string;

    const data = await DamageRecordService.getAllDamageRecords(
      options,
      search_query,
      {
        start_date,
        end_date,
        status,
        source_type,
      }
    );

    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Damage records retrieved successfully",
      data,
    });
  });

  getDamageStockSummary = this.catchAsync(
    async (req: Request, res: Response) => {
      const options = pickQueries(req.query, paginationFields);
      const search_query = req.query.search_query as string;

      const data = await DamageRecordService.getDamageStockSummary(
        options,
        search_query
      );

      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Damage stock summary retrieved successfully",
        data,
      });
    }
  );

  getDamageReports = this.catchAsync(async (req: Request, res: Response) => {
    const start_date = req.query.start_date as string;
    const end_date = req.query.end_date as string;

    const data = await DamageRecordService.getDamageReports({
      start_date,
      end_date,
    });

    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Damage reports generated successfully",
      data,
    });
  });
}

export const DamageRecordController = new Controller();
