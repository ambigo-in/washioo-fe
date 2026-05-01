import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import PhoneVerificationPage from "./pages/PhoneVerificationPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import BookingsPage from "./pages/BookingsPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyBookingsPage from "./pages/MyBookingsPage";

import { AuthProvider } from "./context/AuthContext";

import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";

// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";

// Cleaner Pages
import CleanerDashboard from "./pages/cleaner/CleanerDashboard";
import CleanerAssignments from "./pages/cleaner/CleanerAssignments";
import CleanerAvailability from "./pages/cleaner/CleanerAvailability";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminCleaners from "./pages/admin/AdminCleaners";
import AdminServices from "./pages/admin/AdminServices";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />

          {/* Auth Routes */}
          <Route
            path="/verify-phone"
            element={
              <PublicRoute>
                <PhoneVerificationPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <SignInPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUpPage />
              </PublicRoute>
            }
          />

          {/* Customer Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute roles={["customer"]}>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute roles={["customer"]}>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Cleaner Routes */}
          <Route
            path="/cleaner/dashboard"
            element={
              <ProtectedRoute roles={["cleaner"]}>
                <CleanerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cleaner/assignments"
            element={
              <ProtectedRoute roles={["cleaner"]}>
                <CleanerAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cleaner/availability"
            element={
              <ProtectedRoute roles={["cleaner"]}>
                <CleanerAvailability />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cleaners"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminCleaners />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminServices />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
