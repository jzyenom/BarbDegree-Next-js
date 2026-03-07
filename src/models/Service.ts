import mongoose, { Schema, models } from "mongoose";

/**
 * AUTO-FUNCTION-COMMENT: normalizeServiceName
 * Purpose: Handles normalize service name.
 * Line-by-line:
 * 1. Executes `value.trim().replace(/\s+/g, " ").toLowerCase()`.
 */
const normalizeServiceName = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

const ServiceSchema = new Schema(
  {
    barberId: {
      type: Schema.Types.ObjectId,
      ref: "Barber",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    nameKey: { type: String, required: true, select: false },
    description: { type: String, default: "", trim: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, default: 30, min: 5, max: 480 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ barberId: 1, nameKey: 1 }, { unique: true });

ServiceSchema.pre("validate", function syncNameKey(next) {
  if (typeof this.name === "string") {
    const normalizedName = this.name.trim().replace(/\s+/g, " ");
    this.name = normalizedName;
    this.nameKey = normalizeServiceName(normalizedName);
  }

  next();
});

const Service = models.Service || mongoose.model("Service", ServiceSchema);
export default Service;
