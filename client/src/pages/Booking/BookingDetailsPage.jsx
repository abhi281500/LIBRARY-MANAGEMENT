import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getBookingById, deleteBooking } from "../../services/booking.service.js";
import { getWhatsAppTemplates } from "../../services/library.service.js";
import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import {
  formatTemplateMessage,
  sendWhatsAppMessage,
  DEFAULT_TEMPLATES,
} from "../../utils/whatsappHelper.js";
import {
  CalendarCheck,
  ArrowLeft,
  User,
  Armchair,
  Clock,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const SHIFT_DETAILS = {
  FULL_DAY: {
    label: "Full Day (24-Hour)",
    time: "06:00 AM - 10:00 PM (Open Access)",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  MORNING: {
    label: "Morning Shift",
    time: "06:00 AM - 02:00 PM",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  EVENING: {
    label: "Evening Shift",
    time: "02:00 PM - 10:00 PM",
    color: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  NIGHT: {
    label: "Night Shift",
    time: "10:00 PM - 06:00 AM",
    color: "bg-purple-50 text-purple-800 border-purple-200",
  },
  CUSTOM: {
    label: "Custom Flexible Slot",
    time: "Flexible Reservation",
    color: "bg-teal-50 text-teal-800 border-teal-200",
  },
};

function BookingPageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBookingById(id),
    enabled: !!id,
  });

  const { data: templateData } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: getWhatsAppTemplates,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      toast.success("Booking record deleted and desk freed successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["seatMatrix"] });
      queryClient.invalidateQueries({ queryKey: ["seats"] });
      navigate("/bookings");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete booking");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">Loading Desk Allocation...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Allocation Not Found</h2>
          <p className="mt-2 text-xs text-slate-500">
            {error?.response?.data?.message || "This booking record does not exist or has been removed."}
          </p>
          <Link
            to="/bookings"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
          >
            ← Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const booking = data.booking;
  const student = booking.student || {};
  const user = student.user || {};
  const seat = booking.seat || {};
  const shiftKey = booking.shift || "FULL_DAY";
  const shiftInfo = SHIFT_DETAILS[shiftKey] || SHIFT_DETAILS.FULL_DAY;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const now = new Date();
  const endDate = new Date(booking.endDate);
  const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  const handleSendReminder = () => {
    if (!user.phone) {
      toast.error("Student mobile number is missing");
      return;
    }

    const templateStr =
      templateData?.templates?.RENEWAL_DUE || DEFAULT_TEMPLATES.RENEWAL_DUE;
    const formattedEndDate = formatDate(booking.endDate);
    const daysLeftText =
      diffDays < 0 ? `expired ${Math.abs(diffDays)}d ago` : `${diffDays} days`;

    const message = formatTemplateMessage(templateStr, {
      studentName: user.name || "Student",
      admissionNo: student.admissionNumber || "N/A",
      seatNumber: seat.seatNumber || "N/A",
      shift: shiftKey,
      expiryDate: formattedEndDate,
      daysLeft: daysLeftText,
      amount: String(booking.amount || 0),
      libraryName: templateData?.libraryName || "Study Library",
      libraryPhone: templateData?.libraryPhone || "",
      upiId: templateData?.upiId || "",
    });

    sendWhatsAppMessage(user.phone, message);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Top Breadcrumb & Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link
            to="/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Bookings
          </Link>

          <div className="flex items-center gap-2">
            {user.phone && (
              <button
                type="button"
                onClick={handleSendReminder}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Reminder
              </button>
            )}

            <Link
              to={`/bookings/${booking._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
            >
              <Edit className="w-4 h-4 text-slate-600" /> Edit Details
            </Link>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition"
            >
              <Trash2 className="w-4 h-4 text-rose-600" /> Delete
            </button>
          </div>
        </div>

        {/* Primary Banner Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/20 shrink-0">
                {(user.name || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Desk Allocation Record
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {user.name || "Student"}
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  ADM ID: {student.admissionNumber || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${
                  booking.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {booking.status === "ACTIVE" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {booking.status || "ACTIVE"}
              </span>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  diffDays < 0
                    ? "bg-rose-100 text-rose-800 border-rose-200"
                    : diffDays === 0
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {diffDays < 0 ? `Expired ${Math.abs(diffDays)}d ago` : diffDays === 0 ? "Expires Today" : `${diffDays} Days Left`}
              </span>
            </div>
          </div>

          {/* Grid Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            
            {/* Shift Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Shift Timing Slot</span>
              </div>
              <p className="text-sm font-black text-slate-900 pt-1">
                {shiftInfo.label}
              </p>
              <p className="text-xs text-slate-500 font-medium">{shiftInfo.time}</p>
              <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded border ${shiftInfo.color}`}>
                Slot: {shiftKey}
              </span>
            </div>

            {/* Desk Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <Armchair className="w-4 h-4 text-emerald-600" />
                <span>Allocated Desk</span>
              </div>
              <p className="text-base font-black text-slate-900 pt-1">
                Desk #{seat.seatNumber || "Unassigned"}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Floor {seat.floor || 1} • {seat.type || "NORMAL"} Desk
              </p>
              <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Desk Physical Status: {seat.status || "OCCUPIED"}
              </span>
            </div>

            {/* Fee Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>Fee Amount</span>
              </div>
              <p className="text-2xl font-black text-slate-900 pt-1">
                ₹{booking.amount || 0}
              </p>
              <p className="text-xs text-slate-500 font-medium">Subscription Commitment</p>
              <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Created: {formatDate(booking.createdAt)}
              </span>
            </div>

          </div>

          {/* Allocation Dates Section */}
          <div className="mt-6 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Start Date</span>
                <p className="text-sm font-black text-slate-900">{formatDate(booking.startDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Expiry / End Date</span>
                <p className="text-sm font-black text-slate-900">{formatDate(booking.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Student Profile Quick View */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-900">Contact:</span> {user.phone || "No phone"} • {user.email || "No email"}
            </div>

            <Link
              to={`/students/${student._id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View Student Profile & Smart Card</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={showDeleteModal}
        title="Delete Booking Record?"
        message={`Are you sure you want to delete the booking for "${user.name || "Student"}" on Desk #${seat.seatNumber || "N/A"}? This will permanently remove this record and free up the desk.`}
        confirmText="Yes, Delete Booking"
        cancelText="Cancel"
        onConfirm={() => deleteMutation.mutate(booking._id)}
        onClose={() => setShowDeleteModal(false)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default BookingPageDetails;
