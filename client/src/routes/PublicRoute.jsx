import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import Loader from "../components/feedback/Loader.jsx";

function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Outlet />
  );
}

export default PublicRoute;