import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingButton } from "../components/ui";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { sendOtpRequest } from "../store/slices/authSlice";
import type { AccountType } from "../types/authTypes";
import { isValidIndianPhone, normalizeIndianPhone } from "../utils/phoneUtils";
import "../styles/PhoneVerificationPage.css";

export default function PhoneVerificationPage() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
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
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const phoneNumber = normalizeIndianPhone(phone);

    if (!isValidIndianPhone(phoneNumber)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setError("");

    try {
      await dispatch(
        sendOtpRequest({ phoneNumber, accountType }),
      ).unwrap();
      navigate(authMode === "signup" && accountType !== "admin" ? "/signup" : "/signin", {
        state: { phone: phoneNumber, accountType, authMode },
      });
    } catch (err) {
      setError(String(err));
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
          placeholder="Enter 10-digit mobile number"
          autoComplete="tel"
          inputMode="tel"
          maxLength={14}
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
        <LoadingButton isLoading={loading} loadingText="Sending OTP..." type="submit">
          Continue
        </LoadingButton>
      </form>
    </main>
  );
}

