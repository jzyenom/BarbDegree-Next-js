/**
 * AUTO-FILE-COMMENT: src/models/Client.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import mongoose, { Schema, models } from "mongoose";

const ClientSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    whatsapp: { type: String, trim: true, maxlength: 40 },
    mobile: { type: String, trim: true, maxlength: 40 },
    country: { type: String, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80 },
    address: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

ClientSchema.index({ userId: 1 }, { unique: true });

const Client = models.Client || mongoose.model("Client", ClientSchema);
export default Client;
