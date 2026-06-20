import { Schema } from "mongoose";

export const orderRefundSchema = new Schema({
  stripe_session_id: { type: String, required: true },
  order_id: {
    type: String,
    required: true,
  },
  refund_id: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
  },
  note: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
});
