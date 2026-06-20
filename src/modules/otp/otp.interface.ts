import { Document, Model } from "mongoose";

export type IOTP = {
  email: string;
  otp: number;
  createdAt?: Date;
} & Document;

export type OTPModel = Model<IOTP, Record<string, unknown>>;
