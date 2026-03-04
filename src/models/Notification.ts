import mongoose, { Schema, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "info" },
    read: { type: Boolean, default: false },
    data: { type: Object },
  },
  { timestamps: true }
);

const Notification =
  models.Notification || mongoose.model("Notification", NotificationSchema);
export default Notification;
