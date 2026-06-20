import BaseController from "@/shared/baseController";
import { Request, Response } from "express";
import { StatisticsService } from "./statistics.service";
import { HttpStatusCode } from "@/lib/httpStatus";

class Controller extends BaseController {
  getDashboardSummary = this.catchAsync(async (req: Request, res: Response) => {
    const { start_date, end_date } = req.query as any;
    const data = await StatisticsService.getDashboardSummary({
      start_date,
      end_date,
    });
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Dashboard summary statistics retrieved successfully",
      data,
    });
  });

  getOrdersStatistics = this.catchAsync(async (req: Request, res: Response) => {
    const data = await StatisticsService.getOrdersStatistics();
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "All types of orders statistics retrieved successfully",
      data,
    });
  });

  getLast7DaysOrders = this.catchAsync(async (req: Request, res: Response) => {
    const data = await StatisticsService.getLast7DaysOrders();
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Last 7 days orders statistics retrieved successfully",
      data,
    });
  });

  getAllOrdersCardMetrics = this.catchAsync(
    async (req: Request, res: Response) => {
      const { from, to } = req.query as any;
      const data = await StatisticsService.getAllOrdersCardMetrics({
        from,
        to,
      });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Orders metrics retrieved successfully",
        data,
      });
    }
  );
  getStatusWiseOrdersMetrics = this.catchAsync(
    async (req: Request, res: Response) => {
      const { order_type } = req.query as any;
      const data =
        await StatisticsService.getStatusWiseOrdersMetrics(order_type);
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: `Status-wise metrics for ${order_type} orders retrieved successfully`,
        data,
      });
    }
  );

  getRecentOrders = this.catchAsync(async (req: Request, res: Response) => {
    const { per_order_limit, total_limit } = req.query as any;

    const maxTotal = 50;
    const maxPerOrder = 10;

    const parseLimit = (value: any, defaultVal: number, max: number) => {
      const parsed = parseInt(value);
      if (isNaN(parsed) || parsed <= 0) return defaultVal;
      return Math.min(parsed, max);
    };

    const perOrderLimit = parseLimit(per_order_limit, 5, maxPerOrder);
    const totalLimit = parseLimit(total_limit, 20, maxTotal);

    const data = await StatisticsService.getRecentOrders(
      perOrderLimit,
      totalLimit
    );

    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: `Recent orders retrieved successfully`,
      data: {
        data: data,
        meta: {
          per_order_limit: perOrderLimit,
          total_limit: totalLimit,
          total_available: data.length,
        },
      },
    });
  });

  getRevenue = this.catchAsync(async (req: Request, res: Response) => {
    const { from, to } = req.query;
    const data = await StatisticsService.getRevenue({
      from: from as string,
      to: to as string,
    });
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: `All the orders revenue fetched successfully`,
      data,
    });
  });

  getCurrentStockReport = this.catchAsync(
    async (req: Request, res: Response) => {
      const { company_name, category_name, search_query } = req.query as any;
      const data = await StatisticsService.getCurrentStockReport({
        company_name,
        category_name,
        search_query,
      });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Current stock report retrieved successfully",
        data,
      });
    }
  );

  getProductSummaryReport = this.catchAsync(
    async (req: Request, res: Response) => {
      const { productId, start_date, end_date } = req.query as any;
      const data = await StatisticsService.getProductSummaryReport({
        productId,
        start_date,
        end_date,
      });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Product summary report retrieved successfully",
        data,
      });
    }
  );

  getDailySummaryReport = this.catchAsync(
    async (req: Request, res: Response) => {
      const { start_date, end_date } = req.query as any;
      const data = await StatisticsService.getDailySummaryReport({
        start_date,
        end_date,
      });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Daily summary report retrieved successfully",
        data,
      });
    }
  );

  getDailySaleReport = this.catchAsync(async (req: Request, res: Response) => {
    const { start_date, end_date, delivery_man_id } = req.query as any;
    const data = await StatisticsService.getDailySaleReport({
      start_date,
      end_date,
      delivery_man_id,
    });
    this.sendResponse(req, res, {
      statusCode: HttpStatusCode.OK,
      success: true,
      message: "Daily sale report retrieved successfully",
      data,
    });
  });

  getDailySaleProductReport = this.catchAsync(
    async (req: Request, res: Response) => {
      const { start_date, end_date, product_id } = req.query as any;
      const data = await StatisticsService.getDailySaleProductReport({
        start_date,
        end_date,
        product_id,
      });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Daily sale product report retrieved successfully",
        data,
      });
    }
  );

  getDamageRecordsReport = this.catchAsync(
    async (req: Request, res: Response) => {
      const { start_date, end_date, status } = req.query as any;
      const data = await StatisticsService.getDamageRecordsReport({
        start_date,
        end_date,
        status,
      });
      this.sendResponse(req, res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Damage records report retrieved successfully",
        data,
      });
    }
  );
}

export const StatisticsController = new Controller();
