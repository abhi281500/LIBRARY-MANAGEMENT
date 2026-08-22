import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema } from "../../schemas/student.schema.js"
import { createStudent } from "../../services/student.service.js";

import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";




function StudentPage() {
    const {
        register, handleSubmit, formState: { errors }, } = useForm({
            resolver: zodResolver(studentSchema),
            defaultValues: {
                name: "",
                email: "",
                password: "",
                phone: "",
                admissionNumber: "",
                status: "ACTIVE",
                joiningDate: "",
                confirmPassword: "",


            },
        });

    const navigate = useNavigate()

    const mutation = useMutation({
        mutationFn: createStudent,
        onSuccess: (data) => {
            toast.success(data.message);
            navigate("/students");
        },

        onError: (error) => {
            toast.error(
                error.response?.data?.message || "Failed to create student"
            );
        },
    });




    const onSubmit = (data) => {
        const { confirmPassword, ...payload } = data;

        mutation.mutate(payload);
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg space-y-5"
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
                    label="Password"
                    type="password"
                    placeholder="Enter student password"
                    error={errors.password?.message}
                    {...register("password")}
                />



                <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm student password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                />

                <Input
                    label="Phone"
                    type="tel"
                    placeholder="Enter student phone"
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
                    label="joining Date"
                    type="date"
                    placeholder="Enter student joining date"
                    error={errors.joiningDate?.message}
                    {...register("joiningDate")}
                />



                <label className="block">
                    <span className="mb-1 block text-sm font-medium">
                        Status
                    </span>

                    <select
                        {...register("status")}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
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
                    Create Student
                </Button>

            </form>
        </div>
    );
}

export default StudentPage