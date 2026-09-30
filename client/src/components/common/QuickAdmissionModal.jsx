import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createStudent } from "../../services/student.service.js";
import { createBooking } from "../../services/booking.service.js";
import { createPayment } from "../../services/payment.service.js";
import { getSeatMatrix } from "../../services/seat.service.js";
import {
  Sparkles,
  User,
  Phone,
  Armchair,
  Clock,
  CreditCard,
  Calendar,
  MessageCircle,
  CheckCircle2,
  X,
} from "lucide-react";

function QuickAdmissionModal({ open, onClose }) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState(
    `ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [shift, setShift] = useState("FULL_DAY");
  const [selectedSeatId, setSelectedSeatId] = useState("");
  const [amount, setAmount] = useState("900");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedAdmission, setCompletedAdmission] = useState(null);

  // Fetch Available Seats for current shift
  const { data: seatData } = useQuery({
    queryKey: ["seatMatrix", shift],
    queryFn: () => getSeatMatrix({ shift: shift === "ALL" ? undefined : shift }),
    enabled: open,
  });

  const availableSeats = (seatData?.matrix || []).filter(
    (s) => !s.isOccupied && s.physicalStatus === "AVAILABLE"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !selectedSeatId) {
      toast.error("Please enter student name, phone, and select an available seat");
      return;
    }

    try {
      setIsSubmitting(true);

      const generatedEmail =
        email.trim() ||
        `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}_${Date.now().toString().slice(-4)}@library.com`;

      // 1. Create Student
      const studentRes = await createStudent({
        name: name.trim(),
        email: generatedEmail,
        phone: phone.trim(),
        password: "Student@" + Math.floor(1000 + Math.random() * 9000),
        admissionNumber: admissionNumber.trim(),
        joiningDate: new Date().toISOString(),
        status: "ACTIVE",
      });

      const studentId = studentRes?.student?._id;
      if (!studentId) throw new Error("Failed to create student profile");

      // 2. Create Booking (1 Month from now)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const bookingRes = await createBooking({
        studentId,
        seatId: selectedSeatId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        shift,
        amount: Number(amount) || 0,
      });

      const bookingId = bookingRes?.booking?._id;
      if (!bookingId) throw new Error("Failed to create booking");

      // 3. Create Payment
      if (Number(amount) > 0) {
        await createPayment({
          bookingId,
          paymentMethod,
        });
      }

      toast.success("Student admitted and seat allocated successfully!");

      queryClient.invalidateQueries({ queryKey: ["all-students"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["seatMatrix"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });

      const chosenSeatObj = availableSeats.find((s) => s._id === selectedSeatId);

      setCompletedAdmission({
        name: name.trim(),
        phone: phone.trim(),
        admissionNumber,
        seatNumber: chosenSeatObj?.seatNumber || "Seat",
        shift,
        amount,
        validTill: endDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      });
    } catch (err) {
      console.error("Fast Admission Error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to complete fast admission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setSelectedSeatId("");
    setCompletedAdmission(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> 1-Click Fast Flow
            </span>
            <h3 className="text-lg font-black text-slate-900">
              {completedAdmission ? "Admission Confirmed! 🎉" : "Quick Student Admission & Seat Allotment"}
            </h3>
          </div>
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {completedAdmission ? (
          <div className="py-6 space-y-4">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-base font-bold text-emerald-950">
                Seat {completedAdmission.seatNumber} Allotted to {completedAdmission.name}
              </h4>
              <p className="text-xs text-emerald-700 mt-1">
                Adm No: {completedAdmission.admissionNumber} • Valid till {completedAdmission.validTill}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p>💺 <strong>Seat:</strong> {completedAdmission.seatNumber} ({completedAdmission.shift})</p>
              <p>💰 <strong>Fee Received:</strong> ₹{completedAdmission.amount}</p>
              <p>📞 <strong>Phone:</strong> {completedAdmission.phone}</p>
            </div>

            <a
              href={`https://api.whatsapp.com/send?phone=${completedAdmission.phone.replace(
                /[^0-9]/g,
                ""
              )}&text=${encodeURIComponent(
                `*WELCOME TO THE LIBRARY!* 📚✨\n\n👤 *Student:* ${completedAdmission.name}\n🆔 *Adm No:* ${completedAdmission.admissionNumber}\n🪑 *Allotted Seat:* ${completedAdmission.seatNumber}\n⏰ *Shift:* ${completedAdmission.shift}\n📅 *Valid Till:* ${completedAdmission.validTill}\n💰 *Fee Paid:* ₹${completedAdmission.amount}\n\nKeep studying hard! Let us know if you need anything at reception.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <MessageCircle className="w-4 h-4" /> Send WhatsApp Welcome Card
            </a>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              Done / Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Choose Shift *</label>
                <select
                  value={shift}
                  onChange={(e) => {
                    setShift(e.target.value);
                    setSelectedSeatId("");
                  }}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500 bg-white"
                >
                  <option value="FULL_DAY">Full Day (6AM - 10PM)</option>
                  <option value="MORNING">Morning Shift (6AM - 2PM)</option>
                  <option value="EVENING">Evening Shift (2PM - 10PM)</option>
                  <option value="NIGHT">Night Shift (10PM - 6AM)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Available Desk * ({availableSeats.length} Free)
                </label>
                <select
                  required
                  value={selectedSeatId}
                  onChange={(e) => setSelectedSeatId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500 bg-white font-bold"
                >
                  <option value="">-- Select Free Seat --</option>
                  {availableSeats.map((seat) => (
                    <option key={seat._id} value={seat._id}>
                      {seat.seatNumber} (Floor {seat.floor} • {seat.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Monthly Fee (₹) *</label>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500 font-bold bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500 bg-white"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CASH">Cash at Reception</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Allotting Seat..." : "Enroll & Allot Seat"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default QuickAdmissionModal;