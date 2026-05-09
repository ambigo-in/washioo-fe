import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";

const HomePage = lazy(() => import("./pages/HomePage"));
const TermsAndConditionsPage = lazy(
  () => import("./pages/TermsAndConditionsPage"),
);
const PhoneVerificationPage = lazy(
  () => import("./pages/PhoneVerificationPage"),
);
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const MyBookingsPage = lazy(() => import("./pages/MyBookingsPage"));

const CustomerDashboard = lazy(
  () => import("./pages/customer/CustomerDashboard"),
);
const CustomerAddresses = lazy(
  () => import("./pages/customer/CustomerAddresses"),
);
const CustomerBookingDetail = lazy(
  () => import("./pages/customer/CustomerBookingDetail"),
);
const CustomerProfile = lazy(() => import("./pages/customer/CustomerProfile"));
const CustomerVehicles = lazy(
  () => import("./pages/customer/CustomerVehicles"),
);

const CleanerDashboard = lazy(() => import("./pages/cleaner/CleanerDashboard"));
const CleanerAssignments = lazy(
  () => import("./pages/cleaner/CleanerAssignments"),
);
const CleanerAvailability = lazy(
  () => import("./pages/cleaner/CleanerAvailability"),
);
const CleanerHistory = lazy(() => import("./pages/cleaner/CleanerHistory"));
const CleanerProfile = lazy(() => import("./pages/cleaner/CleanerProfile"));
const CleanerBookingDetails = lazy(
  () => import("./pages/cleaner/CleanerBookingDetails"),
);

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminCleaners = lazy(() => import("./pages/admin/AdminCleaners"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminRatings = lazy(() => import("./pages/admin/AdminRatings"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="route-state">Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditionsPage />}
            />

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
            <Route path="/admin/login" element={<AdminLoginPage />} />
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
              path="/vehicles"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <CustomerVehicles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ratings"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminRatings />
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
            <Route
              path="/notifications"
              element={
                <ProtectedRoute roles={["customer", "cleaner", "admin"]}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
