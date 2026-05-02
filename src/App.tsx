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
import CustomerAddresses from "./pages/customer/CustomerAddresses";
import CustomerBookingDetail from "./pages/customer/CustomerBookingDetail";
import CustomerProfile from "./pages/customer/CustomerProfile";

// Cleaner Pages
import CleanerDashboard from "./pages/cleaner/CleanerDashboard";
import CleanerAssignments from "./pages/cleaner/CleanerAssignments";
import CleanerAvailability from "./pages/cleaner/CleanerAvailability";
import CleanerHistory from "./pages/cleaner/CleanerHistory";
import CleanerProfile from "./pages/cleaner/CleanerProfile";
import CleanerBookingDetails from "./pages/cleaner/CleanerBookingDetails";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCleaners from "./pages/admin/AdminCleaners";
import AdminServices from "./pages/admin/AdminServices";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";

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
          <Route
            path="/customer/bookings/:bookingId"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerBookingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addresses"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerAddresses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerProfile />
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
            path="/cleaner/bookings/:bookingId"
            element={
              <ProtectedRoute roles={["cleaner"]}>
                <CleanerBookingDetails />
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
          <Route
            path="/cleaner/history"
            element={
              <ProtectedRoute roles={["cleaner"]}>
                <CleanerHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cleaner/profile"
            element={
              <ProtectedRoute roles={["cleaner"]}>
                <CleanerProfile />
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
            path="/admin/payments"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminPayments />
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
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminSettings />
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
