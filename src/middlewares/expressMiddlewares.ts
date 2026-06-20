import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { HttpStatusCode } from "@/lib/httpStatus";
import { traceMiddleware } from "./trace.middleware";
import { rateLimiter } from "./rate-limiter";
import { loggerMiddleware } from "./logger";
import { corsOptions } from "@/config/corsOptions";
import { performanceLoggerMiddleware } from "./performanceMiddleware";

export const expressMiddlewares = (app: Application) => {
  // 🔥 Stripe webhook raw-body exception MUST be first
  const webhookPaths = ["/api/v1/payment/webhook"];
  app.use((req, res, next) => {
    if (webhookPaths.includes(req.originalUrl)) {
      next(); // skip JSON parsing
    } else {
      express.json({ limit: "100mb" })(req, res, next);
    }
  });

  app.use(express.urlencoded({ extended: true, limit: "100mb" }));
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(helmet());
  app.use(morgan("dev"));

  app.use(traceMiddleware);
  app.use(loggerMiddleware);
  app.use(performanceLoggerMiddleware);

  app.use(
    rateLimiter({
      windowInSeconds: 600,
      maxRequests: 1000,
    })
  );
};

export const notFoundRoutes = (app: Application) => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`User hit: '${req.originalUrl}' is not exist`);
    res.status(HttpStatusCode.NOT_FOUND).json({
      statusCode: HttpStatusCode.NOT_FOUND,
      success: false,
      message: "API endpoint not found.",
      method: req.method,
      traceId: req.traceId || null,
      errorMessages: [
        {
          path: req.originalUrl,
          message: "The requested API endpoint does not exist.",
        },
      ],
    });
    next();
  });
};
