import { pubClient } from "@/config/redis";
import { Request, Response, NextFunction } from "express";
import status from "http-status";

interface RateLimitOptions {
  windowInSeconds: number;
  maxRequests: number;
  keyPrefix?: string;
}

export const rateLimiter = (options: RateLimitOptions) => {
  const { windowInSeconds, maxRequests, keyPrefix = "rate-limit" } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = req.ip; // or req.user.id
      const key = `${keyPrefix}:${identifier}`;

      const requests = await pubClient.incr(key);

      if (requests === 1) {
        await pubClient.expire(key, windowInSeconds);
      }

      if (requests > maxRequests) {
        const ttl = await pubClient.ttl(key);
        return res.status(status.TOO_MANY_REQUESTS).json({
          statusCode: status.TOO_MANY_REQUESTS,
          success: false,
          message: "Too many requests. Please try again later.",
          retry_after_seconds: ttl,
        });
      }

      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      next();
    }
  };
};
