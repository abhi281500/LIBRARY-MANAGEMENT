import Student from "../models/student.models.js";
import User from "../models/user.models.js";
import Library from "../models/library.models.js";
import Booking from "../models/booking.models.js";
import Payment from "../models/payment.models.js";
import Attendance from "../models/attendance.models.js";

/**
 * 1. STUDENT PORTAL LOOKUP (By Phone Number or Admission Number)
 */
export const studentPortalLookup = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: "Please enter your Phone Number or Admission Number" });
    }

    const cleanIdentifier = identifier.trim();

    // 1. Find user by phone, or student by admissionNumber
    let student = null;

    // Check by phone
    const user = await User.findOne({
      phone: { $regex: new RegExp(`^${cleanIdentifier.replace(/[^0-9]/g, "")}$`, "i") },
      role: "STUDENT",
    });

    if (user) {
      student = await Student.findOne({ user: user._id })
        .populate("user", "name email phone")
        .populate("library", "name address phone upiId openTime closeTime");
    }

    // If not found by phone, check by admissionNumber
    if (!student) {
      student = await Student.findOne({
        admissionNumber: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") },
      })
        .populate("user", "name email phone")
        .populate("library", "name address phone upiId openTime closeTime");
    }

    if (!student) {
      return res.status(404).json({
        message: "No student membership found with this phone number or admission ID.",
      });
    }

    // 2. Fetch Active & Past Bookings
    const bookings = await Booking.find({ student: student._id })
      .populate("seat", "seatNumber floor type")
      .sort({ createdAt: -1 });

    const activeBooking = bookings.find((b) => b.status === "ACTIVE") || null;

    // 3. Fetch Payments & Receipts
    const payments = await Payment.find({ student: student._id })
      .sort({ paymentDate: -1, createdAt: -1 });

    // 4. Fetch Attendance & Study Hours (Last 30 days)
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 30);
    sinceDate.setHours(0, 0, 0, 0);

    const attendanceLogs = await Attendance.find({
      student: student._id,
      checkIn: { $gte: sinceDate },
    })
      .populate("seat", "seatNumber floor")
      .sort({ checkIn: -1 });

    const totalStudyMinutes = attendanceLogs.reduce(
      (acc, curr) => acc + (curr.durationMinutes || 0),
      0
    );
    const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);
    const daysPresent = new Set(attendanceLogs.map((l) => new Date(l.date).toDateString())).size;

    return res.status(200).json({
      message: "Student portal data retrieved successfully",
      student,
      library: student.library || {},
      activeBooking,
      bookings,
      payments,
      attendance: {
        totalStudyHours,
        daysPresent,
        totalSessions: attendanceLogs.length,
        logs: attendanceLogs.slice(0, 15), // Last 15 sessions
      },
    });
  } catch (error) {
    console.error("studentPortalLookup error:", error);
    return res.status(500).json({ message: error.message || "Failed to retrieve student portal data" });
  }
};
