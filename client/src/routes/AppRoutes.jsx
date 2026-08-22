import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import RegisterPage from "../pages/RegisterPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import ProtectedRoute from "../routes/ProctedRoute.jsx";
import PublicRoute from "../routes/PublicRoute.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";


import LibrariesPage from "../pages/Library/LibrariesPage.jsx";
import LibraryPage from "../pages/Library/LibraryPage.jsx";
import LibraryDetailsPage from "../pages/Library/LibraryDetailsPage.jsx";
import EditLibraryPage from "../pages/Library/EditLibraryPage.jsx";


import StudentPage from "../pages/Student/StudentPage.jsx";
import StudentDetailsPage from "../pages/Student/StudentDetailsPage.jsx";
import EditStudentPage from "../pages/Student/EditStudentPage.jsx";
import AllStudentsPage from "../pages/Student/AllStudentsPage.jsx";


import SeatPage from "../pages/Seat/SeatPage.jsx";
import AllSeatsPage from "../pages/Seat/AllSeatsPage.jsx";
import EditSeatPage from "../pages/Seat/EditSeatPage.jsx";
import SeatDetailsPage from "../pages/Seat/SeatDetailsPage.jsx";

import BookingPage from "../pages/Booking/BookingPage.jsx";
import AllBookingPage from "../pages/Booking/AllBookingPage.jsx";
import BookingDetailsPage from "../pages/Booking/BookingDetailsPage.jsx";
import EditBookingPage from "../pages/Booking/EditBookingPage.jsx";

import AllPaymentPage from "../pages/Payment/AllPaymentPage.jsx";
import PaymentDetailsPage from "../pages/Payment/PaymentDetailsPage.jsx";
import PaymentPage from "../pages/Payment/PaymentPage.jsx";
import EditPaymentPage from "../pages/Payment/EditPaymentPage.jsx";


import DashboardLayout from "../layouts/DashboardLayout.jsx";
function AppRoutes() {
  return (
    <Routes>

      {/* Root */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />
      </Route>

      {/* Protected Routes */}
      {/* Protected Routes */}
<Route element={<ProtectedRoute />}>
  
  {/* Dashboard Layout */}
  <Route element={<DashboardLayout />}>

    {/* Dashboard */}
    <Route
      path="/dashboard"
      element={<DashboardPage />}
    />

    {/* Library */}
    <Route
      path="/library/new"
      element={<LibraryPage />}
    />

    <Route
      path="/libraries"
      element={<LibrariesPage />}
    />

    <Route
      path="/libraries/:id"
      element={<LibraryDetailsPage />}
    />

    <Route
      path="/libraries/:id/edit"
      element={<EditLibraryPage />}
    />

    {/* Students */}
    <Route
      path="/students"
      element={<AllStudentsPage />}
    />

    <Route
      path="/students/new"
      element={<StudentPage />}
    />

    <Route
      path="/students/:id"
      element={<StudentDetailsPage />}
    />

    <Route
      path="/students/:id/edit"
      element={<EditStudentPage />}
    />

    {/* Seats */}
    <Route
      path="/seats"
      element={<AllSeatsPage />}
    />

    <Route
      path="/seats/new"
      element={<SeatPage />}
    />

    <Route
      path="/seats/:id"
      element={<SeatDetailsPage />}
    />

    <Route
      path="/seats/:id/edit"
      element={<EditSeatPage />}
    />

    {/* Bookings */}
    <Route
      path="/bookings"
      element={<AllBookingPage />}
    />

    <Route
      path="/bookings/new"
      element={<BookingPage />}
    />

    <Route
      path="/bookings/:id"
      element={<BookingDetailsPage />}
    />

    <Route
      path="/bookings/:id/edit"
      element={<EditBookingPage />}
    />

    {/* Payments */}
    <Route
      path="/payments"
      element={<AllPaymentPage />}
    />

    <Route
      path="/payments/new"
      element={<PaymentPage />}
    />

    <Route
      path="/payments/:id"
      element={<PaymentDetailsPage />}
    />

    <Route
      path="/payments/:id/edit"
      element={<EditPaymentPage />}
    />

  </Route>

</Route>


      



      {/* 404 */}
      <Route
        path="*"
        element={<NotFoundPage />}
      />

    </Routes>
  );
}

export default AppRoutes;