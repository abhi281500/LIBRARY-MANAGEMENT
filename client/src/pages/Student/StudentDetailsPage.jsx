import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useState } from "react";

import {
  getAllStudents,
  deleteStudent,
} from "../../services/student.service.js";

import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import Button from "../../components/ui/Button.jsx";

function AllStudentsPage() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const queryClient = useQueryClient();

  // Fetch students
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["all-students"],
    queryFn: getAllStudents,
  });

  // Delete student
  const deleteMutation = useMutation({
    mutationFn: deleteStudent,

    onSuccess: (data) => {
      toast.success(
        data.message || "Student deleted successfully"
      );

      setShowDeleteDialog(false);
      setSelectedStudent(null);

      queryClient.invalidateQueries({
        queryKey: ["all-students"],
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete student"
      );
    },
  });

  // Confirm delete
  const handleDelete = () => {
    if (!selectedStudent?._id) {
      return;
    }

    deleteMutation.mutate(selectedStudent._id);
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-base font-medium text-gray-600">
          Loading students...
        </p>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-red-600">
            Failed to load students
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            {error.response?.data?.message ||
              "Something went wrong while fetching students."}
          </p>

          <Link
            to="/students/new"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Create Student
          </Link>
        </div>
      </div>
    );
  }

  const students = data?.students || [];

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                All Students
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage students enrolled in your library.
              </p>
            </div>

            <Link
              to="/students/new"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Create New Student
            </Link>
          </div>

          {/* Empty State */}
          {students.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">
                No Students Found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create your first student to get started.
              </p>

              <Link
                to="/students/new"
                className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Create Student
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {students.map((student) => (
                <div
                  key={student._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  {/* Card Header */}
                  <div className="border-b border-gray-100 p-6">
                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {student.user?.name || "Unknown Student"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          Admission No:{" "}
                          <span className="font-medium text-gray-700">
                            {student.admissionNumber}
                          </span>
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          student.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {student.status}
                      </span>

                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-4 p-6">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Email
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-gray-800">
                        {student.user?.email || "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Phone
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {student.user?.phone || "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Joining Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {student.joiningDate
                          ? new Date(
                              student.joiningDate
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Not available"}
                      </p>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50 p-5">

                    <Link
                      to={`/students/${student._id}`}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                    >
                      View
                    </Link>

                    <Link
                      to={`/students/${student._id}/edit`}
                      className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-600"
                    >
                      Edit
                    </Link>

                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => {
                        setSelectedStudent(student);
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
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Student?"
        message={
          selectedStudent
            ? `Are you sure you want to delete "${selectedStudent.user?.name || "this student"}"? This action cannot be undone.`
            : "Are you sure you want to delete this student?"
        }
        confirmText="Delete Student"
        cancelText="Cancel"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setShowDeleteDialog(false);
            setSelectedStudent(null);
          }
        }}
      />
    </>
  );
}

export default AllStudentsPage;