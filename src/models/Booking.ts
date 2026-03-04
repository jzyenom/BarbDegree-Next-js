import mongoose, { Schema, models } from "mongoose";

export interface IBooking {
  clientId: mongoose.Types.ObjectId;
  barberId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  address?: string;
  service: string;
  serviceIds?: mongoose.Types.ObjectId[];
  services?: {
    serviceId?: mongoose.Types.ObjectId;
    name: string;
    price?: number;
    durationMinutes?: number;
  }[];
  dateTime: Date;
  note?: string;
  estimatedPrice?: number;
  amountPaid?: number;
  paymentReference?: string;
  paymentStatus?: "pending" | "paid" | "failed";
  status?: "pending" | "confirmed" | "completed" | "declined";
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    barberId: { type: Schema.Types.ObjectId, ref: "Barber", required: true },

    name: { type: String, required: true },
    email: { type: String, required: true },
    service: { type: String, required: true },
    serviceIds: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    services: [
      {
        serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
        name: { type: String, required: true },
        price: { type: Number },
        durationMinutes: { type: Number },
      },
    ],
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
      enum: ["pending", "confirmed", "completed", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default models.Booking || mongoose.model("Booking", BookingSchema);
