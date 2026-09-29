import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";

import { createPaymentSchema } from "../../schemas/payment.schema.js";
import { createPayment } from "../../services/payment.service.js";

import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { getAllBookings } from "../../services/booking.service.js";

function PaymentPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPaymentSchema),

    defaultValues: {
      bookingId: "",
      paymentMethod: "CASH",
    },
  });

  const mutation = useMutation({
    mutationFn: createPayment,

    onSuccess: (data) => {
      toast.success(
        data.message || "Payment created successfully"
      );

      navigate("/payments");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        "Failed to create payment"
      );
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bookings"],
    queryFn: getAllBookings,
  });

  const bookings = data?.bookings || [];

  const onSubmit = (data) => {
    mutation.mutate(data);
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg space-y-5"
      >

        {/* BOOKING ID */}

        <select
          {...register("bookingId")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">Select Booking</option>

          {bookings.map((booking) => (
            <option
              key={booking._id}
              value={booking._id}
            >
              {booking.student.user.name} • {booking.seat.seatNumber} • ₹{booking.amount}
            </option>
          ))}
        </select>

          
    

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

        {/* SUBMIT */}
        <Button
          type="submit"
          fullWidth
          loading={mutation.isPending}
        >
          Create Payment
        </Button>

      </form>
    </div>
  );
}

export default PaymentPage;