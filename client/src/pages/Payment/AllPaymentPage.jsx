import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  getAllPayments,
  refundPayment,
} from "../../services/payment.service.js";
import { getWhatsAppTemplates } from "../../services/library.service.js";
import {
  formatTemplateMessage,
  sendWhatsAppMessage,
  DEFAULT_TEMPLATES,
} from "../../utils/whatsappHelper.js";
import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import {
  CreditCard,
  Search,
  Plus,
  Eye,
  Edit,
  RotateCcw,
  Receipt,
  MessageCircle,
  Armchair,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Filter,
  ShieldCheck,
} from "lucide-react";

export default function AllPaymentPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [paymentToRefund, setPaymentToRefund] = useState(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  // 1. Fetch Payments
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["payments"],
    queryFn: getAllPayments,
  });

  // 2. Fetch WhatsApp Template configuration
  const { data: templateData } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: getWhatsAppTemplates,
  });

  const payments = data?.payments || [];

  // Refund Mutation
  const refundMutation = useMutation({
    mutationFn: refundPayment,
    onSuccess: (res) => {
      toast.success(res?.message || "Payment refunded successfully");
      setShowRefundDialog(false);
      setPaymentToRefund(null);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to refund payment");
    },
  });

  const handleConfirmRefund = () => {
    if (!paymentToRefund?._id) return;
    refundMutation.mutate(paymentToRefund._id);
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

  const getPaymentModeBadge = (mode) => {
    switch (mode) {
      case "UPI":
        return { label: "UPI / GPay", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "CASH":
        return { label: "Cash", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "CARD":
        return { label: "Card", bg: "bg-blue-50 text-blue-800 border-blue-200" };
      case "BANK_TRANSFER":
      default:
        return { label: "Bank Transfer", bg: "bg-purple-50 text-purple-800 border-purple-200" };
    }
  };

  // Filter Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const student = p.student || {};
      const user = student.user || {};
      const studentName = (user.name || "").toLowerCase();
      const adm = (student.admissionNumber || "").toLowerCase();
      const receiptNo = (p.receiptNumber || "").toLowerCase();
      const seatNo = String(p.booking?.seat?.seatNumber || "").toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        studentName.includes(q) || adm.includes(q) || receiptNo.includes(q) || seatNo.includes(q);
      const matchesStatus =
        statusFilter === "ALL" || p.paymentStatus === statusFilter;
      const matchesMode =
        modeFilter === "ALL" || p.paymentMethod === modeFilter;

      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [payments, searchQuery, statusFilter, modeFilter]);

  // Executive Stats
  const totalCollected = useMemo(() => {
    return payments
      .filter((p) => p.paymentStatus === "PAID")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const totalRefunded = useMemo(() => {
    return payments
      .filter((p) => p.paymentStatus === "REFUNDED")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const paidCount = useMemo(() => {
    return payments.filter((p) => p.paymentStatus === "PAID").length;
  }, [payments]);

  // WhatsApp Receipt Sender
  const handleSendWhatsAppReceipt = (payment) => {
    const user = payment.student?.user;
    if (!user?.phone) {
      toast.error("Student phone number not available");
      return;
    }

    const templateStr =
      templateData?.templates?.PAYMENT_RECEIPT || DEFAULT_TEMPLATES.PAYMENT_RECEIPT;
    const formattedExpiry = payment.booking?.endDate
      ? formatDate(payment.booking.endDate)
      : "Active";

    const message = formatTemplateMessage(templateStr, {
      studentName: user.name || "Student",
      admissionNo: payment.student?.admissionNumber || "N/A",
      seatNumber: payment.booking?.seat?.seatNumber || "N/A",
      shift: payment.booking?.shift || "FULL_DAY",
      expiryDate: formattedExpiry,
      amount: String(payment.amount || 0),
      receiptNo: payment.receiptNumber || `REC-${payment._id?.slice(-6)?.toUpperCase()}`,
      paymentMode: payment.paymentMethod || "UPI",
      libraryName: templateData?.libraryName || "Study Library",
      libraryPhone: templateData?.libraryPhone || "",
    });

    sendWhatsAppMessage(user.phone, message);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Payment Invoices...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Failed to load payments</h2>
          <p className="mt-2 text-sm text-slate-500">
            {error?.response?.data?.message || "Something went wrong while fetching fee transactions."}
          </p>
          <Link
            to="/payments/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            + Create Payment
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
              <Receipt className="w-8 h-8 text-emerald-600" />
              Fee Payments & Invoices
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track student fee transactions, generate digital receipts, and manage refunds.
            </p>
          </div>

          <Link
            to="/payments/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            + Record New Payment
          </Link>
        </div>

        {/* 1. EXECUTIVE KPI SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Collections</span>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-3">{formatCurrency(totalCollected)}</p>
            <p className="text-[11px] text-slate-500 mt-1">{paidCount} settled transactions</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Invoices</span>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">{payments.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">All-time receipt logs</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Refunded</span>
              <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-600 mt-3">{formatCurrency(totalRefunded)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Reversed student fees</p>
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
                  placeholder="Search by receipt #, student, admission #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="PAID">Paid Only</option>
                <option value="PENDING">Pending</option>
                <option value="REFUNDED">Refunded</option>
              </select>

              {/* Mode Filter */}
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Payment Modes</option>
                <option value="UPI">UPI / GPay</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <span className="text-xs font-bold text-slate-500">
              Showing <strong>{filteredPayments.length}</strong> of <strong>{payments.length}</strong> transactions
            </span>
          </div>

          {/* Table */}
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No Payment Records Found</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {searchQuery || statusFilter !== "ALL" || modeFilter !== "ALL"
                  ? "No payments match your selected search criteria."
                  : "Record your first desk fee payment to start tracking invoices."}
              </p>
              <Link
                to="/payments/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> + Record Payment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Receipt ID & Date</th>
                    <th className="py-3 px-4">Student Member</th>
                    <th className="py-3 px-4">Desk Allotted</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredPayments.map((p) => {
                    const student = p.student || {};
                    const user = student.user || {};
                    const studentName = user.name || "Unknown Student";
                    const studentPhone = user.phone || "";
                    const adm = student.admissionNumber || "N/A";
                    const booking = p.booking || {};
                    const seat = booking.seat || {};
                    const seatNo = seat.seatNumber ? `#${seat.seatNumber}` : "Unassigned";
                    const shift = booking.shift || "FULL_DAY";
                    const modeInfo = getPaymentModeBadge(p.paymentMethod);
                    const receiptId = p.receiptNumber || `PAY-${p._id?.slice(-6)?.toUpperCase()}`;

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                        
                        {/* Receipt & Date */}
                        <td className="py-3.5 px-5">
                          <p className="font-mono font-bold text-slate-900">{receiptId}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                            {formatDate(p.paymentDate || p.createdAt)}
                          </p>
                        </td>

                        {/* Student Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                              {studentName.charAt(0)}
                            </div>
                            <div>
                              <Link
                                to={`/students/${student._id}`}
                                className="font-bold text-slate-900 hover:text-emerald-600 transition-colors block leading-tight"
                              >
                                {studentName}
                              </Link>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                ADM: {adm}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Desk & Shift */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <Armchair className="w-3.5 h-3.5 text-indigo-600" />
                            Desk {seatNo}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {shift}
                          </span>
                        </td>

                        {/* Payment Mode */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${modeInfo.bg}`}
                          >
                            <CreditCard className="w-3 h-3" />
                            {modeInfo.label}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-black text-emerald-600 text-sm">
                          {formatCurrency(p.amount)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.paymentStatus === "PAID"
                                ? "bg-emerald-100 text-emerald-800"
                                : p.paymentStatus === "REFUNDED"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {p.paymentStatus === "PAID" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : p.paymentStatus === "REFUNDED" ? (
                              <RotateCcw className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {p.paymentStatus || "PAID"}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {studentPhone && p.paymentStatus === "PAID" && (
                              <button
                                onClick={() => handleSendWhatsAppReceipt(p)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Send WhatsApp Receipt to Student"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            )}

                            <Link
                              to={`/payments/${p._id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                              title="View Invoice Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/payments/${p._id}/edit`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                              title="Edit Record"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            {p.paymentStatus === "PAID" && (
                              <button
                                onClick={() => {
                                  setPaymentToRefund(p);
                                  setShowRefundDialog(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                                title="Refund Payment"
                              >
                                <RotateCcw className="w-4 h-4" />
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

      {/* Refund Confirmation Dialog */}
      <ConfirmDialog
        open={showRefundDialog}
        title="Refund Payment Record?"
        message={`Are you sure you want to refund receipt "${
          paymentToRefund?.receiptNumber
        }" of ${formatCurrency(paymentToRefund?.amount)} to ${
          paymentToRefund?.student?.user?.name || "the student"
        }? This will update the status to REFUNDED.`}
        confirmText="Confirm Refund"
        cancelText="Cancel"
        onConfirm={handleConfirmRefund}
        onCancel={() => {
          setShowRefundDialog(false);
          setPaymentToRefund(null);
        }}
        isLoading={refundMutation.isPending}
      />
    </div>
  );
}