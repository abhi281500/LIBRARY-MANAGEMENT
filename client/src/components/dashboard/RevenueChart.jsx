import { useQuery } from "@tanstack/react-query";
import { getMonthlyRevenue } from "../../services/dashboard.service.js";

function RevenueChart() {
  const currentYear = new Date().getFullYear();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["monthlyRevenue", currentYear],
    queryFn: () => getMonthlyRevenue(currentYear),
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Monthly Revenue
        </h2>

        <div className="mt-6 h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Monthly Revenue
        </h2>

        <p className="mt-4 text-sm text-red-500">
          Failed to load revenue data.
        </p>
      </div>
    );
  }

  const revenueData = data?.monthlyRevenue || [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Monthly Revenue
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Revenue generated throughout the year
          </p>
        </div>

        <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
          {data?.year}
        </span>
      </div>

      <div className="mt-6 space-y-4">

        {revenueData.map((item) => (

          <div key={item.month}>

            <div className="mb-1 flex items-center justify-between text-sm">

              <span className="font-medium text-gray-600">
                {item.month}
              </span>

              <span className="font-semibold text-gray-900">
                ₹{item.revenue || 0}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">

              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${
                    Math.min(
                      (item.revenue /
                        Math.max(
                          ...revenueData.map(
                            (item) => item.revenue || 0
                          )
                        )) *
                        100,
                      100
                    ) || 0
                  }%`,
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default RevenueChart;