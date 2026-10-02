function RecentBookings({ bookings = [] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Bookings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Latest bookings in your library
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">
            No recent bookings found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
            >

              <div>
                <p className="font-medium text-gray-900">
                  {booking.student?.user?.name || "Unknown Student"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Seat: {booking.seat?.seatNumber || "N/A"}
                </p>
              </div>

              <div className="text-right">

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${booking.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {booking.status}
                </span>

                <p className="mt-2 text-xs text-gray-500">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </p>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default RecentBookings;