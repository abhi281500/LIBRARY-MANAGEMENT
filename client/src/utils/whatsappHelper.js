/**
 * WhatsApp Helper Utilities for Template Interpolation & Quick Delivery
 */

export const DEFAULT_TEMPLATES = {
  RENEWAL_DUE: `👋 Hello *{student_name}*,\n\nThis is a friendly reminder from *{library_name}*.\nYour study desk allocation (*Seat #{seat_number}*, *{shift}*) is due for renewal on *{expiry_date}* ({days_left} remaining).\n\n💰 *Renewal Amount:* ₹{amount}\n📱 *UPI ID:* {upi_id}\n\nPlease renew on or before the due date to retain your desk allocation.\n\nThank you!\n*Helpline:* {library_phone}`,

  ADMISSION_CONFIRMATION: `🎉 Welcome to *{library_name}*, *{student_name}*!\n\nYour library membership and study desk are confirmed:\n• *Admission ID:* {admission_no}\n• *Seat Allocated:* Desk #{seat_number} ({shift})\n• *Valid Up To:* {expiry_date}\n\n📌 *Library Guidelines:*\n- Maintain pin-drop silence in all study rooms.\n- Please present your digital ID card at check-in.\n- Keep your desk clean and organized.\n\nHelpline: {library_phone}`,

  PAYMENT_RECEIPT: `🧾 *Fee Payment Receipt - {library_name}*\n\nDear *{student_name}*,\nWe have successfully received your fee payment of *₹{amount}*.\n\n• *Receipt ID:* {receipt_no}\n• *Seat:* Desk #{seat_number} ({shift})\n• *Valid Up To:* {expiry_date}\n• *Payment Mode:* {payment_mode}\n\nThank you for studying with us!`,

  OVERDUE_NOTICE: `⚠️ *Urgent Renewal Notice - {library_name}*\n\nDear *{student_name}*,\nYour seat allocation (*Seat #{seat_number}*) expired on *{expiry_date}*.\n\nPlease clear the pending renewal fee of *₹{amount}* today to retain your desk, or it will be released for new admissions.\n\nUPI: {upi_id}\nHelpline: {library_phone}`,
};

export const formatTemplateMessage = (templateStr, params = {}) => {
  if (!templateStr) return "";

  const {
    studentName = "Student",
    admissionNo = "N/A",
    seatNumber = "N/A",
    shift = "FULL_DAY",
    expiryDate = "N/A",
    daysLeft = "soon",
    amount = "0",
    receiptNo = "N/A",
    paymentMode = "UPI",
    libraryName = "Study Library",
    libraryPhone = "",
    upiId = "",
  } = params;

  return templateStr
    .replace(/{student_name}/g, studentName)
    .replace(/{admission_no}/g, admissionNo)
    .replace(/{seat_number}/g, seatNumber)
    .replace(/{shift}/g, shift)
    .replace(/{expiry_date}/g, expiryDate)
    .replace(/{days_left}/g, daysLeft)
    .replace(/{amount}/g, amount)
    .replace(/{receipt_no}/g, receiptNo)
    .replace(/{payment_mode}/g, paymentMode)
    .replace(/{library_name}/g, libraryName)
    .replace(/{library_phone}/g, libraryPhone)
    .replace(/{upi_id}/g, upiId || "Reception QR");
};

export const sendWhatsAppMessage = (phone, message) => {
  if (!phone) return false;

  let cleanPhone = String(phone).replace(/[^0-9]/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
  return true;
};
