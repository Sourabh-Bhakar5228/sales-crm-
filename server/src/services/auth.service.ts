import { User } from "../models/User.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { LoginInput } from "../validators/auth.validator.js";

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await User.findOne({
    email: email.toLowerCase(),
    isActive: true,
  }).select("+passwordHash");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getMeUser = async (userId: string) => {
  const user = await User.findById(userId).select("name email role isActive");
  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export class AuthService {
  static login = loginUser;
  static getMe = getMeUser;
}
