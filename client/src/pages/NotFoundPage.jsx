import { Link } from "react-router-dom";
import { ArrowLeft, Home, SearchX } from "lucide-react";

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
        <div className="w-full text-center">

          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <SearchX className="h-10 w-10 text-blue-600" />
          </div>

          {/* Error Code */}
          <p className="text-7xl font-extrabold tracking-tight text-gray-900">
            404
          </p>

          {/* Heading */}
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Page not found
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-gray-600">
            Sorry, we couldn't find the page you're looking for.
            The page may have been moved, deleted, or the URL may be incorrect.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>

          </div>

          {/* Help text */}
          <p className="mt-8 text-sm text-gray-500">
            If you think this is a mistake, please check the URL and try again.
          </p>

        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;