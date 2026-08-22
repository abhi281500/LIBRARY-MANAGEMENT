import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { seatSchema } from "../../schemas/seat.schema.js"
import { createSeat  } from "../../services/seat.service.js";

import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";


function SeatPage() {
    const {
        register, handleSubmit, formState: { errors }, } = useForm({
            resolver: zodResolver(seatSchema),
            defaultValues: {
                seatNumber: "",
                floor: "",
                type: "NORMAL",
                status: "AVAILABLE",


            },
        });

    const navigate = useNavigate()

    const mutation = useMutation({
        mutationFn: createSeat,
        onSuccess: (data) => {
            toast.success(data.message);
            navigate("/seats");
        },

        onError: (error) => {
            toast.error(
                error.response?.data?.message || "Failed to create seat"
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
                        {...register("floor")}
                    />
                

                
                    <label className="block">
                    <span className="mb-1 block text-sm font-medium">
                        type
                    </span>

                    <select
                        {...register("type")}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                        <option value="NORMAL">NORMAL</option>
                        <option value="PREMIUM">PREMIUM</option>
                    </select>

                    {errors.type && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.type.message}
                        </p>
                    )}
                </label>
                

                
                   <label className="block">
                    <span className="mb-1 block text-sm font-medium">
                        Status
                    </span>

                    <select
                        {...register("status")}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="OCCUPIED">OCCUPIED</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>

                    {errors.status && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.status.message}
                        </p>
                    )}
                </label>
                


                <Button
                    type="submit"
                    fullWidth
                    loading={mutation.isPending}
                >
                    Create Seat
                </Button>

            </form>
        </div>
    );
}

export default SeatPage