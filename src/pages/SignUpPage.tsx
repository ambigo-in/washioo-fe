import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingButton } from "../components/ui";
import { useAuth } from "../context/useAuth";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resendOtp, signUpRequest } from "../store/slices/authSlice";
import type { AccountType } from "../types/authTypes";
import { formatIndianPhoneForDisplay } from "../utils/phoneUtils";
import "../styles/SignUpPage.css";

export default function SignUpPage() {
  const dispatch = useAppDispatch();
  const { loading, resendLoading } = useAppSelector((state) => state.auth);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const state = location.state as { phone?: string; accountType?: AccountType } | null;
  const phone = state?.phone || "";
  const accountType =
    state?.accountType === "cleaner" ? state.accountType : "customer";
  const dashboardPath =
    accountType === "cleaner" ? "/cleaner/dashboard" : "/dashboard";

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

    if (
      accountType === "cleaner" &&
      !/^\d{12}$/.test(aadhaarNumber.replace(/\D/g, ""))
    ) {
      setError("Enter a valid 12-digit Aadhaar number.");
      return;
    }

    setError("");

    try {
      await dispatch(
        signUpRequest({
          body: {
            full_name: fullName.trim(),
            phone_number: phone,
            email: email.trim() || undefined,
            otp_code: otpCode.trim(),
            aadhaar_number:
              accountType === "cleaner"
                ? aadhaarNumber.replace(/\D/g, "")
                : undefined,
            driving_license_number:
              accountType === "cleaner"
                ? drivingLicenseNumber.trim() || undefined
                : undefined,
          },
          accountType,
        }),
      ).unwrap();
      await login();
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      setError(String(err));
    }
  };

  const handleResend = async () => {
    setError("");

    try {
      await dispatch(resendOtp({ phoneNumber: phone, accountType })).unwrap();
    } catch (err) {
      setError(String(err));
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
        <input
          value={formatIndianPhoneForDisplay(phone)}
          disabled
          aria-label="Phone number"
        />
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
        <LoadingButton isLoading={loading} loadingText="Sending OTP..." type="submit">
          Create Account
        </LoadingButton>

        <p className="signup-footer-text">
          Need a fresh code?{" "}
          <LoadingButton
            className="link-button"
            isLoading={resendLoading}
            loadingText="Resending..."
            onClick={handleResend}
            type="button"
          >
            Resend OTP
          </LoadingButton>
        </p>
      </form>
    </main>
  );
}
