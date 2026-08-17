import { useQuery } from "@tanstack/react-query";
import { getSeatOccupancy } from "../../services/dashboard.service.js";

function OccupancyCard() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["seatOccupancy"],
    queryFn: getSeatOccupancy,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Seat Occupancy
        </h2>

        <div className="mt-6 h-48 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Seat Occupancy
        </h2>

        <p className="mt-4 text-sm text-red-500">
          Failed to load occupancy data.
        </p>
      </div>
    );
  }

  const occupancy = data?.seatOccupancy;

  const {
    totalSeats = 0,
    occupiedSeats = 0,
    availableSeats = 0,
    maintenanceSeats = 0,
    occupancyRate = 0,
  } = occupancy || {};

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Seat Occupancy
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Current seat utilization
        </p>
      </div>

      {/* Occupancy percentage */}
      <div className="mt-6 flex items-center gap-6">

        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[12px] border-gray-100">

          <div
            className="absolute inset-[-12px] rounded-full border-[12px] border-blue-600"
            style={{
              clipPath: `inset(0 ${100 - occupancyRate}% 0 0)`,
            }}
          />

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {occupancyRate}%
            </p>

            <p className="text-xs text-gray-500">
              Occupied
            </p>
          </div>

        </div>

        <div className="flex-1 space-y-3">

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Total Seats
            </span>

            <span className="font-semibold text-gray-900">
              {totalSeats}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Occupied
            </span>

            <span className="font-semibold text-gray-900">
              {occupiedSeats}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Available
            </span>

            <span className="font-semibold text-gray-900">
              {availableSeats}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Maintenance
            </span>

            <span className="font-semibold text-gray-900">
              {maintenanceSeats}
            </span>
          </div>

        </div>

      </div>

      {/* Progress bar */}
      <div className="mt-6">

        <div className="mb-2 flex justify-between text-xs text-gray-500">
          <span>Occupancy</span>
          <span>{occupancyRate}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${Math.min(occupancyRate, 100)}%`,
            }}
          />
        </div>

      </div>

    </div>
  );
}

export default OccupancyCard;