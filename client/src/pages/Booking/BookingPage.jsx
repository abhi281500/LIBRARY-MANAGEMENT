import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema } from "../../schemas/booking.schema.js"
import { createBooking } from "../../services/booking.service.js";

import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { getAllStudents } from "../../services/student.service.js";
import { getAllSeats } from "../../services/seat.service.js";

function BookingPage() {
    const {
        register, handleSubmit, formState: { errors }, } = useForm({
            resolver: zodResolver(bookingSchema),
            defaultValues: {
                studentId: "",
                seatId: "",
                startDate: "",
                endDate: "",
                amount: "",

            },
        });

    const navigate = useNavigate()

    const { data, isLoading, isError } = useQuery({
        queryKey: ["students"],
        queryFn: getAllStudents,
    });


    const students = data?.students || []; 

    
    const {
        data: seatData,
        isLoading: seatsLoading,
        isError: seatsError,
    } = useQuery({
        queryKey: ["seats"],
        queryFn: getAllSeats,
    });

    const seats = seatData?.seats || [];

    const mutation = useMutation({
        mutationFn: createBooking,
        onSuccess: (data) => {
            toast.success(data.message);
            navigate("/dashboard");
        },

        onError: (error) => {
            toast.error(
                error.response?.data?.message || "Failed to create booking"
            );
        },
    });





    const onSubmit = (data) => {

        mutation.mutate(data);
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg space-y-5"
            >

                <select
                    {...register("studentId")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                    <option value="">Select Student</option>

                    {students.map((student) => (
                        <option key={student._id} value={student._id}>
                            {student.user.name}
                        </option>
                    ))}
                </select>


                <select
                    {...register("seatId")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                    <option value="">Select Seat</option>

                    {seats.map((seat) => (
                        <option key={seat._id} value={seat._id}>
                            {seat.seatNumber}
                        </option>
                    ))}
                </select>




                <Input
                    label="Start Date"
                    type="date"
                    placeholder="Enter start date"
                    error={errors.startDate?.message}
                    {...register("startDate")}
                />



                <Input
                    label="End Date"
                    type="date"
                    placeholder="Enter end date"
                    error={errors.endDate?.message}
                    {...register("endDate")}
                />



                <Input
                    label="Amount"
                    type="number"
                    placeholder="Enter booking amount"
                    error={errors.amount?.message}
                    {...register("amount", {
                        valueAsNumber: true,
                    })}
                />



                <Button
                    type="submit"
                    fullWidth
                    loading={mutation.isPending}
                >
                    Create Booking
                </Button>

            </form>
        </div>
    );
}

export default BookingPage