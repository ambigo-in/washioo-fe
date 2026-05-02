import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signUp, sendOtp } from "../api/authApi";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../context/useAuth";
import { saveTokens } from "../utils/tokenManager";
import type { AccountType } from "../types/authTypes";
import "../styles/SignUpPage.css";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const state = location.state as { phone?: string; accountType?: AccountType } | null;
  const phone = state?.phone || "";
  const accountType =
    state?.accountType === "cleaner" ? state.accountType : "customer";

  useEffect(() => {
    if (!phone) navigate("/verify-phone", { replace: true });
  }, [navigate, phone]);

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setError("Enter your full name.");
      return;
    }

    if (otpCode.trim().length < 4) {
      setError("Enter the OTP sent to your phone.");
      return;
    }

    if (accountType === "cleaner" && !aadhaarNumber.trim()) {
      setError("Aadhaar number is required for cleaner signup.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await signUp({
        full_name: fullName.trim(),
        phone_number: phone,
        email: email.trim() || undefined,
        otp_code: otpCode.trim(),
        aadhaar_number:
          accountType === "cleaner" ? aadhaarNumber.trim() : undefined,
        driving_license_number:
          accountType === "cleaner"
            ? drivingLicenseNumber.trim() || undefined
            : undefined,
      }, accountType);

      saveTokens(response.access_token, response.refresh_token);
      const user = await login();
      // Route based on user roles - priority: admin > cleaner > customer
      if (user?.roles.includes("admin")) {
        navigate("/admin/dashboard", { replace: true });
      } else if (user?.roles.includes("cleaner")) {
        navigate("/cleaner/dashboard", { replace: true });
      } else if (user?.roles.includes("customer")) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");

    try {
      await sendOtp(phone, accountType);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="signup-page-wrapper">
      <form className="auth-container" onSubmit={handleSignUp}>
        <h2>
          {accountType === "cleaner" ? "Create Cleaner Account" : "Create Account"}
        </h2>
        <p className="signup-subtitle">
          We need a few details before your first doorstep wash.
        </p>

        {error && <p className="signup-error">{error}</p>}

        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Full name"
          autoComplete="name"
        />
        <input value={phone} disabled aria-label="Phone number" />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address optional"
          autoComplete="email"
          type="email"
        />
        <input
          value={otpCode}
          onChange={(event) => setOtpCode(event.target.value)}
          placeholder="Enter OTP"
          autoComplete="one-time-code"
          inputMode="numeric"
        />
        {accountType === "cleaner" && (
          <>
            <input
              value={aadhaarNumber}
              onChange={(event) => setAadhaarNumber(event.target.value)}
              placeholder="Aadhaar number"
              inputMode="numeric"
              autoComplete="off"
            />
            <input
              value={drivingLicenseNumber}
              onChange={(event) => setDrivingLicenseNumber(event.target.value)}
              placeholder="Driving license optional"
              autoComplete="off"
            />
          </>
        )}
        <button disabled={loading} type="submit">
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="signup-footer-text">
          Need a fresh code?{" "}
          <button
            className="link-button"
            disabled={resending}
            onClick={handleResend}
            type="button"
          >
            {resending ? "Sending..." : "Resend OTP"}
          </button>
        </p>
      </form>
    </main>
  );
}
