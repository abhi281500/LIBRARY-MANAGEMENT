import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {librarySchema} from "../../schemas/library.schema.js";
import {createLibrary} from"../../services/library.service.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";




function LibraryPage() {
  const {
    register, handleSubmit, formState: { errors }, } = useForm({
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

  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: createLibrary,
    onSuccess: (data) => {
      toast.success(data.message);
      navigate("/dashboard");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create library"
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
          label="Name"
          type="text"
          placeholder="Enter library name"
          error={errors.name?.message}
          {...register("name")}
        />
      


      
        <Input
                  label="Open Time"
                  type="time"
                  placeholder="Enter open time"
                  error={errors.openTime?.message}
                  {...register("openTime")}
                />
      

      
       <Input
                label="Close Time"
                 type="time"
                 placeholder="Enter close time"
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
      



      <Button
    type="submit"
    fullWidth
    loading={mutation.isPending}
>
    Create Library
</Button>
    
    </form>
    </div>
  );
}

export default LibraryPage