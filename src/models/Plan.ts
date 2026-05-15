import mongoose, { Schema, models } from "mongoose";

const PlanSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
    interval: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly", "quarterly", "biannually", "annually"],
    },
    amount: { type: Number, required: true, min: 0 },
    paystackPlanCode: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default models.Plan || mongoose.model("Plan", PlanSchema);
