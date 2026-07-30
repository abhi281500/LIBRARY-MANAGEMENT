import { Navigate, Outlet } from "react-router-dom";
import { useAuth, } from "../hooks/useAuth.jsx";
import Loader from "../components/feedback/Loader.jsx";

function ProtectedRoute() {
  
  const { isAuthenticated,loading } = useAuth();

  if(loading)
  {
    return <Loader/>
  }
  

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;