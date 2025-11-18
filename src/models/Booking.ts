import mongoose, { Schema, models } from "mongoose";

export interface IBooking {
  clientId: mongoose.Types.ObjectId;
  barberId: mongoose.Types.ObjectId;
  name: string;
  address?: string;
  service: string;
  dateTime: Date;
  note?: string;
  estimatedPrice?: number;
  amountPaid?: number;
  paymentReference?: string;
  paymentStatus?: "pending" | "paid" | "failed";
  status?: "pending" | "confirmed" | "completed";
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    barberId: { type: Schema.Types.ObjectId, ref: "Barber", required: true },

    service: { type: String, required: true },
    address: { type: String },
    dateTime: { type: Date, required: true },
    note: { type: String },

    estimatedPrice: { type: Number },
    amountPaid: { type: Number, default: 0 },

    paymentReference: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default models.Booking || mongoose.model("Booking", BookingSchema);
