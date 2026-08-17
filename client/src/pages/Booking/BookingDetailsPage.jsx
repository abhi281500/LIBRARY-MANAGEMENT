import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBookingById } from "../../services/booking.service.js";

function BookingPageDetails() {
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBookingById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h2 className="text-lg font-semibold">
          Loading Booking...
        </h2>
      </div>
    );
  }

  if (isError) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-red-500">
        {error.response?.data?.message || "Library not found"}
      </h2>

      <Link
        to="/libraries"
        className="rounded bg-gray-800 px-4 py-2 text-white"
      >
        Back to Libraries
      </Link>
    </div>
  );
}

  const booking = data.booking;
if (!booking) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Booking not found.</p>
    </div>
  );
}
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {booking.studentId}
          </h1>

          <Link
            to={`/bookings/${booking._id}/edit`}
            className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
          >
            Edit
          </Link>
        </div>

        <div className="space-y-4">

          <div>
            <h3 className="font-semibold text-gray-600">
              seatId
            </h3>

            <p>{booking.seatId}</p>
          </div>

           <div>
            <h3 className="font-semibold text-gray-600">
              Amount
            </h3>

            <p>{booking.amount}</p>
          </div>



          <div>
            <h3 className="font-semibold text-gray-600">
              Start Date
            </h3>

            <p>{booking.startDate}</p>
          </div>

        
          <div>
            <h3 className="font-semibold text-gray-600">
              End Date
            </h3>

            <p>{booking.endDate}</p>
          </div>




        </div>

        <div className="mt-8">
          <Link
            to="/bookings"
            className="rounded bg-gray-700 px-5 py-2 text-white hover:bg-gray-800"
          >
            ← Back
          </Link>
        </div>

      </div>

    </div>
  );
}

export default BookingPageDetails;