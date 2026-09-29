import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    library: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },
    name: {
      type: String, // e.g., "Morning Shift", "Evening Shift", "Full Day"
      required: true,
      trim: true,
    },
    startTime: {
      type: String, // "06:00 AM"
      required: true,
    },
    endTime: {
      type: String, // "02:00 PM"
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Shift", shiftSchema);