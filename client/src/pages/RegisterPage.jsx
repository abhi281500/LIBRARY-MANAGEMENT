import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../schemas/register.schema.js";
import { register as registerUser } from "../services/auth.service.js";
import { Link } from "react-router-dom";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";



function RegisterPage() {
  const {
    register, handleSubmit, formState: { errors }, } = useForm({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword:""
      },
    });

  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: registerUser,

    onSuccess: (data) => {
      toast.success(data.message);

      navigate("/login");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Registration failed"
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

      <div>
        <Input
          label="Name"
          type="text"
          placeholder="Enter your name"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>


      <div>
        <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  {...register("email")}
                />
      </div>

      <div>
       <Input
                label="Phone"
                 type="tel"
                 placeholder="Enter your phone number"
                 error={errors.phone?.message}
                 {...register("phone")}
               />
      </div>

      <div>
        <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  {...register("password")}
                />
      </div>

      <div>
        <Input
                  label="ConfirmPasword"
                  type="password"
                  placeholder="Enter your confirm-password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
      </div>



      <Button
    type="submit"
    fullWidth
    loading={mutation.isPending}
>
    Register
</Button>
      <p>
        Already have an account ?
        <Link to="/login"
        className="font-medium text-blue-600 hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
    </div>
  );
}

export default RegisterPage