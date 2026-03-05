import mongoose, { Schema, models } from "mongoose";

const BarberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    whatsapp: { type: String, trim: true, maxlength: 40 },
    mobile: { type: String, trim: true, maxlength: 40 },
    country: { type: String, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80 },
    nin: { type: String, trim: true, maxlength: 20, select: false },
    bankName: { type: String, trim: true, maxlength: 120 },
    accountNo: { type: String, trim: true, maxlength: 20, select: false },
    exp: { type: String, trim: true, maxlength: 80 },
    charge: { type: String, trim: true, maxlength: 80 },
    bio: { type: String, trim: true, maxlength: 1000 },
    address: { type: String, trim: true, maxlength: 300 },
    avatar: { type: String, default: "avatar.png" },
    isSubscribed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BarberSchema.index({ userId: 1 }, { unique: true });

BarberSchema.virtual("services", {
  ref: "Service",
  localField: "_id",
  foreignField: "barberId",
});

const Barber = models.Barber || mongoose.model("Barber", BarberSchema);
export default Barber;
