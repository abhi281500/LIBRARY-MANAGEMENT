import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getExpenseSummary,
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../../services/expense.service.js";
import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Zap,
  Home,
  Wifi,
  Sparkles,
  Wrench,
  Users,
  Coffee,
  PieChart as PieIcon,
  BarChart3,
  Receipt,
  X,
  CreditCard,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

// Category display mapping & styling
const CATEGORY_MAP = {
  ELECTRICITY: { label: "Electricity & AC", icon: Zap, bg: "bg-amber-50 text-amber-700 border-amber-200" },
  RENT: { label: "Library Rent", icon: Home, bg: "bg-blue-50 text-blue-700 border-blue-200" },
  INTERNET: { label: "Fiber Internet / Wifi", icon: Wifi, bg: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  CLEANING: { label: "Cleaning & Housekeeping", icon: Sparkles, bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  MAINTENANCE: { label: "Repairs & Maintenance", icon: Wrench, bg: "bg-purple-50 text-purple-700 border-purple-200" },
  SALARY: { label: "Staff Salary", icon: Users, bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  WATER_TEA: { label: "Water, Tea & Refreshments", icon: Coffee, bg: "bg-rose-50 text-rose-700 border-rose-200" },
  MARKETING: { label: "Marketing & Posters", icon: TrendingUp, bg: "bg-teal-50 text-teal-700 border-teal-200" },
  SOFTWARE: { label: "Software & IT", icon: ShieldCheck, bg: "bg-violet-50 text-violet-700 border-violet-200" },
  OTHER: { label: "Other Overheads", icon: Receipt, bg: "bg-slate-100 text-slate-700 border-slate-200" },
};

export default function ExpensesPage() {
  const queryClient = useQueryClient();

  // Current year-month as default (e.g. "2026-09")
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "ELECTRICITY",
    amount: "",
    paymentMode: "UPI",
    expenseDate: new Date().toISOString().split("T")[0],
    receiptNumber: "",
    notes: "",
  });

  // 1. Fetch P&L Summary
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["expense-summary", selectedMonth],
    queryFn: () => getExpenseSummary(selectedMonth),
  });

  // 2. Fetch Expenses List
  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: ["expenses-list", selectedMonth, categoryFilter, searchQuery],
    queryFn: () =>
      getAllExpenses({
        month: selectedMonth,
        category: categoryFilter,
        search: searchQuery,
      }),
  });

  const summary = summaryData?.summary || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    categoryBreakdown: [],
    monthlyTrend: [],
  };

  const expenses = listData?.expenses || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      toast.success("Expense recorded successfully");
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to record expense");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      toast.success("Expense updated successfully");
      setIsModalOpen(false);
      setEditingExpense(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update expense");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete expense");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "ELECTRICITY",
      amount: "",
      paymentMode: "UPI",
      expenseDate: new Date().toISOString().split("T")[0],
      receiptNumber: "",
      notes: "",
    });
    setEditingExpense(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      paymentMode: expense.paymentMode || "UPI",
      expenseDate: expense.expenseDate ? expense.expenseDate.split("T")[0] : new Date().toISOString().split("T")[0],
      receiptNumber: expense.receiptNumber || "",
      notes: expense.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      toast.error("Please fill in title and amount");
      return;
    }

    if (editingExpense) {
      updateMutation.mutate({
        id: editingExpense._id,
        payload: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteConfirm = () => {
    if (!expenseToDelete?._id) return;
    deleteMutation.mutate(expenseToDelete._id);
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt || 0);
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

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <Receipt className="w-8 h-8 text-rose-600" />
              Expenses & Net Profit (P&L)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track operational costs, electricity, rent, wifi, and live profit margins.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month Filter Selector */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              + Add Expense
            </button>
          </div>
        </div>

        {/* 1. EXECUTIVE P&L FINANCIAL CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Revenue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">
              {formatCurrency(summary.totalRevenue)}
            </p>
            <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <span>●</span> Desk Fees Collected
            </p>
          </div>

          {/* Operational Expenses */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Overheads</span>
              <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-600 mt-3">
              {formatCurrency(summary.totalExpenses)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Electricity, Rent, Staff & Wifi
            </p>
          </div>

          {/* Net Profit */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Operating Profit</span>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-2xl font-black mt-3 ${summary.netProfit >= 0 ? "text-blue-600" : "text-rose-600"}`}>
              {formatCurrency(summary.netProfit)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Real Cash in Hand (Revenue - Cost)
            </p>
          </div>

          {/* Profit Margin % */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Profit Margin</span>
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <p className="text-2xl font-black text-indigo-600">
                {summary.profitMargin}%
              </p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  summary.profitMargin >= 50
                    ? "bg-emerald-100 text-emerald-800"
                    : summary.profitMargin >= 25
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {summary.profitMargin >= 50 ? "High Margin" : summary.profitMargin >= 25 ? "Healthy" : "Low Margin"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Retained from every ₹100 earned
            </p>
          </div>

        </div>

        {/* 2. P&L INSIGHTS: CATEGORY BREAKDOWN & 6-MONTH TREND */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Category Breakdown (5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900">Overhead Breakdown</h3>
                </div>
                <span className="text-xs text-slate-400 font-bold">{summary.categoryBreakdown.length} Categories</span>
              </div>

              {summary.categoryBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No expenses recorded for this month.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {summary.categoryBreakdown.map((item) => {
                    const catInfo = CATEGORY_MAP[item._id] || CATEGORY_MAP.OTHER;
                    const IconComp = catInfo.icon;
                    const pct = summary.totalExpenses > 0 ? Math.round((item.total / summary.totalExpenses) * 100) : 0;

                    return (
                      <div key={item._id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-bold text-slate-800">
                            <IconComp className="w-3.5 h-3.5 text-slate-500" />
                            {catInfo.label}
                          </span>
                          <span className="font-black text-slate-900">
                            {formatCurrency(item.total)}{" "}
                            <span className="text-[10px] font-normal text-slate-400">({pct}%)</span>
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total Month Overheads</span>
              <span className="font-bold text-slate-900">{formatCurrency(summary.totalExpenses)}</span>
            </div>
          </div>

          {/* 6-Month Trend (7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Last 6 Months P&L Trend</h3>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Revenue
                </span>
                <span className="flex items-center gap-1 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Expense
                </span>
              </div>
            </div>

            {summary.monthlyTrend.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading trend...</div>
            ) : (
              <div className="space-y-4">
                {summary.monthlyTrend.map((m) => {
                  const maxVal = Math.max(
                    ...summary.monthlyTrend.map((t) => Math.max(t.revenue, t.expenses)),
                    1
                  );
                  const revPct = Math.round((m.revenue / maxVal) * 100);
                  const expPct = Math.round((m.expenses / maxVal) * 100);

                  return (
                    <div key={m.month} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 w-24">{m.month}</span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-emerald-700 font-semibold">{formatCurrency(m.revenue)}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-rose-600 font-semibold">{formatCurrency(m.expenses)}</span>
                          <span className="text-slate-300">|</span>
                          <span className={`font-black ${m.netProfit >= 0 ? "text-blue-600" : "text-rose-600"}`}>
                            {m.netProfit >= 0 ? `+${formatCurrency(m.netProfit)}` : formatCurrency(m.netProfit)}
                          </span>
                        </div>
                      </div>

                      {/* Dual Bar */}
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${revPct}%` }}></div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${expPct}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* 3. EXPENSES DATA TABLE & FILTERS */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-1 items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, receipt, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-rose-500"
              >
                <option value="ALL">All Categories</option>
                {Object.entries(CATEGORY_MAP).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs font-bold text-slate-500">
              {expenses.length} Entries Recorded
            </span>
          </div>

          {/* Table */}
          {isListLoading ? (
            <div className="p-12 text-center text-sm font-semibold text-slate-500">
              Loading expense records...
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No Expenses Recorded</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Record your electricity bills, rent, or maintenance costs to track your real net profit.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> + Record First Expense
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Expense Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Mode & Receipt</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {expenses.map((expense) => {
                    const catInfo = CATEGORY_MAP[expense.category] || CATEGORY_MAP.OTHER;
                    const IconComp = catInfo.icon;

                    return (
                      <tr key={expense._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <p className="font-bold text-slate-900">{expense.title}</p>
                          {expense.notes && (
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{expense.notes}</p>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${catInfo.bg}`}
                          >
                            <IconComp className="w-3 h-3" />
                            {catInfo.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {formatDate(expense.expenseDate)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">{expense.paymentMode || "UPI"}</span>
                          {expense.receiptNumber && (
                            <span className="block text-[10px] text-slate-400 font-mono">
                              #{expense.receiptNumber}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-black text-rose-600 text-sm">
                          {formatCurrency(expense.amount)}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(expense)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                              title="Edit Expense"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setExpenseToDelete(expense);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* ========================================================= */}
      {/* ADD / EDIT EXPENSE MODAL */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingExpense ? "Edit Expense Record" : "Record New Library Expense"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. September Electricity Bill / AC Service / Wifi Fiber"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-rose-500"
                  >
                    {Object.entries(CATEGORY_MAP).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 4500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-rose-500"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Net Banking / NEFT</option>
                    <option value="CARD">Debit / Credit Card</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bill / Receipt Number
                  </label>
                  <input
                    type="text"
                    placeholder="Optional (e.g. INV-9042)"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Notes / Memo
                  </label>
                  <input
                    type="text"
                    placeholder="Optional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingExpense
                    ? "Update Expense"
                    : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete Expense Entry?"
        message={`Are you sure you want to delete the expense "${expenseToDelete?.title}" for ${formatCurrency(
          expenseToDelete?.amount
        )}? This will recalculate your Net Profit.`}
        confirmText="Delete Expense"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setExpenseToDelete(null);
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
