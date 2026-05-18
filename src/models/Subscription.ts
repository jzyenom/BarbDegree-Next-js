import mongoose, { Schema, models } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    barberId: { type: Schema.Types.ObjectId, ref: "Barber", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    amount: { type: Number, required: true, min: 0 },
    reference: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "success", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    paystackPlanCode: { type: String, required: true, trim: true },
    subscriptionCode: { type: String, trim: true, index: true },
    customerCode: { type: String, trim: true, index: true },
    nextPaymentDate: { type: Date },
    paidAt: { type: Date },
    providerResponse: { type: Schema.Types.Mixed },
    processedWebhookEventKeys: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

SubscriptionSchema.index({ barberId: 1, createdAt: -1 });

export default models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
