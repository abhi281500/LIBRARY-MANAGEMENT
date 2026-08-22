import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  getMyLibrary,
  deleteLibrary,
} from "../../services/library.service.js";

import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import Button from "../../components/ui/Button.jsx";

function LibrariesPage() {
  // Delete dialog open/close
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // React Query cache control
  const queryClient = useQueryClient();

  // Get logged-in owner's library
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-library"],
    queryFn: getMyLibrary,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteLibrary,

    onSuccess: (data) => {
      toast.success(
        data.message || "Library deleted successfully"
      );

      // Dialog close
      setShowDeleteDialog(false);

      // My library data refresh/remove
      queryClient.invalidateQueries({
        queryKey: ["my-library"],
      });

      // Agar kahin libraries list cached hai
      queryClient.invalidateQueries({
        queryKey: ["libraries"],
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete library"
      );
    },
  });

  // Delete button confirm hone par
  const handleDelete = () => {
    if (!library?._id) {
      return;
    }

    deleteMutation.mutate(library._id);
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-gray-600">
          Loading library...
        </p>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <h2 className="text-xl font-semibold text-red-500">
            {error.response?.data?.message ||
              "Failed to load library"}
          </h2>

          <Link
            to="/library/new"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Create Library
          </Link>
        </div>
      </div>
    );
  }

  const library = data?.library;

  // No library
  if (!library) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <h2 className="text-xl font-semibold text-gray-800">
            No Library Found
          </h2>

          <p className="mt-2 text-gray-500">
            Create your library to get started.
          </p>

          <Link
            to="/library/new"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            + Create Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-8">

        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Library
              </h1>

              <p className="mt-1 text-gray-500">
                Manage your library
              </p>
            </div>

            <Link
              to={`/libraries/${library._id}`}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              View Details
            </Link>

          </div>

          {/* Library Card */}
          <div className="rounded-xl bg-white p-6 shadow">

            {/* Library Header */}
            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {library.name}
                </h2>

                <p className="mt-2 text-gray-500">
                  {library.address}
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                {library.status}
              </span>

            </div>

            {/* Details */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              <div>
                <p className="text-sm text-gray-500">
                  Phone
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {library.phone}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Open Time
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {library.openTime}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Close Time
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {library.closeTime}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total Seats
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {library.totalSeats}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Subscription
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {library.subscription}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {library.status}
                </p>
              </div>

            </div>

            {/* Description */}
            <div className="mt-8 border-t pt-6">

              <p className="text-sm text-gray-500">
                Description
              </p>

              <p className="mt-2 text-gray-700">
                {library.description ||
                  "No description available"}
              </p>

            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3 border-t pt-6">

              <Link
                to={`/libraries/${library._id}`}
                className="rounded-lg bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-900"
              >
                View
              </Link>

              <Link
                to={`/libraries/${library._id}/edit`}
                className="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-white hover:bg-yellow-600"
              >
                Edit
              </Link>

              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete
              </Button>

            </div>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Library?"
        message={`Are you sure you want to delete "${library.name}"? This action cannot be undone.`}
        confirmText="Delete Library"
        cancelText="Cancel"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setShowDeleteDialog(false);
          }
        }}
      />
    </>
  );
}

export default LibrariesPage;