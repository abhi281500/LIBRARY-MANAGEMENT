import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  getAllBookings,
  cancelBooking,
} from "../../services/booking.service.js";
import { getWhatsAppTemplates } from "../../services/library.service.js";
import {
  formatTemplateMessage,
  sendWhatsAppMessage,
  DEFAULT_TEMPLATES,
} from "../../utils/whatsappHelper.js";
import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import {
  CalendarCheck,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Armchair,
  Clock,
  MessageCircle,
  Users,
  TrendingUp,
  XCircle,
  CheckCircle2,
  Calendar,
  Filter,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function AllBookingsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [shiftFilter, setShiftFilter] = useState("ALL");
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // 1. Fetch Bookings
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: getAllBookings,
  });

  // 2. Fetch WhatsApp Template configuration
  const { data: templateData } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: getWhatsAppTemplates,
  });

  const bookings = data?.bookings || [];

  // Cancel Booking Mutation
  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: (res) => {
      toast.success(res?.message || "Booking cancelled successfully");
      setShowCancelDialog(false);
      setBookingToCancel(null);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["all-seats"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    },
  });

  const handleConfirmCancel = () => {
    if (!bookingToCancel?._id) return;
    cancelMutation.mutate(bookingToCancel._id);
  };

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

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt || 0);
  };

  const getShiftBadge = (shift) => {
    switch (shift) {
      case "MORNING":
        return { label: "Morning", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "EVENING":
        return { label: "Evening", bg: "bg-indigo-50 text-indigo-800 border-indigo-200" };
      case "NIGHT":
        return { label: "Night", bg: "bg-purple-50 text-purple-800 border-purple-200" };
      case "FULL_DAY":
      default:
        return { label: "Full Day", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    }
  };

  const getValidityBadge = (endDateStr, status) => {
    if (status !== "ACTIVE" || !endDateStr) return null;
    const diffDays = Math.ceil((new Date(endDateStr) - new Date()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
          Expired {Math.abs(diffDays)}d ago
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
          Expires Today
        </span>
      );
    }
    if (diffDays <= 3) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
          {diffDays} days left
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
        {diffDays} days left
      </span>
    );
  };

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const student = b.student || {};
      const user = student.user || {};
      const studentName = (user.name || "").toLowerCase();
      const adm = (student.admissionNumber || "").toLowerCase();
      const seatNo = String(b.seat?.seatNumber || "").toLowerCase();
      const shift = (b.shift || "FULL_DAY").toUpperCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        studentName.includes(q) || adm.includes(q) || seatNo.includes(q);
      const matchesStatus =
        statusFilter === "ALL" || b.status === statusFilter;
      const matchesShift =
        shiftFilter === "ALL" || shift === shiftFilter;

      return matchesSearch && matchesStatus && matchesShift;
    });
  }, [bookings, searchQuery, statusFilter, shiftFilter]);

  // Executive Stats
  const activeCount = useMemo(
    () => bookings.filter((b) => b.status === "ACTIVE").length,
    [bookings]
  );
  const totalRevenue = useMemo(
    () =>
      bookings.reduce((sum, b) => sum + Number(b.amount || 0), 0),
    [bookings]
  );

  // WhatsApp Sender
  const handleSendWhatsApp = (booking) => {
    const user = booking.student?.user;
    if (!user?.phone) {
      toast.error("Student phone number not available");
      return;
    }

    const templateStr =
      templateData?.templates?.RENEWAL_DUE || DEFAULT_TEMPLATES.RENEWAL_DUE;
    const formattedEndDate = formatDate(booking.endDate);
    const diffDays = Math.ceil(
      (new Date(booking.endDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    const daysLeftText =
      diffDays < 0 ? `expired ${Math.abs(diffDays)}d ago` : `${diffDays} days`;

    const message = formatTemplateMessage(templateStr, {
      studentName: user.name || "Student",
      admissionNo: booking.student?.admissionNumber || "N/A",
      seatNumber: booking.seat?.seatNumber || "N/A",
      shift: booking.shift || "FULL_DAY",
      expiryDate: formattedEndDate,
      daysLeft: daysLeftText,
      amount: String(booking.amount || 0),
      libraryName: templateData?.libraryName || "Study Library",
      libraryPhone: templateData?.libraryPhone || "",
      upiId: templateData?.upiId || "",
    });

    sendWhatsAppMessage(user.phone, message);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Desk Allocations...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Failed to load bookings</h2>
          <p className="mt-2 text-sm text-slate-500">
            {error?.response?.data?.message || "Something went wrong while fetching seat allocations."}
          </p>
          <Link
            to="/bookings/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            + Create Booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <CalendarCheck className="w-8 h-8 text-blue-600" />
              Desk Allocations & Bookings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage active seat subscriptions, shift timings, validity periods, and renewals.
            </p>
          </div>

          <Link
            to="/bookings/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            + Allocate New Desk
          </Link>
        </div>

        {/* 1. EXECUTIVE KPI SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">{bookings.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">All-time reservation records</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Desks</span>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Armchair className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-3">{activeCount}</p>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">Currently occupied desks</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Booking Value</span>
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">{formatCurrency(totalRevenue)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Gross subscription fee value</p>
          </div>

        </div>

        {/* 2. DATA TABLE WITH SEARCH & FILTER TOOLBAR */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student, admission #, desk #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Shift Filter */}
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="ALL">All Shifts</option>
                <option value="FULL_DAY">Full Day (24 Hrs)</option>
                <option value="MORNING">Morning (6 AM - 2 PM)</option>
                <option value="EVENING">Evening (2 PM - 10 PM)</option>
                <option value="NIGHT">Night (10 PM - 6 AM)</option>
              </select>
            </div>

            <span className="text-xs font-bold text-slate-500">
              Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> allocations
            </span>
          </div>

          {/* Table */}
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarCheck className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No Desk Allocations Found</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {searchQuery || statusFilter !== "ALL" || shiftFilter !== "ALL"
                  ? "No bookings match your selected search filters."
                  : "Allocate your first student desk to begin tracking study sessions."}
              </p>
              <Link
                to="/bookings/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> + New Allocation
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Student Member</th>
                    <th className="py-3 px-4">Desk & Shift</th>
                    <th className="py-3 px-4">Allotment Period</th>
                    <th className="py-3 px-4">Fee Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredBookings.map((b) => {
                    const student = b.student || {};
                    const user = student.user || {};
                    const studentName = user.name || "Unknown Student";
                    const studentPhone = user.phone || "";
                    const adm = student.admissionNumber || "N/A";
                    const seat = b.seat || {};
                    const seatNo = seat.seatNumber ? `#${seat.seatNumber}` : "Unassigned";
                    const floor = seat.floor || 1;
                    const shiftInfo = getShiftBadge(b.shift);

                    return (
                      <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                        
                        {/* Student Info */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                              {studentName.charAt(0)}
                            </div>
                            <div>
                              <Link
                                to={`/students/${student._id}`}
                                className="font-bold text-slate-900 hover:text-blue-600 transition-colors leading-tight block"
                              >
                                {studentName}
                              </Link>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                ADM: {adm}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Desk & Shift */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 flex items-center gap-1">
                              <Armchair className="w-3.5 h-3.5 text-indigo-600" />
                              Desk {seatNo}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">(Fl {floor})</span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border mt-1 ${shiftInfo.bg}`}
                          >
                            {shiftInfo.label}
                          </span>
                        </td>

                        {/* Period & Countdown */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">
                            {formatDate(b.startDate)} → {formatDate(b.endDate)}
                          </div>
                          <div className="mt-1">
                            {getValidityBadge(b.endDate, b.status)}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                          {formatCurrency(b.amount)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "COMPLETED"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {b.status === "ACTIVE" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {b.status || "ACTIVE"}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {studentPhone && (
                              <button
                                onClick={() => handleSendWhatsApp(b)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Send WhatsApp Renewal Reminder"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            )}

                            <Link
                              to={`/students/${student._id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                              title="View Student Profile & Smart ID"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/bookings/${b._id}/edit`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                              title="Edit Booking"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            {b.status === "ACTIVE" && (
                              <button
                                onClick={() => {
                                  setBookingToCancel(b);
                                  setShowCancelDialog(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                                title="Cancel Desk Allocation"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        title="Cancel Seat Booking?"
        message={`Are you sure you want to cancel the desk booking for ${
          bookingToCancel?.student?.user?.name || "this student"
        }? The allocated desk will be freed immediately.`}
        confirmText="Cancel Booking"
        cancelText="Keep Active"
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setShowCancelDialog(false);
          setBookingToCancel(null);
        }}
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}