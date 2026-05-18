import mongoose, { Schema, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    barberId: { type: Schema.Types.ObjectId, ref: "Barber", required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    comment: { type: String, trim: true, maxlength: 1000, default: "" },
    rate: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

ReviewSchema.index({ barberId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, barberId: 1, createdAt: -1 });
ReviewSchema.index({ bookingId: 1 }, { unique: true });

export default models.Review || mongoose.model("Review", ReviewSchema);
