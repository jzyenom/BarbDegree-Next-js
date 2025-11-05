import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true },
  avatar: { type: String, default: "avatar.png" },
  role: {
    type: String,
    enum: ["client", "barber", "admin"],
    default: "client",
  },
});

const User = models.User || mongoose.model("User", UserSchema);
export default User;
