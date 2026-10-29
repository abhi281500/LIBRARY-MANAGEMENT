import { useEffect, useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema } from "../../schemas/booking.schema.js";
import { createBooking } from "../../services/booking.service.js";
import { createPayment } from "../../services/payment.service.js";
import { getAllStudents } from "../../services/student.service.js";
import { getSeatMatrix } from "../../services/seat.service.js";
import {
  CalendarCheck,
  ArrowLeft,
  Armchair,
  Clock,
  User,
  Calendar,
  DollarSign,
  CheckCircle2,
  CreditCard,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

const SHIFT_OPTIONS = [
  {
    id: "FULL_DAY",
    label: "Full Day",
    subtext: "24-Hour / Open Access (06:00 AM - 10:00 PM)",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "MORNING",
    label: "Morning Shift",
    subtext: "06:00 AM - 02:00 PM",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "EVENING",
    label: "Evening Shift",
    subtext: "02:00 PM - 10:00 PM",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "NIGHT",
    label: "Night Shift",
    subtext: "10:00 PM - 06:00 AM",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "CUSTOM",
    label: "Custom Slot",
    subtext: "Flexible / Hourly Reservation",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
  },
];

function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const urlStudentId = searchParams.get("studentId") || "";
  const urlSeatId = searchParams.get("seatId") || "";
  const urlShift = searchParams.get("shift") || "FULL_DAY";
  const isRenew = searchParams.get("renew") === "true";

  // Quick payment option
  const [recordPaymentNow, setRecordPaymentNow] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  // Date calculation defaults
  const todayStr = new Date().toISOString().split("T")[0];
  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + 30);
  const defaultEndDateStr = defaultEndDate.toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      studentId: urlStudentId,
      seatId: urlSeatId,
      shift: urlShift,
      startDate: todayStr,
      endDate: defaultEndDateStr,
      amount: 1000,
    },
  });

  const selectedShift = watch("shift");
  const selectedStartDate = watch("startDate");

  // Sync URL query params if present
  useEffect(() => {
    if (urlStudentId) setValue("studentId", urlStudentId);
    if (urlSeatId) setValue("seatId", urlSeatId);
    if (urlShift) setValue("shift", urlShift);
  }, [urlStudentId, urlSeatId, urlShift, setValue]);

  // Fetch Students (limit unlimited/all for dropdown)
  const { data: studentData, isLoading: studentsLoading } = useQuery({
    queryKey: ["students-dropdown"],
    queryFn: () => getAllStudents({ limit: 100 }),
  });
  const students = studentData?.students || [];

  // Fetch Seat Matrix for selected shift
  const { data: seatMatrixData, isLoading: seatsLoading } = useQuery({
    queryKey: ["seatMatrix", selectedShift],
    queryFn: () => getSeatMatrix({ shift: selectedShift }),
  });

  const matrix = seatMatrixData?.matrix || [];
  const availableSeats = useMemo(
    () => matrix.filter((s) => !s.isOccupied && s.physicalStatus === "AVAILABLE"),
    [matrix]
  );
  const occupiedSeats = useMemo(
    () => matrix.filter((s) => s.isOccupied || s.physicalStatus !== "AVAILABLE"),
    [matrix]
  );

  // Set quick duration
  const handleSetDuration = (days) => {
    const base = selectedStartDate ? new Date(selectedStartDate) : new Date();
    base.setDate(base.getDate() + days);
    setValue("endDate", base.toISOString().split("T")[0]);
  };

  // Mutation to create booking (and optional payment)
  const bookingMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await createBooking(payload);
      const booking = res?.booking;

      if (recordPaymentNow && booking?._id && Number(payload.amount) > 0) {
        try {
          await createPayment({
            bookingId: booking._id,
            paymentMethod,
          });
        } catch (payErr) {
          console.warn("Auto payment recording failed:", payErr);
          toast.error("Booking created, but payment could not be automatically recorded.");
        }
      }

      return res;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Desk allocated successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["seatMatrix"] });
      queryClient.invalidateQueries({ queryKey: ["seats"] });
      queryClient.invalidateQueries({ queryKey: ["all-seats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["expiringSoonBookings"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      navigate("/bookings");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create desk allocation"
      );
    },
  });

  const onSubmit = (formData) => {
    bookingMutation.mutate({
      studentId: formData.studentId,
      seatId: formData.seatId,
      shift: formData.shift,
      startDate: formData.startDate,
      endDate: formData.endDate,
      amount: Number(formData.amount),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Bookings List
          </Link>

          {isRenew && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5" /> Renewal Flow
            </span>
          )}
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {isRenew ? "Renew Student Desk Subscription" : "Allocate Desk & Create Booking"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Select student member, choose shift timing slot, and allocate an available desk.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            
            {/* 1. SHIFT TIMING SELECTOR (KEY REQUIREMENT) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  1. Choose Shift Timing Slot *
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">
                  {availableSeats.length} Desks Free in this Shift
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SHIFT_OPTIONS.map((opt) => {
                  const isChecked = selectedShift === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`relative flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        value={opt.id}
                        {...register("shift")}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-slate-900">{opt.label}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${opt.badge}`}>
                            {opt.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{opt.subtext}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.shift && (
                <p className="text-xs font-semibold text-rose-600 mt-1">{errors.shift.message}</p>
              )}
            </div>

            {/* 2. STUDENT SELECTION */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                2. Select Student Member *
              </label>

              <select
                {...register("studentId")}
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 px-4 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="">-- Choose Enrolled Student --</option>
                {students.map((student) => {
                  const u = student.user || {};
                  return (
                    <option key={student._id} value={student._id}>
                      {u.name || "Student"} • Adm: {student.admissionNumber || "N/A"} • Phone: {u.phone || "No phone"}
                    </option>
                  );
                })}
              </select>
              {errors.studentId && (
                <p className="text-xs font-semibold text-rose-600 mt-1">{errors.studentId.message}</p>
              )}
            </div>

            {/* 3. SEAT / DESK SELECTION */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Armchair className="w-4 h-4 text-emerald-600" />
                  3. Select Desk *
                </label>
                {seatsLoading && (
                  <span className="text-[11px] text-slate-400 font-semibold animate-pulse">
                    Refreshing shift availability...
                  </span>
                )}
              </div>

              <select
                {...register("seatId")}
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 px-4 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
              >
                <option value="">-- Choose Desk --</option>

                {availableSeats.length > 0 && (
                  <optgroup label={`AVAILABLE DESKS IN ${selectedShift} SHIFT (${availableSeats.length})`}>
                    {availableSeats.map((seat) => (
                      <option key={seat._id} value={seat._id}>
                        Desk #{seat.seatNumber} (Floor {seat.floor} • {seat.type}) - AVAILABLE
                      </option>
                    ))}
                  </optgroup>
                )}

                {occupiedSeats.length > 0 && (
                  <optgroup label={`CURRENTLY OCCUPIED IN THIS SHIFT / MAINTENANCE (${occupiedSeats.length})`}>
                    {occupiedSeats.map((seat) => (
                      <option key={seat._id} value={seat._id} disabled>
                        Desk #{seat.seatNumber} (Floor {seat.floor}) - {seat.physicalStatus === "MAINTENANCE" ? "UNDER MAINTENANCE" : "OCCUPIED"}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {errors.seatId && (
                <p className="text-xs font-semibold text-rose-600 mt-1">{errors.seatId.message}</p>
              )}
            </div>

            {/* 4. DATES & QUICK DURATION */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  4. Subscription Period *
                </label>

                {/* Quick Duration Buttons */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Quick add:</span>
                  <button
                    type="button"
                    onClick={() => handleSetDuration(30)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition"
                  >
                    +30 Days (1 Mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDuration(60)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition"
                  >
                    +60 Days (2 Mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDuration(90)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition"
                  >
                    +90 Days (3 Mo)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    {...register("startDate")}
                    className="w-full rounded-2xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.startDate && (
                    <p className="text-xs font-semibold text-rose-600 mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">End / Expiry Date</label>
                  <input
                    type="date"
                    {...register("endDate")}
                    className="w-full rounded-2xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.endDate && (
                    <p className="text-xs font-semibold text-rose-600 mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 5. AMOUNT & PAYMENT OPTIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  5. Booking Amount (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="e.g. 1000"
                  {...register("amount", { valueAsNumber: true })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                {errors.amount && (
                  <p className="text-xs font-semibold text-rose-600 mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Payment Collection
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recordPaymentNow}
                      onChange={(e) => setRecordPaymentNow(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Record fee payment now</span>
                  </label>

                  {recordPaymentNow && (
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="CASH">Cash at Reception</option>
                      <option value="CARD">Debit / Credit Card</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={bookingMutation.isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 py-3.5 px-6 text-xs sm:text-sm font-black text-white shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
              >
                {bookingMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Allocating Desk...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Desk Allocation</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/bookings")}
                className="px-5 py-3.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 transition"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default BookingPage;
