import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  getLibraryById,
  updateLibrary,
} from "../../services/library.service.js";

import { librarySchema } from "../../schemas/library.schema.js";

import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";

function EditLibraryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(librarySchema),
    defaultValues: {
      name: "",
      openTime: "",
      closeTime: "",
      address: "",
      phone: "",
      upiId: "",
      description: "",
      totalSeats: "",
    },
  });

  // 1. Fetch existing library
  const {
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["library", id],
    queryFn: async () => {
      const data = await getLibraryById(id);

      reset({
        name: data.library.name || "",
        openTime: data.library.openTime || "",
        closeTime: data.library.closeTime || "",
        address: data.library.address || "",
        phone: data.library.phone || "",
        upiId: data.library.upiId || "",
        description: data.library.description || "",
        totalSeats: data.library.totalSeats || 50,
      });

      return data;
    },
    enabled: !!id,
  });

  // 2. Update mutation
  const mutation = useMutation({
    mutationFn: updateLibrary,

    onSuccess: (data) => {
      toast.success(data.message || "Library updated successfully");

      // Invalidate all related caches
      queryClient.invalidateQueries({ queryKey: ["library", id] });
      queryClient.invalidateQueries({ queryKey: ["libraries"] });
      queryClient.invalidateQueries({ queryKey: ["my-library"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      navigate(`/libraries/${id}`);
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update library"
      );
    },
  });

  // 3. Form submit
  const onSubmit = (data) => {
    mutation.mutate({
      id,
      payload: data,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium">Loading library details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">
          {error.response?.data?.message || "Failed to load library"}
        </p>

        <Button
          type="button"
          onClick={() => navigate("/libraries")}
        >
          Back to Libraries
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Edit Library Information
          </h1>

          <p className="mt-1 text-gray-500">
            Update your library profile, desk capacity, operational hours, and billing UPI ID.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-xl bg-white p-8 shadow"
        >
          <Input
            label="Library Name"
            type="text"
            placeholder="e.g. StudySpace Central Reading Room"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Open Time"
              type="time"
              error={errors.openTime?.message}
              {...register("openTime")}
            />

            <Input
              label="Close Time"
              type="time"
              error={errors.closeTime?.message}
              {...register("closeTime")}
            />
          </div>

          <Input
            label="Complete Physical Address"
            type="text"
            placeholder="Enter library street address, landmark, city"
            error={errors.address?.message}
            {...register("address")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Helpline Phone Number"
              type="tel"
              placeholder="10-digit mobile number"
              error={errors.phone?.message}
              {...register("phone")}
            />

            <Input
              label="Official UPI ID (Fees & QR)"
              type="text"
              placeholder="e.g. yourlibrary@okaxis"
              error={errors.upiId?.message}
              {...register("upiId")}
            />
          </div>

          <Input
            label="Library Description & Amenities"
            type="text"
            placeholder="WiFi, Air conditioned, RO water, power sockets"
            error={errors.description?.message}
            {...register("description")}
          />

          <Input
            label="Total Seat Capacity"
            type="number"
            placeholder="e.g. 50"
            error={errors.totalSeats?.message}
            {...register("totalSeats", {
              valueAsNumber: true,
            })}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              loading={mutation.isPending}
              fullWidth
            >
              Update Library
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/libraries/${id}`)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditLibraryPage;
