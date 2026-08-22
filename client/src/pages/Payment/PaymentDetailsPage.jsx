import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getPaymentById } from "../../services/payment.service.js";

function PaymentDetailsPage() {
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPaymentById(id),
    enabled: !!id,
  });

  // LOADING
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h2 className="text-lg font-semibold">
          Loading Payment...
        </h2>
      </div>
    );
  }

  // ERROR
  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h2 className="text-red-500">
          {error.response?.data?.message ||
            "Failed to load payment"}
        </h2>

        <Link
          to="/payments"
          className="rounded bg-gray-800 px-4 py-2 text-white"
        >
          Back to Payments
        </Link>
      </div>
    );
  }

  const payment = data?.payment;

  // PAYMENT NOT FOUND
  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">
          Payment not found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              Payment Details
            </h1>

            <p className="mt-1 text-gray-500">
              {payment.receiptNumber}
            </p>
          </div>

          {/* EDIT */}
          {payment.paymentStatus === "PAID" && (
            <Link
              to={`/payments/${payment._id}/edit`}
              className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
            >
              Edit
            </Link>
          )}

        </div>

        {/* PAYMENT INFORMATION */}
        <div className="space-y-5">

          {/* RECEIPT */}
          <div>
            <h3 className="font-semibold text-gray-600">
              Receipt Number
            </h3>

            <p>
              {payment.receiptNumber}
            </p>
          </div>

          {/* AMOUNT */}
          <div>
            <h3 className="font-semibold text-gray-600">
              Amount
            </h3>

            <p>
              ₹{payment.amount}
            </p>
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <h3 className="font-semibold text-gray-600">
              Payment Method
            </h3>

            <p>
              {payment.paymentMethod}
            </p>
          </div>

          {/* PAYMENT STATUS */}
          <div>
            <h3 className="font-semibold text-gray-600">
              Payment Status
            </h3>

            <p
              className={
                payment.paymentStatus === "PAID"
                  ? "font-medium text-green-600"
                  : payment.paymentStatus === "REFUNDED"
                  ? "font-medium text-red-600"
                  : "font-medium text-yellow-600"
              }
            >
              {payment.paymentStatus}
            </p>
          </div>

          {/* PAYMENT DATE */}
          <div>
            <h3 className="font-semibold text-gray-600">
              Payment Date
            </h3>

            <p>
              {payment.paymentDate
                ? new Date(
                    payment.paymentDate
                  ).toLocaleString()
                : "N/A"}
            </p>
          </div>

          {/* REFUND DATE */}
          {payment.refundDate && (
            <div>
              <h3 className="font-semibold text-gray-600">
                Refund Date
              </h3>

              <p>
                {new Date(
                  payment.refundDate
                ).toLocaleString()}
              </p>
            </div>
          )}

          {/* BOOKING */}
          <div>
            <h3 className="font-semibold text-gray-600">
              Booking
            </h3>

            <p>
              {payment.booking?._id || "N/A"}
            </p>
          </div>

          {/* STUDENT */}
          <div>
            <h3 className="font-semibold text-gray-600">
              Student
            </h3>

            <p>
              {payment.student?.user?.name ||
                payment.student?._id ||
                "N/A"}
            </p>
          </div>

        </div>

        {/* BACK */}
        <div className="mt-8">

          <Link
            to="/payments"
            className="rounded bg-gray-700 px-5 py-2 text-white hover:bg-gray-800"
          >
            ← Back
          </Link>

        </div>

      </div>

    </div>
  );
}

export default PaymentDetailsPage;