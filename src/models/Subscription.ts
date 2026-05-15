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
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paystackPlanCode: { type: String, required: true, trim: true },
    providerResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ barberId: 1, createdAt: -1 });

export default models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
