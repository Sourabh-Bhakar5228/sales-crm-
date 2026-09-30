import jwt from "jsonwebtoken";
import { Role } from "../constants/roles.js";

export interface JwtPayload {
  userId: string;
  role: Role;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET || "vibhanu_crm_fallback_jwt_secret_key_2026_secure";

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return secret;
};

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
};
