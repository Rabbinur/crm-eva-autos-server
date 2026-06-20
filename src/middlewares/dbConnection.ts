import { Request, Response, NextFunction } from "express";
import mongodbConnection from "../config/mongoDbConnection";
import { connectRedis } from "../config/redis";

let isConnected = false;

export const dbConnectionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isConnected) {
      await mongodbConnection();
      await connectRedis();
      isConnected = true;
    }
    next();
  } catch (error) {
    next(error);
  }
};
