import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "@exortek/express-mongo-sanitize";
import rateLimit from "express-rate-limit";

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

// 1. Security Headers (Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Allows cross-origin QR code & dynamic media rendering
  })
);

// 2. Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// 3. Strict CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://library-management-rust-rho.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(new Error("Blocked by CORS security policy"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-razorpay-signature"],
  })
);

// 4. Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again later." },
});
app.use("/api/", globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login/register attempts per 15 mins to prevent brute-force
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again in 15 minutes." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

const portalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 45, // 45 lookups per 15 mins to prevent scraping
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many portal lookup requests. Please wait a few minutes." },
});
app.use("/api/portal/lookup", portalLimiter);

// 5. Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 6. Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "StudySpace OS API",
    environment: process.env.NODE_ENV || "development",
  });
});

// 7. API Routes
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

// 8. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// 9. Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Unhandled Error]:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
