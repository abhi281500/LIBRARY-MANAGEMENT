
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

import User from "../models/user.models.js";
import Library from "../models/library.models.js";
import Seat from "../models/seat.models.js";
import Student from "../models/student.models.js";
import Booking from "../models/booking.models.js";
import Payment from "../models/payment.models.js";

const MONGO_URI = process.env.MONGODB_URI
async function seedData() {
  try {
    console.log("Connecting to database...", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB!");

    // Clean old demo data
    console.log("Cleaning old data...");
    await Payment.deleteMany({});
    await Booking.deleteMany({});
    await Student.deleteMany({});
    await Seat.deleteMany({});
    await Library.deleteMany({});
    await User.deleteMany({});

    console.log("Creating Library Owner...");
    const owner = await User.create({
      name: "Abhinav Sharma",
      email: "owner@studyspace.com",
      password: "password123",
      phone: "+919876543210",
      role: "LIBRARY_OWNER",
      isVerified: true,
    });

    console.log("Creating Library...");
    const library = await Library.create({
      name: "Apex Study Point & Digital Library",
      owner: owner._id,
      subscription: "PRO",
      status: "ACTIVE",
      openTime: "06:00 AM",
      closeTime: "11:00 PM",
      address: "Plot 42, Near Coaching Hub, Commercial Complex, Sector 12",
      phone: "+919876543210",
      description: "Premium self-study library with ergonomic chairs, high-speed 5G Wi-Fi, silent AC halls, individual power sockets, and cafeteria.",
      totalSeats: 40,
    });

    console.log("Creating 40 Seats across 2 Floors...");
    const seats = [];
    for (let i = 1; i <= 24; i++) {
      seats.push({
        seatNumber: `F1-S${i < 10 ? "0" + i : i}`,
        library: library._id,
        floor: 1,
        type: i <= 8 ? "PREMIUM" : "NORMAL",
        status: "AVAILABLE",
      });
    }
    for (let i = 1; i <= 16; i++) {
      seats.push({
        seatNumber: `F2-S${i < 10 ? "0" + i : i}`,
        library: library._id,
        floor: 2,
        type: i <= 4 ? "PREMIUM" : "NORMAL",
        status: "AVAILABLE",
      });
    }
    const createdSeats = await Seat.insertMany(seats);

    console.log("Creating 12 Students...");
    const studentNames = [
      { name: "Rahul Verma", email: "rahul.v@gmail.com", phone: "+919812300001" },
      { name: "Priya Sharma", email: "priya.s@gmail.com", phone: "+919812300002" },
      { name: "Aman Gupta", email: "aman.g@gmail.com", phone: "+919812300003" },
      { name: "Sneha Patel", email: "sneha.p@gmail.com", phone: "+919812300004" },
      { name: "Rohan Kumar", email: "rohan.k@gmail.com", phone: "+919812300005" },
      { name: "Anjali Mishra", email: "anjali.m@gmail.com", phone: "+919812300006" },
      { name: "Vikas Yadav", email: "vikas.y@gmail.com", phone: "+919812300007" },
      { name: "Pooja Chaudhary", email: "pooja.c@gmail.com", phone: "+919812300008" },
      { name: "Deepak Saini", email: "deepak.s@gmail.com", phone: "+919812300009" },
      { name: "Divya Nair", email: "divya.n@gmail.com", phone: "+919812300010" },
      { name: "Mohit Joshi", email: "mohit.j@gmail.com", phone: "+919812300011" },
      { name: "lawade ", email: "kritika.r@gmail.com", phone: "+918103334197" },
    ];

    const createdStudents = [];
    for (let i = 0; i < studentNames.length; i++) {
      const studentUser = await User.create({
        name: studentNames[i].name,
        email: studentNames[i].email,
        password: "password123",
        phone: studentNames[i].phone,
        role: "STUDENT",
        isVerified: true,
      });

      const studentDoc = await Student.create({
        user: studentUser._id,
        library: library._id,
        admissionNumber: `ADM-2026-${1001 + i}`,
        status: "ACTIVE",
        joiningDate: new Date(Date.now() - (30 - i * 2) * 24 * 60 * 60 * 1000),
      });

      createdStudents.push({ ...studentDoc.toObject(), userObj: studentUser });
    }

    console.log("Creating Bookings & Payments across shifts...");
    const shifts = ["MORNING", "EVENING", "FULL_DAY", "NIGHT"];
    const now = new Date();

    for (let i = 0; i < createdStudents.length; i++) {
      const seat = createdSeats[i % createdSeats.length];
      const shift = shifts[i % shifts.length];
      const amount = shift === "FULL_DAY" ? 1200 : shift === "NIGHT" ? 800 : 700;

      // Make some bookings expire in 2 days (to demo expiry alert!), others active for 20 days
      const daysRemaining = i === 0 || i === 1 ? 2 : (20 + (i * 2));
      const startDate = new Date(now.getTime() - (30 - daysRemaining) * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      const booking = await Booking.create({
        student: createdStudents[i]._id,
        seat: seat._id,
        library: library._id,
        startDate,
        endDate,
        shift,
        amount,
        status: "ACTIVE",
      });

      // Mark seat occupied
      seat.status = "OCCUPIED";
      await seat.save();

      // Create Payment for this booking
      await Payment.create({
        booking: booking._id,
        student: createdStudents[i]._id,
        library: library._id,
        amount,
        paymentMethod: i % 2 === 0 ? "UPI" : "CASH",
        paymentStatus: "PAID",
        paymentDate: startDate,
        receiptNumber: `REC-${Date.now()}-${i + 1}`,
      });
    }

    console.log("✅ Seed completed successfully!");
    console.log("=========================================");
    console.log("Demo Credentials:");
    console.log("Email: owner@studyspace.com");
    console.log("Password: password123");
    console.log("=========================================");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedData();
