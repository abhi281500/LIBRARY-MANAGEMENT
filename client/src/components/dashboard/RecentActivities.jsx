import { useQuery } from "@tanstack/react-query";
import { getRecentActivities } from "../../services/dashboard.service.js";

function RecentActivities() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recentActivities"],
    queryFn: getRecentActivities,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Activities
        </h2>

        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Activities
        </h2>

        <p className="mt-4 text-sm text-red-500">
          Failed to load activities.
        </p>
      </div>
    );
  }

  const activities = data?.recentActivities || [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activities
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Latest activity in your library
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">

        {activities.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-500">
              No recent activities.
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={`${activity.type}-${activity.createdAt}-${index}`}
              className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {activity.title}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {activity.student?.user.name ||
                    activity.student?.fullName ||
                    "Unknown student"}
                </p>
              </div>

              <div className="text-right">

                {activity.type === "PAYMENT" && (
                  <p className="font-semibold text-gray-900">
                    ₹{activity.amount || 0}
                  </p>
                )}

                {activity.type === "BOOKING" && activity.seat && (
                  <p className="text-sm text-gray-500">
                    Seat: {activity.seat?.seatNumber || activity.seat?.number || "N/A"}
                  </p>
                )}

                <p className="mt-1 text-xs text-gray-400">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>

              </div>
            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default RecentActivities;