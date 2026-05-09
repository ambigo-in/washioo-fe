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
  const state = location.state as {
    accountType?: AccountType;
    authMode?: "signin" | "signup";
  } | null;
  const initialAccountType =
    state?.accountType === "cleaner" || state?.accountType === "admin"
      ? state.accountType
      : "customer";

  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] =
    useState<AccountType>(initialAccountType);
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
      const response = await dispatch(
        sendOtpRequest({ phoneNumber, accountType }),
      ).unwrap();

      const requestedAccountType = accountType;
      const hasRoleForRequestedType =
        response.roles?.includes(requestedAccountType);
      const hasExistingAccount =
        requestedAccountType === "admin"
          ? true
          : (hasRoleForRequestedType ?? response.user_exist);
      const nextPath =
        requestedAccountType === "admin" || hasExistingAccount
          ? "/signin"
          : "/signup";

      navigate(nextPath, {
        state: { phone: phoneNumber, accountType: requestedAccountType },
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
          Enter your mobile number to login or sign up for a Washioo account.
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
          }}
        >
          <option value="customer">Customer</option>
          <option value="cleaner">Cleaner</option>
          <option value="admin">Admin</option>
        </select>
        <LoadingButton
          isLoading={loading}
          loadingText="Sending OTP..."
          type="submit"
        >
          Continue
        </LoadingButton>
      </form>
    </main>
  );
}
