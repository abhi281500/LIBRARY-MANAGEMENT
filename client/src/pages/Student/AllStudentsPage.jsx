import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {  getAllStudents, deleteStudent } from "../../services/student.service.js";
import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import  {useState } from "react";
import Button from "../../components/ui/Button.jsx";

function AllStudentsPage() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // React Query cache control
  const queryClient = useQueryClient();



  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["all-students"],
    queryFn: getAllStudents,
  });

  
  const deleteMutation = useMutation({
    mutationFn: deleteStudent,

    onSuccess: (data) => {
      toast.success(
        data.message || "Student deleted successfully"
      );

     
      setShowDeleteDialog(false);

      
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

  const handleDelete = () => {
    if (!students._id) {
      return;
    }

    deleteMutation.mutate(students._id);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-gray-600">
          Loading students...
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
              "Failed to load students"}
          </h2>

          <Link
            to="/students/new"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Create Student
          </Link>
        </div>
      </div>
    );
  }


  

  const students = data?.students || [];

  if (!students) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <h2 className="text-xl font-semibold text-gray-800">
            No Students Found
          </h2>

          <p className="mt-2 text-gray-500">
            Create your students to get started.
          </p>

          <Link
            to="/students/new"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            + Create Student
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          All Students
        </h1>

        <Link
          to="/students/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Create New Student
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <p>No Students Found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {students.map((student) => (
            <div
              key={student._id}
              className="rounded-lg bg-white p-6 shadow"
            >
              <h2 className="text-xl font-semibold">
                {student.user?.name}
              </h2>

              <p className="mt-2 text-gray-600">
                📍 {student.user?.email}
              </p>

              <p className="text-gray-600">
                📞 {student.user?.phone}
              </p>

              <p className="text-gray-600">
                🪑 {student.status}
              </p>

              <p className="text-gray-600">
                🪑 {student.admissionNumber}
              </p>

              <p className="text-gray-600">
                📅 {student.joiningDate}
              </p>

              <div className="mt-4 flex gap-2">
                <Link
                  to={`/students/${student._id}`}
                  className="rounded bg-green-600 px-3 py-2 text-white"
                >
                  View
                </Link>

                <Link
                  to={`/students/${student._id}/edit`}
                  className="rounded bg-yellow-500 px-3 py-2 text-white"
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
          ))}

        </div>
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Student?"
        message={`Are you sure you want to delete "${students.name}"? This action cannot be undone.`}
        confirmText="Delete Student"
        cancelText="Cancel"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setShowDeleteDialog(false);
          }
        }}
      />



    </div>
  );
}

export default AllStudentsPage;