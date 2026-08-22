import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

import { Link } from "react-router-dom";
import {
  getAllSeats,
  deleteSeat,
} from "../../services/seat.service.js";

import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import Button from "../../components/ui/Button.jsx";

function AllSeatsPage() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // React Query cache control
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["seats"],
    queryFn: getAllSeats,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSeat,

    onSuccess: (data) => {
  toast.success(
    data.message || "Seat deleted successfully"
  );

  setShowDeleteDialog(false);
  setSelectedSeat(null);

  queryClient.invalidateQueries({
    queryKey: ["seats"],
  });
},

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        "Failed to delete seat"
      );
    },
  });

  const handleDelete = () => {
    if (!selectedSeat?._id) {
      return;
    }

    deleteMutation.mutate(selectedSeat._id);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-gray-600">
          Loading seats...
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
              "Failed to load seats"}
          </h2>

          <Link
            to="/seats/new"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Create Seat
          </Link>
        </div>
      </div>
    );
  }



  const seats = data?.seats || [];

  


  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          All Seats
        </h1>

        <Link
          to="/seats/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Create New Seat
        </Link>
      </div>

      {seats.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <p>No Seats Found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {seats.map((seat) => (
            <div
              key={seat._id}
              className="rounded-lg bg-white p-6 shadow"
            >
              <h2 className="text-xl font-semibold">
                {seat.seatNumber}
              </h2>

              <p className="mt-2 text-gray-600">
                📍 {seat.floor}
              </p>

              <p className="text-gray-600">
                🛋️ {seat.type}
              </p>

              <p className="text-gray-600">
                🪑 {seat.status}
              </p>

              <div className="mt-4 flex gap-2">
                <Link
                  to={`/seats/${seat._id}`}
                  className="rounded bg-green-600 px-3 py-2 text-white"
                >
                  View
                </Link>

                <Link
                  to={`/seats/${seat._id}/edit`}
                  className="rounded bg-yellow-500 px-3 py-2 text-white"
                >
                  Edit
                </Link>

                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    setSelectedSeat(seat);
                    setShowDeleteDialog(true);
                  }}
                >
                  Delete
                </Button>


              </div>

            </div>
          ))}

        </div>
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Seat?"

        message={
          selectedSeat
            ? `Are you sure you want to delete "${selectedSeat.seatNumber}"? This action cannot be undone.`
            : "Are you sure you want to delete this seat?"
                }


        confirmText="Delete Seat"
        cancelText="Cancel"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => {
  if (!deleteMutation.isPending) {
    setShowDeleteDialog(false);
    setSelectedSeat(null);
  }
}}
      />

    </div>
  );
}

export default AllSeatsPage;