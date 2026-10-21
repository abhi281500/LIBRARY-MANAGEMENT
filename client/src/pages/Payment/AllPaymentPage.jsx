import { useState, useMemo, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  Wallet,
  Banknote,
} from "lucide-react";

export default function AllPaymentPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [paymentToRefund, setPaymentToRefund] = useState(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // 10, 25, 50, 100, "ALL"

  // 1. Fetch ALL Payments for the Library
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["payments"],
    queryFn: () => getAllPayments({ limit: "all" }),
  });

  // 2. Fetch WhatsApp Template configuration
  const { data: templateData } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: getWhatsAppTemplates,
  });

  const payments = data?.payments || [];

  // Reset page to 1 when search, filter or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, modeFilter, pageSize]);

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
        return {
          label: "UPI / QR",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "CASH":
        return {
          label: "Cash Counter",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "CARD":
        return {
          label: "Card / POS",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "BANK_TRANSFER":
        return {
          label: "Net Banking",
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
      default:
        return {
          label: mode || "Other",
          bg: "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  };

  // Filter Payments across ALL loaded data
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const student = p.student || {};
      const user = student.user || {};
      const studentName = (user.name || "").toLowerCase();
      const studentPhone = (user.phone || "").toLowerCase();
      const adm = (student.admissionNumber || "").toLowerCase();
      const receiptNo = (p.receiptNumber || "").toLowerCase();
      const mode = (p.paymentMethod || "").toUpperCase();
      const status = (p.paymentStatus || "PAID").toUpperCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        studentName.includes(q) ||
        studentPhone.includes(q) ||
        adm.includes(q) ||
        receiptNo.includes(q);

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;
      const matchesMode =
        modeFilter === "ALL" || mode === modeFilter;

      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [payments, searchQuery, statusFilter, modeFilter]);

  // Executive Stats (Calculated on ALL library payments)
  const totalPaidRevenue = useMemo(
    () =>
      payments
        .filter((p) => p.paymentStatus === "PAID")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments]
  );

  const upiTotal = useMemo(
    () =>
      payments
        .filter((p) => p.paymentStatus === "PAID" && p.paymentMethod === "UPI")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments]
  );

  const cashTotal = useMemo(
    () =>
      payments
        .filter((p) => p.paymentStatus === "PAID" && p.paymentMethod === "CASH")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments]
  );

  const paidCount = useMemo(
    () => payments.filter((p) => p.paymentStatus === "PAID").length,
    [payments]
  );

  // Pagination Slice
  const totalFiltered = filteredPayments.length;
  const isShowAll = pageSize === "ALL";
  const numPageSize = isShowAll ? totalFiltered : Number(pageSize);
  const totalPages = isShowAll ? 1 : Math.max(1, Math.ceil(totalFiltered / (numPageSize || 1)));

  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedPayments = useMemo(() => {
    if (isShowAll) return filteredPayments;
    const startIndex = (safePage - 1) * numPageSize;
    return filteredPayments.slice(startIndex, startIndex + numPageSize);
  }, [filteredPayments, isShowAll, safePage, numPageSize]);

  const startIndex = (safePage - 1) * numPageSize;
  const endIndex = Math.min(startIndex + paginatedPayments.length, totalFiltered);

  // Generate page numbers
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (safePage <= 4) {
      pages.push(2, 3, 4, 5, "...", totalPages);
      return pages;
    }
    if (safePage >= totalPages - 3) {
      pages.push("...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }
    pages.push("...", safePage - 1, safePage, safePage + 1, "...", totalPages);
    return pages;
  };

  // WhatsApp Sender for Receipts
  const handleSendWhatsAppReceipt = (payment) => {
    const user = payment.student?.user;
    if (!user?.phone) {
      toast.error("Student phone number not available");
      return;
    }

    const templateStr =
      templateData?.templates?.FEE_RECEIPT || DEFAULT_TEMPLATES.FEE_RECEIPT;

    const message = formatTemplateMessage(templateStr, {
      studentName: user.name || "Student",
      admissionNo: payment.student?.admissionNumber || "N/A",
      receiptNumber: payment.receiptNumber || "REC-N/A",
      amount: String(payment.amount || 0),
      paymentMethod: payment.paymentMethod || "UPI",
      date: formatDate(payment.paymentDate),
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
          <p className="text-sm font-semibold text-slate-600">Loading Payment Ledger...</p>
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
            {error?.response?.data?.message || "Something went wrong while fetching receipts."}
          </p>
          <Link
            to="/payments/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            + Record Payment
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
              <CreditCard className="w-8 h-8 text-emerald-600" />
              Fee Receipts & Invoicing Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track student fee payments, digital invoices, payment modes, and refund transactions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/payments/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              + Record Fee Payment
            </Link>
          </div>
        </div>

        {/* 1. EXECUTIVE KPI SUMMARY */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Collected</span>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-3">{formatCurrency(totalPaidRevenue)}</p>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">{paidCount} Paid Invoices</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">UPI / QR Collections</span>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">{formatCurrency(upiTotal)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Online digital payments</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cash Counter</span>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">{formatCurrency(cashTotal)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Direct reception cash</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Invoices</span>
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">{payments.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">All ledger transactions</p>
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
                  placeholder="Search receipt #, student, phone..."
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
                <option value="ALL">All Statuses ({payments.length})</option>
                <option value="PAID">Paid Only ({paidCount})</option>
                <option value="REFUNDED">Refunded</option>
                <option value="PENDING">Pending</option>
              </select>

              {/* Payment Mode Filter */}
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Payment Modes</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="CASH">Cash Counter</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer / IMPS</option>
              </select>

              {/* Rows Per Page (Quick Selector) */}
              <div className="flex items-center gap-1.5 ml-auto sm:ml-0 text-xs text-slate-500 font-medium">
                <span>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPageSize(val === "ALL" ? "ALL" : Number(val));
                  }}
                  className="rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                  <option value="ALL">Show All ({filteredPayments.length})</option>
                </select>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <span>
                Total: <strong>{totalFiltered}</strong> {totalFiltered !== payments.length && `(of ${payments.length})`}
              </span>
              {isFetching && !isLoading && (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
              )}
            </div>
          </div>

          {/* Table */}
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No Payment Records Found</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {searchQuery || statusFilter !== "ALL" || modeFilter !== "ALL"
                  ? "No payments match your selected search or filter criteria."
                  : "Record your first student fee receipt to begin building your financial ledger."}
              </p>
              {(searchQuery || statusFilter !== "ALL" || modeFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setModeFilter("ALL");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold mr-2"
                >
                  Clear Filters
                </button>
              )}
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
                    <th className="py-3 px-5">Receipt & Invoice</th>
                    <th className="py-3 px-4">Student Member</th>
                    <th className="py-3 px-4">Allocated Desk</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {paginatedPayments.map((p) => {
                    const student = p.student || {};
                    const user = student.user || {};
                    const studentName = user.name || "Unknown Student";
                    const studentPhone = user.phone || "";
                    const adm = student.admissionNumber || "N/A";
                    const booking = p.booking || {};
                    const seat = booking.seat || {};
                    const seatNo = seat.seatNumber ? `#${seat.seatNumber}` : "General Pass";
                    const modeInfo = getPaymentModeBadge(p.paymentMethod);

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                        
                        {/* Receipt & Date */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                              <Receipt className="w-4 h-4" />
                            </div>
                            <div>
                              <Link
                                to={`/payments/${p._id}`}
                                className="font-mono font-bold text-slate-900 hover:text-emerald-600 transition-colors block"
                              >
                                {p.receiptNumber || `REC-${p._id.slice(-6).toUpperCase()}`}
                              </Link>
                              <span className="text-[11px] text-slate-400">
                                {formatDate(p.paymentDate || p.createdAt)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Student */}
                        <td className="py-3.5 px-4">
                          <Link
                            to={`/students/${student._id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 transition-colors block truncate max-w-[170px]"
                          >
                            {studentName}
                          </Link>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ADM: {adm}
                          </span>
                        </td>

                        {/* Desk & Shift */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <Armchair className="w-3.5 h-3.5 text-indigo-600" />
                            Desk {seatNo}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {booking.shift || "Active Plan"}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                          {formatCurrency(p.amount)}
                        </td>

                        {/* Payment Mode */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${modeInfo.bg}`}
                          >
                            {modeInfo.label}
                          </span>
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

          {/* 3. PAGINATION CONTROLS FOOTER */}
          {totalFiltered > 0 && (
            <div className="bg-slate-50/80 border-t border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Counter details */}
              <div className="text-xs text-slate-600">
                {isShowAll ? (
                  <span>
                    Showing all <strong>{totalFiltered}</strong> fee receipts {totalFiltered !== payments.length && `(filtered from ${payments.length})`}
                  </span>
                ) : (
                  <span>
                    Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalFiltered}</strong> receipts {totalFiltered !== payments.length && `(filtered from ${payments.length})`}
                  </span>
                )}
              </div>

              {/* Rows Per Page & Page Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="hidden sm:inline">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPageSize(val === "ALL" ? "ALL" : Number(val));
                    }}
                    className="rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value="ALL">All ({totalFiltered})</option>
                  </select>
                </div>

                {!isShowAll && totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {getPageNumbers().map((pageNum, idx) => {
                      if (pageNum === "...") {
                        return (
                          <span key={`dots-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-slate-400">
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-7 h-7 px-2 rounded-lg text-xs font-bold transition-all ${
                            safePage === pageNum
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

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
