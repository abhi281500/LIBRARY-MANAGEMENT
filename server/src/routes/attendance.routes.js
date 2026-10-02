import express from "express";
import {
  toggleCheckInOut,
  getDailyAttendance,
  getStudentAttendanceHistory,
} from "../controllers/attendance.controller.js";
import auth from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middlewares.js";

const router = express.Router();

// 1. SMART TOGGLE CHECK-IN / CHECK-OUT (QR scan or Admission No)
router.post(
  "/toggle",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  toggleCheckInOut
);

// 2. GET DAILY ATTENDANCE (Live count, filters, date feed)
router.get(
  "/daily",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  getDailyAttendance
);

// 3. GET STUDENT ATTENDANCE HISTORY
router.get(
  "/student/:studentId",
  auth,
  getStudentAttendanceHistory
);

export default router;
