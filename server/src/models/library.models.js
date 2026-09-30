import mongoose from "mongoose";

export const DEFAULT_WHATSAPP_TEMPLATES = {
  RENEWAL_DUE: `👋 Hello *{student_name}*,\n\nThis is a friendly reminder from *{library_name}*.\nYour study desk allocation (*Seat #{seat_number}*, *{shift}*) is due for renewal on *{expiry_date}* ({days_left} remaining).\n\n💰 *Renewal Amount:* ₹{amount}\n📱 *UPI ID:* {upi_id}\n\nPlease renew on or before the due date to retain your desk allocation.\n\nThank you!\n*Helpline:* {library_phone}`,

  ADMISSION_CONFIRMATION: `🎉 Welcome to *{library_name}*, *{student_name}*!\n\nYour library membership and study desk are confirmed:\n• *Admission ID:* {admission_no}\n• *Seat Allocated:* Desk #{seat_number} ({shift})\n• *Valid Up To:* {expiry_date}\n\n📌 *Library Guidelines:*\n- Maintain pin-drop silence in all study rooms.\n- Please present your digital ID card at check-in.\n- Keep your desk clean and organized.\n\nHelpline: {library_phone}`,

  PAYMENT_RECEIPT: `🧾 *Fee Payment Receipt - {library_name}*\n\nDear *{student_name}*,\nWe have successfully received your fee payment of *₹{amount}*.\n\n• *Receipt ID:* {receipt_no}\n• *Seat:* Desk #{seat_number} ({shift})\n• *Valid Up To:* {expiry_date}\n• *Payment Mode:* {payment_mode}\n\nThank you for studying with us!`,

  OVERDUE_NOTICE: `⚠️ *Urgent Renewal Notice - {library_name}*\n\nDear *{student_name}*,\nYour seat allocation (*Seat #{seat_number}*) expired on *{expiry_date}*.\n\nPlease clear the pending renewal fee of *₹{amount}* today to retain your desk, or it will be released for new admissions.\n\nUPI: {upi_id}\nHelpline: {library_phone}`,
};

const LibrarySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscription: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE"],
      default: "FREE",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    openTime: {
      type: String,
      required: true,
    },
    closeTime: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    upiId: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      maxlength: 500,
    },
    totalSeats: {
      type: Number,
      min: 1,
      required: true,
    },
    whatsappTemplates: {
      RENEWAL_DUE: {
        type: String,
        default: DEFAULT_WHATSAPP_TEMPLATES.RENEWAL_DUE,
      },
      ADMISSION_CONFIRMATION: {
        type: String,
        default: DEFAULT_WHATSAPP_TEMPLATES.ADMISSION_CONFIRMATION,
      },
      PAYMENT_RECEIPT: {
        type: String,
        default: DEFAULT_WHATSAPP_TEMPLATES.PAYMENT_RECEIPT,
      },
      OVERDUE_NOTICE: {
        type: String,
        default: DEFAULT_WHATSAPP_TEMPLATES.OVERDUE_NOTICE,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Library", LibrarySchema);