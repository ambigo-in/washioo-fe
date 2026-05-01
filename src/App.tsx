import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* OTP Verification */}
          <Route
            path="/verify-phone"
            element={
              <PublicRoute>
                <PhoneVerificationPage />
              </PublicRoute>
            }
          />

          {/* Sign In */}
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <SignInPage />
              </PublicRoute>
            }
          />

          {/* Sign Up */}
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUpPage />
              </PublicRoute>
            }
          />

          {/* Service Selection Page */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute roles={["customer"]}>
                <BookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Checkout Page */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          {/* My Bookings Page */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute roles={["customer"]}>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

