import mongoose, { Document, Schema } from "mongoose";
import { ROLES, Role } from "../constants/roles.js";
import { comparePassword } from "../utils/password.js";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1 });

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return comparePassword(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>("User", userSchema);
