import { User } from "../models/User.js";
import { ROLES } from "../constants/roles.js";

export const getSalesUsers = async () => {
  return User.find({
    role: ROLES.SALES,
    isActive: true,
  })
    .select("_id name email role")
    .sort({ name: 1 });
};
