import { logPerformance } from "@/utils/performanceLogger";
import { Request, Response, NextFunction } from "express";
import { performance } from "perf_hooks";

export const performanceLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = performance.now();

  res.on("finish", () => {
    const durationMs = +(performance.now() - start).toFixed(2);

    logPerformance({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      success: res.statusCode < 400,
      durationMs,
      contentLength: Number(res.getHeader("content-length")) || 0,
      traceId: req.traceId || res.getHeader("x-railway-request-id")?.toString(),
      timestamp: new Date().toISOString(),
      message: "Request processed successfully",
    });
  });

  next();
};
