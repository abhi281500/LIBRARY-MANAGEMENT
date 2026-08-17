import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  getAllBookings,
  cancelBooking,
} from "../../services/booking.service.js";

import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import Button from "../../components/ui/Button.jsx";

function AllBookingsPage() {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: getAllBookings,
  });

  const bookings = data?.bookings || [];

  const CancelMutation = useMutation({
    mutationFn: cancelBooking,

    onSuccess: (data) => {
      toast.success(
        data?.message || "Booking cancelled successfully"
      );

      showCancelDialog(false);
      setSelectedBooking(null);

      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

     
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to cancel booking"
      );
    },
  });

  const handleDelete = () => {
    if (!selectedBooking?._id) {
      return;
    }

    CancelMutation.mutate(selectedBooking._id);
  };

  const openDeleteDialog = (booking) => {
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-lg font-medium text-gray-600">
            Loading bookings...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            ⚠️
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Failed to load bookings
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error?.response?.data?.message ||
              "Something went wrong while loading bookings."}
          </p>

          <Link
            to="/bookings/new"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            Create Booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            All Bookings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all library seat bookings.
          </p>
        </div>

        <Link
          to="/bookings/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Create New Booking
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm font-medium text-gray-500">
            Total Bookings
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {bookings.length}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm font-medium text-gray-500">
            Active Bookings
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {
              bookings.filter(
                (booking) =>
                  booking.status === "ACTIVE"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm font-medium text-gray-500">
            Total Revenue
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            ₹
            {bookings
              .reduce(
                (total, booking) =>
                  total + Number(booking.amount || 0),
                0
              )
              .toLocaleString("en-IN")}
          </p>
        </div>

      </div>

      {/* Empty State */}
      {bookings.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
            📚
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            No Bookings Found
          </h2>

          <p className="mt-2 text-gray-500">
            Create your first seat booking to get started.
          </p>

          <Link
            to="/bookings/new"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            + Create Booking
          </Link>
        </div>
      ) : (
        /* Booking Cards */
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

          {bookings.map((booking) => (

            <div
              key={booking._id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-lg"
            >

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-gray-100 p-5">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Booking
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    #{booking._id?.slice(-6)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    booking.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "CANCELLED"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {booking.status || "ACTIVE"}
                </span>

              </div>

              {/* Card Body */}
              <div className="space-y-5 p-5">

                {/* Student */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    👤
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      STUDENT
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {booking.studentId}
                    </p>
                  </div>
                </div>

                {/* Seat */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                    💺
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      SEAT
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {booking.seatId}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-400">
                      START DATE
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {formatDate(booking.startDate)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-400">
                      END DATE
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {formatDate(booking.endDate)}
                    </p>
                  </div>

                </div>

                {/* Amount */}
                <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">

                  <span className="text-sm font-medium text-gray-600">
                    Booking Amount
                  </span>

                  <span className="text-lg font-bold text-blue-700">
                    ₹{Number(booking.amount || 0).toLocaleString("en-IN")}
                  </span>

                </div>

              </div>

              {/* Card Footer */}
              <div className="flex gap-2 border-t border-gray-100 bg-gray-50 p-4">

                <Link
                  to={`/bookings/${booking._id}`}
                  className="flex-1 rounded-lg bg-green-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  View
                </Link>

                <Link
                  to={`/bookings/${booking._id}/edit`}
                  className="flex-1 rounded-lg bg-yellow-500 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-yellow-600"
                >
                  Edit
                </Link>

                <Button
                  type="button"
                  variant="danger"
                  onClick={() => openDeleteDialog(booking)}
                  className="flex-1"
                >
                  Delete
                </Button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        open={showCancelDialog}

        title="Cancel Booking?"

        message={
          selectedBooking
            ? `Are you sure you want to cancel booking for student "${selectedBooking.studentId}"?`
            : ""
        }

        confirmText="Cancel Booking"
        cancelText="Keep Booking"

        loading={CancelMutation.isPending}

        onConfirm={handleDelete}

        onCancel={() => {
          if (!CancelMutation.isPending) {
            setShowCancelDialog(false);
            setSelectedBooking(null);
          }
        }}
      />

    </div>
  );
}

export default AllBookingsPage;