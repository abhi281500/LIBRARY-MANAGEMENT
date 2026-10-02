import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../models/user.models.js";

const DEFAULT_SUPERADMIN = {
  name: "Platform Super Admin",
  email: "admin@studyos.com",
  password: "AdminPassword@123",
  phone: "9999999999",
  role: "SUPER_ADMIN",
  isVerified: true,
};

async function seedSuperAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI is not defined in environment variables");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log(" Connected to MongoDB");

    const existingSuperAdmin = await User.findOne({ email: DEFAULT_SUPERADMIN.email });

    if (existingSuperAdmin) {
      existingSuperAdmin.role = "SUPER_ADMIN";
      existingSuperAdmin.password = DEFAULT_SUPERADMIN.password; // pre-save hook will hash
      await existingSuperAdmin.save();
      console.log(" SuperAdmin user credentials updated successfully!");
    } else {
      await User.create(DEFAULT_SUPERADMIN);
      console.log(" SuperAdmin account created successfully!");
    }

    console.log("\n==============================================");
    console.log("👑 SUPER ADMIN CREDENTIALS:");
    console.log(`📧 Email:    ${DEFAULT_SUPERADMIN.email}`);
    console.log(`🔑 Password: ${DEFAULT_SUPERADMIN.password}`);
    console.log(`🛡️  Role:     SUPER_ADMIN`);
    console.log(`🌐 Route:    http://localhost:5173/super-admin`);
    console.log("==============================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Super Admin:", error);
    process.exit(1);
  }
}

seedSuperAdmin();
