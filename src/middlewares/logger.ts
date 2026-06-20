import { emitter } from "@/events/eventEmitter";
import { Request, Response, NextFunction } from "express";
import { envConfig } from "../config";

/**
 * Logger Middleware
 * ------------------
 * Express middleware that logs detailed information about every API request and response.
 *
 * It tracks:
 * - Request method, URL, IP, trace id, and input data
 * - Response output and total execution time (duration)
 * - Emits async log events for further processing or persistence (only in development)
 *
 * @example
 * ```ts
 * import express from "express";
 * import { loggerMiddleware } from "@/middlewares/logger.middleware";
 *
 * const app = express();
 * app.use(loggerMiddleware);
 * ```
 *
 * @remarks
 * - Logs data to console.
 * - Emits an "apiLog" event using the global event emitter for async storage.
 * - Designed to be used early in the middleware chain.
 */
export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Record the request start time for duration calculation
  const startTime = Date.now();

  // Store the original res.send method to preserve functionality
  const originalSend = res.send;

  /**
   * Override Express's `res.send` method to capture response data
   * and measure the total request processing time.
   */
  res.send = function (body?: any): any {
    const duration = Date.now() - startTime; // Total response time in ms

    // Capture request input (query params for GET, body for others)
    const input = req.method === "GET" ? req.query : req.body;

    // Collect log data
    const logData = {
      timestamp: new Date().toISOString(),
      traceId: req.traceId,
      duration,
      ip: req.ip,
      method: req.method,
      input,
      output: body,
      fullUrl: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    };

    // Output log to console (useful during development)
    console.log(logData);

    // Emit async event for persistent logging (only in development mode)
    if (envConfig.app.env === "development") {
      emitter.emitAsync("apiLog", logData);
    }

    // Return the original response behavior
    return originalSend.call(this, body);
  };

  // Proceed to the next middleware or route handler
  next();
};
