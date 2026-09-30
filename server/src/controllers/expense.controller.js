import Expense from "../models/expense.models.js";
import Library from "../models/library.models.js";
import Payment from "../models/payment.models.js";
import mongoose from "mongoose";

/**
 * 1. CREATE EXPENSE
 */
export const createExpense = async (req, res) => {
  try {
    const { title, category, amount, paymentMode, expenseDate, receiptNumber, notes } = req.body;

    if (!title || amount === undefined || amount === null) {
      return res.status(400).json({
        message: "Title and Amount are required",
      });
    }

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({
        message: "Library not found for this account",
      });
    }

    const expense = await Expense.create({
      library: library._id,
      title: title.trim(),
      category: category || "OTHER",
      amount: Number(amount),
      paymentMode: paymentMode || "UPI",
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      receiptNumber: receiptNumber?.trim(),
      notes: notes?.trim(),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Expense recorded successfully",
      expense,
    });
  } catch (error) {
    console.error("createExpense error:", error);
    return res.status(500).json({
      message: error.message || "Failed to record expense",
    });
  }
};

/**
 * 2. GET ALL EXPENSES (with Search, Category, Date range, Pagination & Category Breakdown)
 */
export const getAllExpenses = async (req, res) => {
  try {
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({
        message: "Library not found for this account",
      });
    }

    const {
      page = 1,
      limit = 20,
      category,
      search,
      startDate,
      endDate,
      month, // e.g. "2026-09"
    } = req.query;

    const query = { library: library._id };

    // Filter by Category
    if (category && category !== "ALL") {
      query.category = category;
    }

    // Filter by Month or custom Date range
    if (month) {
      const [yearStr, monthStr] = month.split("-");
      const y = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10) - 1;
      const startOfMonth = new Date(y, m, 1, 0, 0, 0, 0);
      const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999);
      query.expenseDate = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.expenseDate.$lte = end;
      }
    }

    // Search query in title or receiptNumber or notes
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { receiptNumber: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [expenses, totalExpensesCount, stats] = await Promise.all([
      Expense.find(query)
        .sort({ expenseDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Expense.countDocuments(query),
      Expense.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const totalFilteredAmount = stats[0]?.totalAmount || 0;

    return res.status(200).json({
      message: "Expenses fetched successfully",
      expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalExpenses: totalExpensesCount,
        totalPages: Math.ceil(totalExpensesCount / Number(limit)) || 1,
      },
      summary: {
        totalAmount: totalFilteredAmount,
      },
    });
  } catch (error) {
    console.error("getAllExpenses error:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch expenses",
    });
  }
};

/**
 * 3. GET FINANCIAL P&L SUMMARY (Revenue vs Expenses vs Net Profit + Category Breakdown + 6 Month Trend)
 */
export const getExpenseSummary = async (req, res) => {
  try {
    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({
        message: "Library not found for this account",
      });
    }

    const { month } = req.query; // optional "2026-09"

    let dateFilter = {};
    let paymentsDateFilter = {};

    if (month) {
      const [yearStr, monthStr] = month.split("-");
      const y = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10) - 1;
      const start = new Date(y, m, 1, 0, 0, 0, 0);
      const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
      dateFilter = { expenseDate: { $gte: start, $lte: end } };
      paymentsDateFilter = {
        $or: [
          { paymentDate: { $gte: start, $lte: end } },
          { paymentDate: { $exists: false }, createdAt: { $gte: start, $lte: end } },
        ],
      };
    } else {
      // Default: Current Month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      dateFilter = { expenseDate: { $gte: start, $lte: end } };
      paymentsDateFilter = {
        $or: [
          { paymentDate: { $gte: start, $lte: end } },
          { paymentDate: { $exists: false }, createdAt: { $gte: start, $lte: end } },
        ],
      };
    }

    // 1. Total Revenue in Period
    const revenueAgg = await Payment.aggregate([
      {
        $match: {
          library: library._id,
          paymentStatus: "PAID",
          ...paymentsDateFilter,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // 2. Total Expenses in Period
    const expenseAgg = await Expense.aggregate([
      {
        $match: {
          library: library._id,
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const totalExpenses = expenseAgg[0]?.total || 0;

    // 3. Category Breakdown
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          library: library._id,
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // 4. Net Profit calculation
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin =
      totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100 * 10) / 10 : 0;

    // 5. Last 6 Months Trend (Revenue vs Expenses vs Profit)
    const monthlyTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthLabel = d.toLocaleString("en-IN", { month: "short", year: "numeric" });

      const [mRev, mExp] = await Promise.all([
        Payment.aggregate([
          {
            $match: {
              library: library._id,
              paymentStatus: "PAID",
              $or: [
                { paymentDate: { $gte: mStart, $lte: mEnd } },
                { paymentDate: { $exists: false }, createdAt: { $gte: mStart, $lte: mEnd } },
              ],
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Expense.aggregate([
          {
            $match: {
              library: library._id,
              expenseDate: { $gte: mStart, $lte: mEnd },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

      const rev = mRev[0]?.total || 0;
      const exp = mExp[0]?.total || 0;

      monthlyTrend.push({
        month: monthLabel,
        revenue: rev,
        expenses: exp,
        netProfit: rev - exp,
      });
    }

    return res.status(200).json({
      message: "Financial summary calculated successfully",
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        categoryBreakdown,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error("getExpenseSummary error:", error);
    return res.status(500).json({
      message: error.message || "Failed to calculate financial summary",
    });
  }
};

/**
 * 4. UPDATE EXPENSE
 */
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, amount, paymentMode, expenseDate, receiptNumber, notes } = req.body;

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({
        message: "Library not found for this account",
      });
    }

    const expense = await Expense.findOne({ _id: id, library: library._id });
    if (!expense) {
      return res.status(404).json({
        message: "Expense record not found",
      });
    }

    if (title !== undefined) expense.title = title.trim();
    if (category !== undefined) expense.category = category;
    if (amount !== undefined) expense.amount = Number(amount);
    if (paymentMode !== undefined) expense.paymentMode = paymentMode;
    if (expenseDate !== undefined) expense.expenseDate = new Date(expenseDate);
    if (receiptNumber !== undefined) expense.receiptNumber = receiptNumber?.trim();
    if (notes !== undefined) expense.notes = notes?.trim();

    await expense.save();

    return res.status(200).json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.error("updateExpense error:", error);
    return res.status(500).json({
      message: error.message || "Failed to update expense",
    });
  }
};

/**
 * 5. DELETE EXPENSE
 */
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({
        message: "Library not found for this account",
      });
    }

    const expense = await Expense.findOneAndDelete({ _id: id, library: library._id });
    if (!expense) {
      return res.status(404).json({
        message: "Expense record not found",
      });
    }

    return res.status(200).json({
      message: "Expense deleted successfully",
      expense,
    });
  } catch (error) {
    console.error("deleteExpense error:", error);
    return res.status(500).json({
      message: error.message || "Failed to delete expense",
    });
  }
};
