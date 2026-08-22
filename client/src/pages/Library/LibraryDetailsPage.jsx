import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLibraryById } from "../../services/library.service.js";

function LibraryDetailsPage() {
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["library", id],
    queryFn: () => getLibraryById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h2 className="text-lg font-semibold">
          Loading Library...
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


  const library = data?.library;

if (!library) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Library not found.</p>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {library.name}
          </h1>

          <Link
  to={`/libraries/${library._id}/edit`}
  className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
>
  Edit
</Link>
        </div>

        <div className="space-y-4">

          <div>
            <h3 className="font-semibold text-gray-600">
              Address
            </h3>

            <p>{library.address}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">
              Phone
            </h3>

            <p>{library.phone}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">
              Open Time
            </h3>

            <p>{library.openTime}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">
              Close Time
            </h3>

            <p>{library.closeTime}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">
              Total Seats
            </h3>

            <p>{library.totalSeats}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">
              Description
            </h3>

            <p>{library.description || "No description available"}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">
              Status
            </h3>

            <span className="rounded bg-green-100 px-3 py-1 text-green-700">
              {library.status}
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-gray-600">
              Subscription
            </h3>

            <span className="rounded bg-blue-100 px-3 py-1 text-blue-700">
              {library.subscription}
            </span>
          </div>

        </div>

        <div className="mt-8">
          <Link
            to="/libraries"
            className="rounded bg-gray-700 px-5 py-2 text-white hover:bg-gray-800"
          >
            ← Back
          </Link>
        </div>

      </div>

    </div>
  );
}

export default LibraryDetailsPage;