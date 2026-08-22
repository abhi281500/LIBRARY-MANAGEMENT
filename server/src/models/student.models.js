import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    library: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },

    admissionNumber: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Same admission number allowed in different libraries,
// but duplicate admission number is NOT allowed within same library.
studentSchema.index(
  { library: 1, admissionNumber: 1 },
  { unique: true }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;