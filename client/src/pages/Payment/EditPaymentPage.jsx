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
  getPaymentById,
  updatePayment,
} from "../../services/payment.service.js";

import { updatePaymentSchema } from "../../schemas/payment.schema.js";

import Button from "../../components/ui/Button.jsx";

function EditPaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updatePaymentSchema),

    defaultValues: {
      paymentMethod: "CASH",
    },
  });

  // 1. Existing payment fetch
  const {
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["payment", id],

    queryFn: async () => {
      const data = await getPaymentById(id);

      reset({
        paymentMethod:
          data.payment.paymentMethod,
      });

      return data;
    },

    enabled: !!id,
  });

  // 2. Update payment
  const mutation = useMutation({
    mutationFn: updatePayment,

    onSuccess: (data) => {
      toast.success(
        data.message ||
          "Payment updated successfully"
      );

      // Refresh payment details
      queryClient.invalidateQueries({
        queryKey: ["payment", id],
      });

      // Refresh payment list
      queryClient.invalidateQueries({
        queryKey: ["payments"],
      });

      navigate(`/payments/${id}`);
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update payment"
      );
    },
  });

  // 3. Submit
  const onSubmit = (data) => {
    mutation.mutate({
      id,
      payload: data,
    });
  };

  // LOADING
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium">
          Loading payment...
        </p>
      </div>
    );
  }

  // ERROR
  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">
          {error.response?.data?.message ||
            "Failed to load payment"}
        </p>

        <Button
          type="button"
          onClick={() => navigate("/payments")}
        >
          Back to Payments
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="mx-auto max-w-xl">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Edit Payment
          </h1>

          <p className="mt-1 text-gray-500">
            Update payment information
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-xl bg-white p-8 shadow"
        >

          {/* PAYMENT METHOD */}
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Payment Method
            </span>

            <select
              {...register("paymentMethod")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="CASH">
                CASH
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="CARD">
                CARD
              </option>

              <option value="BANK_TRANSFER">
                BANK TRANSFER
              </option>
            </select>

            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-500">
                {errors.paymentMethod.message}
              </p>
            )}
          </label>

          {/* BUTTONS */}
          <div className="flex gap-3">

            <Button
              type="submit"
              loading={mutation.isPending}
              fullWidth
            >
              Update Payment
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                navigate(`/payments/${id}`)
              }
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

export default EditPaymentPage;