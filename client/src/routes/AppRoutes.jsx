import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<h1>Home</h1>} />
      <Route path="/login" element={
        <LoginPage/>
      } />
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default AppRoutes;
