/**
 * AUTO-FILE-COMMENT: src/models/User.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, trim: true, maxlength: 120 },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
  },
  password: { type: String, select: false, minlength: 8 },
  avatar: { type: String, default: "avatar.png" },
  role: {
    type: String,
    enum: ["client", "barber", "admin", "superadmin"],
  },
}, { timestamps: true });

const User = models.User || mongoose.model("User", UserSchema);
export default User;
