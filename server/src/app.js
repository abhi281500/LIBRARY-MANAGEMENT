import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import seatRoutes from "./routes/seat.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import studentRoutes from "./routes/student.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import superadminRoutes from "./routes/superadmin.routes.js";
import portalRoutes from "./routes/portal.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for SaaS client apps
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check API for production monitoring
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "Study Library OS API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/libraries", libraryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/portal", portalRoutes);

export default app;

