import { Routes, Route } from "react-router-dom";

import LoginPage from "../pages/LoginPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<h1>Home</h1>} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
      </Route>

      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default AppRoutes;