import mongoose, { Schema, models } from "mongoose";



const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String, select: false },
  avatar: { type: String, default: "avatar.png" },
  role: {
    type: String,
    enum: ["client", "barber", "admin", "superadmin"],
  },
});

const User = models.User || mongoose.model("User", UserSchema);
export default User;
