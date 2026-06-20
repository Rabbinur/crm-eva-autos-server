import { NextFunction, Request, RequestHandler, Response } from "express";

type IApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string | null;
  traceId?: string | null;
  data?: T | null;
};

class BaseController {
  catchAsync =
    (fn: RequestHandler) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };

  sendResponse<T>(req: Request, res: Response, data: IApiResponse<T>): void {
    const responseData: any = {
      statusCode: data.statusCode,
      status_code: data.statusCode, // For legacy frontend compatibility
      success: data.success,
      message: data.message || null,
      traceId: req.traceId || null,
      data: data.data || null || undefined,
    };

    res.status(data.statusCode).json(responseData);
  }
}

export default BaseController;
