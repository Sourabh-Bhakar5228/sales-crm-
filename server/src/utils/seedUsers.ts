import "dotenv/config";
import dns from "dns";
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {}

import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { User } from "../models/User.js";
import { ROLES } from "../constants/roles.js";
import { hashPassword } from "./password.js";

const seedUsers = async () => {
  await connectDatabase();

  const password = await hashPassword("Vibhanu@123");

  const users = [
    {
      name: "Marketing User",
      email: "marketing@vibhanu.com",
      passwordHash: password,
      role: ROLES.MARKETING,
    },
    {
      name: "Communication User",
      email: "communication@vibhanu.com",
      passwordHash: password,
      role: ROLES.COMMUNICATION,
    },
    {
      name: "Vigilance User",
      email: "vigilance@vibhanu.com",
      passwordHash: password,
      role: ROLES.VIGILANCE,
    },
    {
      name: "Support User",
      email: "support@vibhanu.com",
      passwordHash: password,
      role: ROLES.SUPPORT,
    },
    {
      name: "Sales User",
      email: "sales@vibhanu.com",
      passwordHash: password,
      role: ROLES.SALES,
    },
  ];

  await User.deleteMany({});
  await User.insertMany(users);

  console.log("✅ Users seeded");
  await mongoose.connection.close();
};

seedUsers().catch((error) => {
  console.error(error);
  process.exit(1);
});
