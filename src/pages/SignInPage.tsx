import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingButton } from "../components/ui";
import { useAuth } from "../context/useAuth";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resendOtp, signInRequest } from "../store/slices/authSlice";
import type { AccountType } from "../types/authTypes";
import { formatIndianPhoneForDisplay } from "../utils/phoneUtils";
import "../styles/SignInPage.css";

export default function SignInPage() {
  const dispatch = useAppDispatch();
  const { loading, resendLoading } = useAppSelector((state) => state.auth);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const state = location.state as { phone?: string; accountType?: AccountType } | null;
  const phone = state?.phone || "";
const accountType = state?.accountType || "customer";

  const dashboardPath =
    accountType === "admin"
      ? "/admin/dashboard"
      : accountType === "cleaner"
        ? "/cleaner/dashboard"
        : "/dashboard";

  useEffect(() => {
    if (!phone) navigate("/verify-phone", { replace: true });
  }, [navigate, phone]);

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();

    if (otpCode.trim().length < 4) {
      setError("Enter the OTP sent to your phone.");
      return;
    }

    setError("");

    try {
      await dispatch(
        signInRequest({
          body: {
            phone_number: phone,
            otp_code: otpCode.trim(),
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
    <main className="signin-page-wrapper">
      <form className="auth-container" onSubmit={handleSignIn}>
        <h2>Welcome Back</h2>
        <p className="signin-subtitle">
          Enter the OTP sent to your phone to continue booking.
        </p>

        {error && <p className="signin-error">{error}</p>}

        <input
          value={formatIndianPhoneForDisplay(phone)}
          disabled
          aria-label="Phone number"
        />
        <input
          value={otpCode}
          onChange={(event) => setOtpCode(event.target.value)}
          placeholder="Enter OTP"
          autoComplete="one-time-code"
          inputMode="numeric"
        />
        <LoadingButton isLoading={loading} loadingText="Signing in..." type="submit">
          Login
        </LoadingButton>

        <p className="signin-footer-text">
          Did not receive it?{" "}
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
