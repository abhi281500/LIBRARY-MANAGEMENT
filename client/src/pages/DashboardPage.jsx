import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../services/dashboard.service.js";

import PageHeader from "../components/common/PageHeader.jsx";
import DashboardStats from "../components/dashboard/DashboardStats.jsx";
import RevenueChart from "../components/dashboard/RevenueChart.jsx";
import OccupancyCard from "../components/dashboard/OccupancyCard.jsx";
import BookingTrendChart from "../components/dashboard/BookingTrendChart.jsx";
import RecentActivities from "../components/dashboard/RecentActivities.jsx";
import RecentBookings from "../components/dashboard/RecentBookings.jsx";
import RecentPayments from "../components/dashboard/RecentPayments.jsx";
import ExpiringAlertsCard from "../components/dashboard/ExpiringAlertsCard.jsx";

function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Dashboard Intelligence...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm max-w-md">
          <h2 className="text-xl font-bold text-red-600">Failed to load dashboard</h2>
          <p className="mt-2 text-sm text-slate-500">
            {error?.response?.data?.message || "Something went wrong while connecting to the library database."}
          </p>
        </div>
      </div>
    );
  }

  const statistics = data?.statistics;

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Executive Header */}
        <PageHeader
          title="Library Operations Command"
          description="Real-time occupancy, automated expiry alerts, fee collections, and net profit health."
        />

        {/* 4 Primary Executive KPI Cards */}
        <DashboardStats statistics={statistics} />

        {/* Expiry Alerts Card (High Priority Attention) */}
        <ExpiringAlertsCard />

        {/* Financial Charts & Trends */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RevenueChart />
          <BookingTrendChart />
        </div>

        {/* Seat Occupancy & Capacity Matrix */}
        <div>
          <OccupancyCard />
        </div>

        {/* Recent Bookings & Payment Transactions */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RecentBookings bookings={data?.recentBookings} />
          <RecentPayments payments={data?.recentPayments} />
        </div>

        {/* Live Activity Stream */}
        <div>
          <RecentActivities />
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;