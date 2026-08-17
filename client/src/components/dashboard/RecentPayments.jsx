function RecentPayments({ payments = [] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Payments
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Latest payment activity in your library
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">
            No recent payments found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {payments.map((payment) => (
            <div
              key={payment._id}
              className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
            >

              {/* Payment information */}
              <div>
                <p className="font-medium text-gray-900">
                  {payment.student?.name || "Unknown Student"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {payment.paymentMethod || "N/A"}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {payment.booking
                    ? `Booking: ${payment.booking._id}`
                    : "Booking: N/A"}
                </p>
              </div>

              {/* Amount + status */}
              <div className="text-right">

                <p className="font-semibold text-gray-900">
                  ₹{payment.amount || 0}
                </p>

                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    payment.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : payment.paymentStatus === "REFUNDED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {payment.paymentStatus}
                </span>

                <p className="mt-2 text-xs text-gray-500">
                  {payment.createdAt
                    ? new Date(
                        payment.createdAt
                      ).toLocaleDateString()
                    : "N/A"}
                </p>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default RecentPayments;