import dotenv from "dotenv";
import express, { Application } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import router from "./routes";
import "./events/index";
import {
  expressMiddlewares,
  notFoundRoutes,
} from "./middlewares/expressMiddlewares";
import { dbConnectionMiddleware } from "./middlewares/dbConnection";

dotenv.config();

const app: Application = express();

// middlewares
expressMiddlewares(app);
app.use(dbConnectionMiddleware);

// health check
app.get("/", async (req, res) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    traceId: req.traceId || null,
    message: "Distributor application is up and running",
    data: null,
  });
});

// applications routes
app.use("/api/v1", router); // it will be remove in near future
// global error handler
app.use(globalErrorHandler.globalErrorHandler);

// app route not found
notFoundRoutes(app);

export default app;
