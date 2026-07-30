import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import seatRoutes from "./routes/seat.routes.js";
import libraryRoutes from "./routes/library.routes.js"
import bookingRoutes from "./routes/booking.routes.js"
import studentRoutes from "./routes/student.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"


const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));    
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/students",studentRoutes)
app.use("/api/seats",seatRoutes)
app.use("/api/libraries",libraryRoutes)
app.use("/api/dashboard",dashboardRoutes)
app.use("/api/bookings",bookingRoutes)

export default app;
