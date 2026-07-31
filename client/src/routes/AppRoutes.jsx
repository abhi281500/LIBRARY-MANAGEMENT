import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import ProtectedRoute from "../routes/ProctedRoute.jsx";
import PublicRoute from "../routes/PublicRoute.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";

function AppRoutes() {
  return (
    <Routes>
  <Route path="/" element={<Navigate to="/login" replace />} />

  <Route element={<PublicRoute />}>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
  </Route>

  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardPage />} />
  </Route>

  <Route path="*" element={<NotFoundPage />} />
</Routes>
  );
}

export default AppRoutes;