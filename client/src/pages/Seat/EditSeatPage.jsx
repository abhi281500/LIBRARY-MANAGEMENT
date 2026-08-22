import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  getSeatById,
  updateSeat,
} from "../../services/seat.service.js";

import { seatSchema } from "../../schemas/seat.schema.js";

import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";

function EditSeatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(seatSchema),

    defaultValues: {
      seatNumber: "",
      floor: "",
      type: "NORMAL",
      status: "AVAILABLE",
    },
  });

  // Fetch existing seat
  const {
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["seat", id],

    queryFn: async () => {
      const data = await getSeatById(id);

      const seat = data.seat;

      reset({
        seatNumber: seat.seatNumber || "",
        floor: seat.floor ?? "",
        type: seat.type || "NORMAL",
        status: seat.status || "AVAILABLE",
      });

      return data;
    },

    enabled: Boolean(id),
  });

  // Update seat
  const mutation = useMutation({
    mutationFn: updateSeat,

    onSuccess: (data) => {
      toast.success(
        data.message || "Seat updated successfully"
      );

      queryClient.invalidateQueries({
        queryKey: ["seat", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["seats"],
      });

      navigate(`/seats/${id}`);
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update seat"
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
          Loading seat...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-red-500">
          {error.response?.data?.message ||
            "Failed to load seat"}
        </p>

        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/seats")}
        >
          Back to Seats
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-xl">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Seat
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update seat information
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <Input
            label="Seat Number"
            type="text"
            placeholder="Enter seat number"
            error={errors.seatNumber?.message}
            {...register("seatNumber")}
          />

          <Input
            label="Floor"
            type="number"
            placeholder="Enter floor number"
            error={errors.floor?.message}
            {...register("floor", {
              valueAsNumber: true,
            })}
          />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Type
            </span>

            <select
              {...register("type")}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
            >
              <option value="NORMAL">Normal</option>
              <option value="PREMIUM">Premium</option>
            </select>

            {errors.type && (
              <p className="mt-1 text-sm text-red-500">
                {errors.type.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </span>

            <select
              {...register("status")}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
            >
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>

            {errors.status && (
              <p className="mt-1 text-sm text-red-500">
                {errors.status.message}
              </p>
            )}
          </label>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              loading={mutation.isPending}
              fullWidth
            >
              Update Seat
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigate(`/seats/${id}`)}
            >
              Cancel
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default EditSeatPage;