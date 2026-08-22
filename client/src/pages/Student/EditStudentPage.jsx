import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  getStudentById,
  updateStudent,
} from "../../services/student.service.js";

import { studentUpdateSchema } from "../../schemas/studentUpdate.schema.js";

import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";

function EditStudentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentUpdateSchema),

    defaultValues: {
      name: "",
      email: "",
      phone: "",
      admissionNumber: "",
      status: "ACTIVE",
      joiningDate: "",
    },
  });

  // Fetch existing student
  const {
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["student", id],

    queryFn: async () => {
      const data = await getStudentById(id);

      const student = data.student;

      reset({
        name: student.user?.name || "",
        email: student.user?.email || "",
        phone: student.user?.phone || "",
        admissionNumber: student.admissionNumber || "",
        status: student.status || "ACTIVE",

        joiningDate: student.joiningDate
          ? new Date(student.joiningDate)
              .toISOString()
              .split("T")[0]
          : "",
      });

      return data;
    },

    enabled: Boolean(id),
  });

  // Update student
  const mutation = useMutation({
    mutationFn: updateStudent,

    onSuccess: (data) => {
      toast.success(
        data.message || "Student updated successfully"
      );

      // Refresh details
      queryClient.invalidateQueries({
        queryKey: ["student", id],
      });

      // Refresh students list
      queryClient.invalidateQueries({
        queryKey: ["all-students"],
      });

      navigate(`/students/${id}`);
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update student"
      );
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({
      id,
      payload: data,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-gray-600">
          Loading student...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-red-500">
          {error.response?.data?.message ||
            "Failed to load student"}
        </p>

        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/students")}
        >
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-xl">

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Edit Student
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update student information
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <Input
            label="Name"
            type="text"
            placeholder="Enter student name"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Enter student email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Phone"
            type="tel"
            placeholder="Enter student phone number"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Input
            label="Admission Number"
            type="text"
            placeholder="Enter student admission number"
            error={errors.admissionNumber?.message}
            {...register("admissionNumber")}
          />

          <Input
            label="Joining Date"
            type="date"
            error={errors.joiningDate?.message}
            {...register("joiningDate")}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              {...register("status")}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>

            {errors.status && (
              <p className="mt-1 text-sm text-red-500">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              loading={mutation.isPending}
              fullWidth
            >
              Update Student
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() =>
                navigate(`/students/${id}`)
              }
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudentPage;