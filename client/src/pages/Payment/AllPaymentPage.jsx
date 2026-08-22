import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  getAllPayments,
  refundPayment,
} from "../../services/payment.service.js";

import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import Button from "../../components/ui/Button.jsx";

function AllPaymentPage() {
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const queryClient = useQueryClient();

  // GET ALL PAYMENTS
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: getAllPayments,
  });

  // REFUND PAYMENT
  const refundMutation = useMutation({
    mutationFn: refundPayment,

    onSuccess: (data) => {
      toast.success(
        data.message || "Payment refunded successfully"
      );

      setShowRefundDialog(false);
      setSelectedPayment(null);

      queryClient.invalidateQueries({
        queryKey: ["payments"],
      });

      // Booking bhi cancel hoti hai
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-bookings"],
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to refund payment"
      );
    },
  });

  // OPEN REFUND DIALOG
  const openRefundDialog = (payment) => {
    setSelectedPayment(payment);
    setShowRefundDialog(true);
  };

  // CONFIRM REFUND
  const handleRefund = () => {
    if (!selectedPayment?._id) {
      return;
    }

    refundMutation.mutate(selectedPayment._id);
  };

  // LOADING
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-gray-600">
          Loading payments...
        </p>
      </div>
    );
  }

  // ERROR
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <h2 className="text-xl font-semibold text-red-500">
            {error.response?.data?.message ||
              "Failed to load payments"}
          </h2>

          <Link
            to="/payments/new"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Create Payment
          </Link>
        </div>
      </div>
    );
  }

  const payments = data?.payments || [];

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          All Payments
        </h1>

        <Link
          to="/payments/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Create New Payment
        </Link>
      </div>

      {/* EMPTY STATE */}
      {payments.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <p>No Payments Found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {payments.map((payment) => (
            <div
              key={payment._id}
              className="rounded-lg bg-white p-6 shadow"
            >

              {/* PAYMENT ID */}
              <h2 className="text-xl font-semibold">
                {payment.receiptNumber}
              </h2>

              {/* AMOUNT */}
              <p className="mt-2 text-gray-600">
                💰 Amount: ₹{payment.amount}
              </p>

              {/* PAYMENT METHOD */}
              <p className="text-gray-600">
                💳 Method: {payment.paymentMethod}
              </p>

              {/* PAYMENT STATUS */}
              <p className="text-gray-600">
                📌 Status: {payment.paymentStatus}
              </p>

              {/* PAYMENT DATE */}
              <p className="text-gray-600">
                📅 Date:{" "}
                {payment.paymentDate
                  ? new Date(
                      payment.paymentDate
                    ).toLocaleDateString()
                  : "N/A"}
              </p>

              {/* BOOKING */}
              <p className="text-gray-600">
                🪑 Booking:{" "}
                {payment.booking?._id || "N/A"}
              </p>

              {/* ACTIONS */}
              <div className="mt-4 flex gap-2">

                <Link
                  to={`/payments/${payment._id}`}
                  className="rounded bg-green-600 px-3 py-2 text-white"
                >
                  View
                </Link>

                <Link
                  to={`/payments/${payment._id}/edit`}
                  className="rounded bg-yellow-500 px-3 py-2 text-white"
                >
                  Edit
                </Link>

                {payment.paymentStatus === "PAID" && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() =>
                      openRefundDialog(payment)
                    }
                  >
                    Refund
                  </Button>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* REFUND CONFIRMATION */}
      <ConfirmDialog
        open={showRefundDialog}
        title="Refund Payment?"
        message={
          selectedPayment
            ? `Are you sure you want to refund payment "${selectedPayment.receiptNumber}" of ₹${selectedPayment.amount}?`
            : "Are you sure you want to refund this payment?"
        }
        confirmText="Refund Payment"
        cancelText="Cancel"
        loading={refundMutation.isPending}
        onConfirm={handleRefund}
        onCancel={() => {
          if (!refundMutation.isPending) {
            setShowRefundDialog(false);
            setSelectedPayment(null);
          }
        }}
      />

    </div>
  );
}

export default AllPaymentPage;