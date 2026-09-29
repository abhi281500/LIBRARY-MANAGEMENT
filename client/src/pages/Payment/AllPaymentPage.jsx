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

  
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: getAllPayments,
  });

  
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

  
  const openRefundDialog = (payment) => {
    setSelectedPayment(payment);
    setShowRefundDialog(true);
  };

  
  const handleRefund = () => {
    if (!selectedPayment?._id) {
      return;
    }

    refundMutation.mutate(selectedPayment._id);
  };

  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg font-medium text-gray-600">
          Loading payments...
        </p>
      </div>
    );
  }


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

      {/*Header */}
      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            All Payments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and view all payment records
          </p>
        </div>

        <Link
          to="/payments/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          + Create New Payment
        </Link>
      </div>

      {/* EMPTY STATE*/}
      {payments.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow">

          <h2 className="text-xl font-semibold text-gray-800">
            No Payments Found
          </h2>

          <p className="mt-2 text-gray-500">
            There are no payment records available.
          </p>

          <Link
            to="/payments/new"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            Create Payment
          </Link>
        </div>
      ) : (

        /* PAYMENT CARDS */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {payments.map((payment) => (

            <div
              key={payment._id}
              className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg"
            >

              {/* PAYMENT HEADER */}
              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {payment.receiptNumber}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {payment.paymentDate
                      ? new Date(
                          payment.paymentDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                {/* PAYMENT STATUS */}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    payment.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : payment.paymentStatus === "REFUNDED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {payment.paymentStatus}
                </span>

              </div>

              {/*  STUDENT INFORMATION */}
              <div className="mt-5">

                <p className="text-lg font-semibold text-gray-900">
                  {payment.student?.user?.name || "N/A"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Admission No:{" "}
                  {payment.student?.admissionNumber || "N/A"}
                </p>

              </div>

              {/* BOOKING INFORMATION */}
              <div className="mt-4 space-y-2">

                <p className="text-sm text-gray-600">
                  🪑 Seat:{" "}
                  <span className="font-medium text-gray-800">
                    {payment.booking?.seat?.seatNumber ||
                      "N/A"}
                  </span>
                </p>

                <p className="text-sm text-gray-600">
                  💰 Amount:{" "}
                  <span className="font-semibold text-gray-900">
                    ₹{payment.amount}
                  </span>
                </p>

                <p className="text-sm text-gray-600">
                  💳 Method:{" "}
                  <span className="font-medium text-gray-800">
                    {payment.paymentMethod}
                  </span>
                </p>

              </div>

              {/* LIBRARY INFORMATION */}
              <div className="mt-5 border-t pt-4">

                <p className="font-medium text-gray-800">
                  {payment.library?.name || "N/A"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {payment.library?.address || "N/A"}
                </p>

              </div>

              {/* ACTIONS   */}
              <div className="mt-5 flex gap-2">

                {/* VIEW */}
                <Link
                  to={`/payments/${payment._id}`}
                  className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  View
                </Link>

                {/* EDIT */}
                <Link
                  to={`/payments/${payment._id}/edit`}
                  className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-yellow-600"
                >
                  Edit
                </Link>

                {/* REFUND */}
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

      {/* =========================
          REFUND CONFIRMATION
      ========================= */}
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