import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    library: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Expense title/description is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "ELECTRICITY",
        "RENT",
        "INTERNET",
        "CLEANING",
        "MAINTENANCE",
        "SALARY",
        "WATER_TEA",
        "MARKETING",
        "SOFTWARE",
        "OTHER",
      ],
      default: "OTHER",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentMode: {
      type: String,
      enum: ["UPI", "CASH", "CARD", "BANK_TRANSFER"],
      default: "UPI",
    },
    expenseDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    receiptNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Expense", ExpenseSchema);
