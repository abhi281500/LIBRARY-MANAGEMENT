import Attendance from "../models/attendance.models.js";
import Student from "../models/student.models.js";
import Booking from "../models/booking.models.js";
import Library from "../models/library.models.js";
import mongoose from "mongoose";

/**
 * 1. SMART TOGGLE CHECK-IN / CHECK-OUT (For rapid QR Scan & Barcode Entry)
 */
export const toggleCheckInOut = async (req, res) => {
  try {
    const { identifier, mode = "QR_SCAN" } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: "Student ID or Admission Number is required" });
    }

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found for this account" });
    }

    // Parse identifier if it's a JSON QR string
    let parsedAdm = typeof identifier === "string" ? identifier.trim() : String(identifier);

    if (parsedAdm.startsWith("{")) {
      try {
        const qrJson = JSON.parse(parsedAdm);
        parsedAdm = qrJson.adm || qrJson.admissionNumber || qrJson.phone || parsedAdm;
      } catch (e) {
        // use raw parsedAdm
      }
    }

    let student = null;

    // 1. Direct MongoDB ID
    if (mongoose.Types.ObjectId.isValid(parsedAdm)) {
      student = await Student.findOne({ _id: parsedAdm, library: library._id }).populate("user", "name email phone");
    }

    // 2. Admission Number
    if (!student) {
      student = await Student.findOne({
        library: library._id,
        admissionNumber: { $regex: new RegExp(`^${parsedAdm}$`, "i") },
      }).populate("user", "name email phone");
    }

    // 3. User Phone Number
    if (!student) {
      const cleanPhone = parsedAdm.replace(/[^0-9]/g, "");
      if (cleanPhone.length >= 7) {
        const matchingUsers = await (await import("../models/user.models.js")).default.find({
          phone: { $regex: new RegExp(cleanPhone, "i") },
        });
        if (matchingUsers.length > 0) {
          const userIds = matchingUsers.map((u) => u._id);
          student = await Student.findOne({
            library: library._id,
            user: { $in: userIds },
          }).populate("user", "name email phone");
        }
      }
    }

    if (!student) {
      return res.status(404).json({ message: `Student not found with identifier "${parsedAdm}"` });
    }

    // Check if student has an active session right now (status: CHECKED_IN)
    const activeSession = await Attendance.findOne({
      student: student._id,
      library: library._id,
      status: "CHECKED_IN",
    }).sort({ checkIn: -1 });

    const now = new Date();

    if (activeSession) {
      // PERFORM CHECK-OUT
      activeSession.checkOut = now;
      activeSession.status = "CHECKED_OUT";
      const diffMs = now.getTime() - new Date(activeSession.checkIn).getTime();
      activeSession.durationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
      await activeSession.save();

      const hours = Math.floor(activeSession.durationMinutes / 60);
      const mins = activeSession.durationMinutes % 60;
      const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

      return res.status(200).json({
        message: `${student.user?.name || "Student"} checked out successfully`,
        action: "CHECKED_OUT",
        student,
        durationText,
        durationMinutes: activeSession.durationMinutes,
        checkInTime: activeSession.checkIn,
        checkOutTime: activeSession.checkOut,
        attendance: activeSession,
      });
    } else {
      // PERFORM CHECK-IN
      // Find active desk booking to attach seat reference
      const activeBooking = await Booking.findOne({
        student: student._id,
        library: library._id,
        status: "ACTIVE",
      }).populate("seat", "seatNumber floor type");

      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      const newAttendance = await Attendance.create({
        student: student._id,
        library: library._id,
        seat: activeBooking?.seat?._id || null,
        date: todayMidnight,
        checkIn: now,
        status: "CHECKED_IN",
        checkInMode: mode,
      });

      return res.status(201).json({
        message: `Welcome ${student.user?.name || "Student"}! Check-in recorded.`,
        action: "CHECKED_IN",
        student,
        seat: activeBooking?.seat || null,
        shift: activeBooking?.shift || "FULL_DAY",
        checkInTime: newAttendance.checkIn,
        attendance: newAttendance,
      });
    }
  } catch (error) {
    console.error("toggleCheckInOut error:", error);
    return res.status(500).json({ message: error.message || "Failed to process attendance" });
  }
};

/**
 * 2. GET DAILY ATTENDANCE (Live count, Log table, Filter by Date)
 */
export const getDailyAttendance = async (req, res) => {
  try {
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    const { date, status, search } = req.query;

    let targetDate = new Date();
    if (date) {
      targetDate = new Date(date);
    }
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      library: library._id,
      checkIn: { $gte: startOfDay, $lte: endOfDay },
    };

    if (status && status !== "ALL") {
      query.status = status;
    }

    const [attendanceRecords, currentlyInsideCount, allTodayCount] = await Promise.all([
      Attendance.find(query)
        .populate({
          path: "student",
          populate: { path: "user", select: "name email phone" },
        })
        .populate("seat", "seatNumber floor type")
        .sort({ checkIn: -1 }),
      Attendance.countDocuments({
        library: library._id,
        status: "CHECKED_IN",
      }),
      Attendance.countDocuments({
        library: library._id,
        checkIn: { $gte: startOfDay, $lte: endOfDay },
      }),
    ]);

    // Calculate total completed study minutes today
    const totalMinutesCompleted = attendanceRecords.reduce(
      (acc, curr) => acc + (curr.durationMinutes || 0),
      0
    );

    let filteredRecords = attendanceRecords;
    if (search) {
      const q = search.toLowerCase();
      filteredRecords = attendanceRecords.filter((rec) => {
        const name = rec.student?.user?.name?.toLowerCase() || "";
        const adm = rec.student?.admissionNumber?.toLowerCase() || "";
        const seat = String(rec.seat?.seatNumber || "");
        return name.includes(q) || adm.includes(q) || seat.includes(q);
      });
    }

    return res.status(200).json({
      message: "Daily attendance fetched successfully",
      date: startOfDay.toISOString().split("T")[0],
      stats: {
        currentlyInside: currentlyInsideCount,
        totalCheckInsToday: allTodayCount,
        totalStudyHoursToday: (totalMinutesCompleted / 60).toFixed(1),
      },
      attendance: filteredRecords,
    });
  } catch (error) {
    console.error("getDailyAttendance error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch daily attendance" });
  }
};

/**
 * 3. GET STUDENT ATTENDANCE HISTORY (For student profile study hours log)
 */
export const getStudentAttendanceHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days = 30 } = req.query;

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - Number(days));
    sinceDate.setHours(0, 0, 0, 0);

    const logs = await Attendance.find({
      student: studentId,
      library: library._id,
      checkIn: { $gte: sinceDate },
    })
      .populate("seat", "seatNumber floor")
      .sort({ checkIn: -1 });

    const totalMinutes = logs.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const daysPresent = new Set(logs.map((l) => new Date(l.date).toDateString())).size;
    const avgDailyHours = daysPresent > 0 ? (totalMinutes / 60 / daysPresent).toFixed(1) : "0";

    return res.status(200).json({
      message: "Student attendance history retrieved",
      stats: {
        totalHours,
        daysPresent,
        avgDailyHours,
        totalSessions: logs.length,
      },
      logs,
    });
  } catch (error) {
    console.error("getStudentAttendanceHistory error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch attendance history" });
  }
};
