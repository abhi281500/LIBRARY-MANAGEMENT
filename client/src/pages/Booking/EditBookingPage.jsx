import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  getBookingById,
  updateBooking,
} from "../../services/booking.service.js";
import {
  CalendarCheck,
  Armchair,
  User,
  DollarSign,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function EditBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      startDate: "",
      endDate: "",
      amount: "",
      shift: "FULL_DAY",
    },
  });

  // 1. Fetch Existing Booking Data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const res = await getBookingById(id);
      const b = res.booking;

      // Format ISO string to YYYY-MM-DD for date inputs
      const sDate = b.startDate ? new Date(b.startDate).toISOString().split("T")[0] : "";
      const eDate = b.endDate ? new Date(b.endDate).toISOString().split("T")[0] : "";

      reset({
        startDate: sDate,
        endDate: eDate,
        amount: b.amount || "",
        shift: b.shift || "FULL_DAY",
      });

      return b;
    },
    enabled: !!id,
  });

  // 2. Update Mutation
  const updateMutation = useMutation({
    mutationFn: updateBooking,
    onSuccess: (res) => {
      toast.success(res.message || "Booking updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate("/bookings");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update booking");
    },
  });

  const onSubmit = (formData) => {
    updateMutation.mutate({
      id,
      payload: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        amount: Number(formData.amount),
        shift: formData.shift,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <h3 className="text-lg font-bold">Failed to load booking</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          {error?.response?.data?.message || "Booking record not found or access denied."}
        </p>
        <Link
          to="/bookings"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
        >
          Back to Bookings
        </Link>
      </div>
    );
  }

  const booking = data;
  const student = booking?.student;
  const studentName = student?.user?.name || student?.name || "Student";
  const seatNumber = booking?.seat?.seatNumber ? `Desk #${booking.seat.seatNumber}` : "Flexi Desk";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back Link */}
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bookings List
        </Link>

        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-indigo-400" />
            Edit Desk Booking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Update validity dates, shift timing slot, and renewal amount for this student allocation.
          </p>
        </div>

        {/* Booking Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Student</span>
              <p className="text-sm font-bold text-white leading-tight">{studentName}</p>
              <p className="text-[11px] text-slate-400 font-mono">{student?.admissionNumber || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Allotted Seat</span>
              <p className="text-sm font-bold text-emerald-400 leading-tight">{seatNumber}</p>
              <p className="text-[11px] text-slate-400">Status: {booking?.status || "ACTIVE"}</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl"
        >
          {/* Shift Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> Shift / Timing Slot
            </label>
            <select
              {...register("shift")}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-white outline-none focus:border-indigo-500 transition"
            >
              <option value="FULL_DAY">Full Day (24-Hour / Open Access)</option>
              <option value="MORNING">Morning Shift (06:00 AM - 02:00 PM)</option>
              <option value="EVENING">Evening Shift (02:00 PM - 10:00 PM)</option>
              <option value="NIGHT">Night Shift (10:00 PM - 06:00 AM)</option>
              <option value="CUSTOM">Custom Flexible Slot</option>
            </select>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" /> Start Date
              </label>
              <input
                type="date"
                {...register("startDate", { required: "Start date is required" })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-white outline-none focus:border-indigo-500 transition"
              />
              {errors.startDate && (
                <p className="text-red-400 text-xs mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" /> Expiry / End Date
              </label>
              <input
                type="date"
                {...register("endDate", { required: "End date is required" })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-white outline-none focus:border-indigo-500 transition"
              />
              {errors.endDate && (
                <p className="text-red-400 text-xs mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Fee Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 1000"
              {...register("amount", {
                required: "Amount is required",
                valueAsNumber: true,
              })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-white outline-none focus:border-indigo-500 transition"
            />
            {errors.amount && (
              <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-indigo-600/30 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Booking Details</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/bookings")}
              className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}