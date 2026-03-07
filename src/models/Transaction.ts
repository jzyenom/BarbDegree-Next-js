/**
 * AUTO-FILE-COMMENT: src/models/Transaction.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import mongoose, { Schema, models } from "mongoose";

const TransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },

    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    reference: { type: String, required: true, unique: true, index: true },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    provider: { type: String, default: "paystack" },
    providerResponse: { type: Schema.Types.Mixed }, // raw Paystack JSON
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, createdAt: -1 });

export default models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
