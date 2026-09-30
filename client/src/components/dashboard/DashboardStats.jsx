import { Link } from "react-router-dom";
import {
  Users,
  Armchair,
  DollarSign,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

function DashboardStats({ statistics }) {
  if (!statistics) {
    return null;
  }

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt || 0);
  };

  const occupancy = statistics.occupancyRate || 0;
  const netProfit = statistics.netProfit !== undefined ? statistics.netProfit : (statistics.totalRevenue || 0) - (statistics.totalExpenses || 0);
  const profitMargin = statistics.profitMargin || (statistics.totalRevenue > 0 ? Math.round((netProfit / statistics.totalRevenue) * 100) : 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Students & Active Bookings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Students
          </span>
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {statistics.totalStudents || 0}
          </span>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            {statistics.activeBookings || 0} Active Desks
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>Enrolled study members</span>
          <Link to="/students" className="text-blue-600 font-bold hover:underline flex items-center gap-0.5">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </p>
      </div>

      {/* 2. Desk Occupancy & Capacity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Desk Occupancy
          </span>
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
            <Armchair className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {occupancy}%
          </span>
          <span className="text-xs font-bold text-slate-600">
            {statistics.occupiedSeats || 0}/{statistics.totalSeats || 0} Filled
          </span>
        </div>
        {/* Progress Bar */}
        <div className="mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(occupancy, 100)}%` }}
          ></div>
        </div>
        <p className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>{statistics.availableSeats || 0} desks vacant</span>
          <Link to="/seats" className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
            Seat Matrix <ArrowUpRight className="w-3 h-3" />
          </Link>
        </p>
      </div>

      {/* 3. Gross Revenue & Collection */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Gross Revenue
          </span>
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {formatCurrency(statistics.totalRevenue)}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span className="text-emerald-600 font-bold">
            + {formatCurrency(statistics.todayRevenue)} today
          </span>
          <Link to="/payments" className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5">
            Ledger <ArrowUpRight className="w-3 h-3" />
          </Link>
        </p>
      </div>

      {/* 4. Net Operating Profit & P&L */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Net Profit (P&L)
          </span>
          <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-black ${netProfit >= 0 ? "text-blue-600" : "text-rose-600"}`}>
            {formatCurrency(netProfit)}
          </span>
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${profitMargin >= 40 ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
            {profitMargin}% margin
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>Cost: {formatCurrency(statistics.totalExpenses || 0)}</span>
          <Link to="/expenses" className="text-rose-600 font-bold hover:underline flex items-center gap-0.5">
            P&L Hub <ArrowUpRight className="w-3 h-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}

export default DashboardStats;