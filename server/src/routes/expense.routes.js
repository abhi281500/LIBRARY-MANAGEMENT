import express from "express";
import {
  createExpense,
  getAllExpenses,
  getExpenseSummary,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";
import auth from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middlewares.js";

const router = express.Router();

// 1. GET Financial Summary (P&L, 6-Month Trend, Category Breakdown)
router.get(
  "/summary",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  getExpenseSummary
);

// 2. CREATE EXPENSE
router.post(
  "/",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  createExpense
);

// 3. GET ALL EXPENSES
router.get(
  "/",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  getAllExpenses
);

// 4. UPDATE EXPENSE
router.put(
  "/:id",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  updateExpense
);

// 5. DELETE EXPENSE
router.delete(
  "/:id",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  deleteExpense
);

export default router;
