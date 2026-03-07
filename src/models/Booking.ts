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

    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    service: { type: String, required: true, trim: true, maxlength: 300 },
    serviceIds: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    services: [
      {
        serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
        name: { type: String, required: true, trim: true, maxlength: 120 },
        price: { type: Number },
        durationMinutes: { type: Number },
      },
    ],
    address: { type: String, trim: true, maxlength: 300 },
    dateTime: { type: Date, required: true },
    note: { type: String, trim: true, maxlength: 1000 },

    estimatedPrice: { type: Number },
    amountPaid: { type: Number, default: 0 },

    paymentReference: { type: String, trim: true },
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

BookingSchema.index({ barberId: 1, dateTime: 1, status: 1 });
BookingSchema.index({ clientId: 1, createdAt: -1 });
BookingSchema.index(
  { paymentReference: 1 },
  { unique: true, sparse: true, partialFilterExpression: { paymentReference: { $type: "string" } } }
);

export default models.Booking || mongoose.model("Booking", BookingSchema);
