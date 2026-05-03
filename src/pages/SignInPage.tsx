import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signIn, sendOtp } from "../api/authApi";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../context/useAuth";
import { saveTokens } from "../utils/tokenManager";
import type { AccountType } from "../types/authTypes";
import { formatIndianPhoneForDisplay } from "../utils/phoneUtils";
import "../styles/SignInPage.css";

export default function SignInPage() {
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const state = location.state as { phone?: string; accountType?: AccountType } | null;
  const phone = state?.phone || "";
  const accountType = state?.accountType || "customer";

  useEffect(() => {
    if (!phone) navigate("/verify-phone", { replace: true });
  }, [navigate, phone]);

  const routeAfterLogin = async () => {
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
  };

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();

    if (otpCode.trim().length < 4) {
      setError("Enter the OTP sent to your phone.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await signIn({
        phone_number: phone,
        otp_code: otpCode.trim(),
      }, accountType);

      saveTokens(response.access_token, response.refresh_token);
      await routeAfterLogin();
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
        <button disabled={loading} type="submit">
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="signin-footer-text">
          Did not receive it?{" "}
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
