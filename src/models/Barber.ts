import mongoose, { Schema, models } from "mongoose";

const BarberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    whatsapp: String,
    mobile: String,
    country: String,
    state: String,
    nin: String,
    bankName: String,
    accountNo: String,
    exp: String,
    charge: String,
    bio: String,
    address: String,
    avatar: { type: String, default: "avatar.png" },
    isSubscribed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BarberSchema.index({ userId: 1 });

BarberSchema.virtual("services", {
  ref: "Service",
  localField: "_id",
  foreignField: "barberId",
});

const Barber = models.Barber || mongoose.model("Barber", BarberSchema);
export default Barber;
