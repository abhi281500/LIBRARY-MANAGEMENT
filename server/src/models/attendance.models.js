import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    library: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },
    seat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
    },
    date: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },
    checkIn: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkOut: {
      type: Date,
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["CHECKED_IN", "CHECKED_OUT"],
      default: "CHECKED_IN",
      required: true,
    },
    checkInMode: {
      type: String,
      enum: ["QR_SCAN", "MANUAL", "BARCODE"],
      default: "QR_SCAN",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by library and date
AttendanceSchema.index({ library: 1, date: 1, student: 1 });
AttendanceSchema.index({ library: 1, status: 1 });

export default mongoose.model("Attendance", AttendanceSchema);
