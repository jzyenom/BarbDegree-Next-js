import mongoose, { Schema, models } from "mongoose";

const BarberSchema = new Schema({
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
});

const Barber = models.Barber || mongoose.model("Barber", BarberSchema);
export default Barber;
