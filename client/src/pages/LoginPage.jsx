import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/auth.schema.js";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { login as loginUser } from "../services/auth.service.js";
import { useAuth } from "../hooks/useAuth.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { Link } from "react-router-dom";
function LoginPage() {
  const {
    register, handleSubmit, formState: { errors }, } = useForm({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        email: "",
        password: "",
      },
    });

  const { login } = useAuth()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      login(data.token, data.user);

      toast.success(data.message);

      navigate("/dashboard");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Login failed"
      );
    },
  });


  const onSubmit = (data) => {
    mutation.mutate(data)
    // console.log(data);
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <form onSubmit={handleSubmit(onSubmit)}
     className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg space-y-5"
    >
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
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <Button
        type="submit"
        fullWidth
        loading={mutation.isPending}
      >
        Login
      </Button>

      <p>
        Don't have an account ?
        <Link to="/register"
        className="font-medium text-blue-600 hover:underline"
        >
          Signup
        </Link>
      </p>
    </form>
    </div>
  );
}

export default LoginPage;