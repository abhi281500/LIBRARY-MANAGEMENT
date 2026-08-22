import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSeatById } from "../../services/seat.service.js";

function SeatDetailsPage() {
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["seat", id],
    queryFn: () => getSeatById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h2 className="text-lg font-semibold">
          Loading Seat...
        </h2>
      </div>
    );
  }

  if (isError) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-red-500">
        {error.response?.data?.message || "Seat not found"}
      </h2>

      <Link
        to="/seats"
        className="rounded bg-gray-800 px-4 py-2 text-white"
      >
        Back to Seats
      </Link>
    </div>
  );
}

  const seat = data.seat;

  if (!seat) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Seat not found.</p>
    </div>
  );
}

  
  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {seat.seatNumber}
          </h1>

          <Link
            to={`/seats/${seat._id}/edit`}
            className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
          >
            Edit
          </Link>
        </div>

        <div className="space-y-4">

          <div>
            <h3 className="font-semibold text-gray-600">
              Floor
            </h3>

            <p>{seat.floor}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">
              Type
            </h3>

            <p>{seat.type}</p>
          </div>

        

        
          

          <div>
            <h3 className="font-semibold text-gray-600">
              Status
            </h3>

            <span className="rounded bg-green-100 px-3 py-1 text-green-700">
              {seat.status}
            </span>
          </div>



        </div>

        <div className="mt-8">
          <Link
            to="/seats"
            className="rounded bg-gray-700 px-5 py-2 text-white hover:bg-gray-800"
          >
            ← Back
          </Link>
        </div>

      </div>

    </div>
  );
}

export default SeatDetailsPage;