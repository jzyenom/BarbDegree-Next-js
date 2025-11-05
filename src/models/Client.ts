import mongoose, { Schema, models } from "mongoose";

const ClientSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  whatsapp: String,
  mobile: String,
  country: String,
  state: String,
  address: String,
});

const Client = models.Client || mongoose.model("Client", ClientSchema);
export default Client;
