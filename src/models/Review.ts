import mongoose, { Schema, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    barberId: { type: Schema.Types.ObjectId, ref: "Barber", required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    rate: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

ReviewSchema.index({ barberId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, barberId: 1 }, { unique: true });
ReviewSchema.index(
  { bookingId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { bookingId: { $type: "objectId" } } }
);

export default models.Review || mongoose.model("Review", ReviewSchema);
