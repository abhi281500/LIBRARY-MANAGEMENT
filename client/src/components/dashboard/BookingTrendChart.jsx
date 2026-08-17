import { useQuery } from "@tanstack/react-query";
import { getBookingTrends } from "../../services/dashboard.service.js";

function BookingTrendChart() {
  const currentYear = new Date().getFullYear();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["bookingTrends", currentYear],
    queryFn: () => getBookingTrends(currentYear),
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Booking Trends
        </h2>

        <div className="mt-6 h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Booking Trends
        </h2>

        <p className="mt-4 text-sm text-red-500">
          Failed to load booking trends.
        </p>
      </div>
    );
  }

  const bookingData = data?.bookingTrends || [];

  const maxBookings = Math.max(
    ...bookingData.map((item) => item.totalBookings || 0),
    1
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Booking Trends
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Monthly booking activity
          </p>
        </div>

        <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
          {data?.year}
        </span>

      </div>

      <div className="mt-6 space-y-4">

        {bookingData.map((item) => {

          const percentage =
            ((item.totalBookings || 0) / maxBookings) * 100;

          return (
            <div key={item.month}>

              <div className="mb-1 flex items-center justify-between">

                <span className="text-sm font-medium text-gray-600">
                  {item.month}
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {item.totalBookings || 0}
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${percentage}%`,
                  }}
                />

              </div>

              <div className="mt-1 flex gap-4 text-xs text-gray-400">

                <span>
                  Active: {item.activeBookings || 0}
                </span>

                <span>
                  Cancelled: {item.cancelledBookings || 0}
                </span>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default BookingTrendChart;