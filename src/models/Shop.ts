import mongoose, { Schema, models } from "mongoose";

const ShopSchema = new Schema(
  {
    barberId: {
      type: Schema.Types.ObjectId,
      ref: "Barber",
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    state: { type: String, required: true, trim: true, maxlength: 80 },
    country: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, trim: true, maxlength: 40 },
    description: { type: String, trim: true, maxlength: 1000 },
    openingHours: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

ShopSchema.index({ city: 1, state: 1, country: 1 });

export default models.Shop || mongoose.model("Shop", ShopSchema);
