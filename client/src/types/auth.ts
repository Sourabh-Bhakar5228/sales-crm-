export type Role =
  | "MARKETING"
  | "COMMUNICATION"
  | "VIGILANCE"
  | "SUPPORT"
  | "SALES";

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token?: string;
  };
}
