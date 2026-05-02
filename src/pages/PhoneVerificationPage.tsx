import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendOtp } from "../api/authApi";
import { getApiErrorMessage } from "../api/client";
import type { AccountType } from "../types/authTypes";
import "../styles/PhoneVerificationPage.css";

const normalizePhone = (value: string) => value.replace(/\s+/g, "");

export default function PhoneVerificationPage() {
  const location = useLocation();
  const state = location.state as
    | { accountType?: AccountType; authMode?: "signin" | "signup" }
    | null;
  const initialAccountType =
    state?.accountType === "cleaner" || state?.accountType === "admin"
      ? state.accountType
      : "customer";
  const initialAuthMode =
    state?.authMode === "signup" && initialAccountType !== "admin"
      ? "signup"
      : "signin";

  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] =
    useState<AccountType>(initialAccountType);
  const [authMode, setAuthMode] =
    useState<"signin" | "signup">(initialAuthMode);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const phoneNumber = normalizePhone(phone);

    if (!phoneNumber.startsWith("+") || phoneNumber.length < 10) {
      setError("Enter a valid phone number with country code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendOtp(phoneNumber, accountType);
      navigate(authMode === "signup" && accountType !== "admin" ? "/signup" : "/signin", {
        state: { phone: phoneNumber, accountType, authMode },
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signin-page-wrapper">
      <form className="auth-container" onSubmit={handleSubmit}>
        <h2>Verify Your Phone</h2>
        <p className="signin-subtitle">
          Enter your mobile number and we will send a one-time password.
        </p>

        {error && <p className="signin-error">{error}</p>}

        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+91XXXXXXXXXX"
          autoComplete="tel"
          inputMode="tel"
        />
        <select
          value={accountType}
          onChange={(event) => {
            const nextType = event.target.value as AccountType;
            setAccountType(nextType);
            if (nextType === "admin") setAuthMode("signin");
          }}
        >
          <option value="customer">Customer</option>
          <option value="cleaner">Cleaner</option>
          <option value="admin">Admin</option>
        </select>
        {accountType !== "admin" && (
          <select
            value={authMode}
            onChange={(event) =>
              setAuthMode(event.target.value as "signin" | "signup")
            }
          >
            <option value="signin">Sign in</option>
            <option value="signup">Create account</option>
          </select>
        )}
        <button disabled={loading} type="submit">
          {loading ? "Sending OTP..." : "Continue"}
        </button>
      </form>
    </main>
  );
}

