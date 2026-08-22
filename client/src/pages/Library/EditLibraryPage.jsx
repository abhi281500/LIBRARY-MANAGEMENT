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
      description: "",
      totalSeats: "",
    },
  });

  // 1. Existing library fetch karo
  const {
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["library", id],
    queryFn: async () => {
      const data = await getLibraryById(id);

      reset({
        name: data.library.name,
        openTime: data.library.openTime,
        closeTime: data.library.closeTime,
        address: data.library.address,
        phone: data.library.phone,
        description: data.library.description || "",
        totalSeats: data.library.totalSeats,
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

      // Old cached library data ko refresh karo
      queryClient.invalidateQueries({
        queryKey: ["library", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["libraries"],
      });

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
        <p className="text-lg font-medium">
          Loading library...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">
          {error.response?.data?.message ||
            "Failed to load library"}
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
          <h1 className="text-3xl font-bold">
            Edit Library
          </h1>

          <p className="mt-1 text-gray-500">
            Update your library information
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-xl bg-white p-8 shadow"
        >
          <Input
            label="Name"
            type="text"
            placeholder="Enter library name"
            error={errors.name?.message}
            {...register("name")}
          />

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

          <Input
            label="Address"
            type="text"
            placeholder="Enter library address"
            error={errors.address?.message}
            {...register("address")}
          />

          <Input
            label="Phone"
            type="tel"
            placeholder="Enter library phone number"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Input
            label="Description"
            type="text"
            placeholder="Enter library description"
            error={errors.description?.message}
            {...register("description")}
          />

          <Input
            label="Total Seats"
            type="number"
            placeholder="Enter total seats"
            error={errors.totalSeats?.message}
            {...register("totalSeats", {
              valueAsNumber: true,
            })}
          />

          <div className="flex gap-3">
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