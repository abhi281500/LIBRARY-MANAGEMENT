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
function DashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-gray-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-red-600">
            Failed to load dashboard
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error?.response?.data?.message ||
              "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  const statistics = data?.statistics;

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        <PageHeader
          title="Dashboard"
          description="Here's what's happening in your library."
        />

        <DashboardStats statistics={statistics} />
        <div className="mt-6">
          <RevenueChart />
        </div>


        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <OccupancyCard />
          <BookingTrendChart />
        </div>

        <div className="mt-6">
          <RecentActivities />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RecentBookings
            bookings={data?.recentBookings}
          />

          <RecentPayments
            payments={data?.recentPayments}
          />
        </div>






      </div>

    </div>
  );
}

export default DashboardPage;