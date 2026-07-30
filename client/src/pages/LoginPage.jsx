import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/auth.schema.js";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { login as loginUser} from "../services/auth.service.js";
import { useAuth } from "../hooks/useAuth.jsx";

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {login} = useAuth()
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
    console.log(data);
  };

  

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          type="email"
          placeholder="Email"
          {...register("email")}
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          {...register("password")}
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      <button type="submit">Login</button>
    </form>
  );
}

export default LoginPage;