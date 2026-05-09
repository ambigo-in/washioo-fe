import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "../../components/ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { sendOtpRequest } from "../../store/slices/authSlice";
import type { AccountType } from "../../types/authTypes";
import {
  isValidIndianPhone,
  normalizeIndianPhone,
} from "../../utils/phoneUtils";
import "../../styles/PhoneVerificationPage.css";

export default function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const [phone, setPhone] = useState("");
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
        sendOtpRequest({
          phoneNumber,
          accountType: "admin" as AccountType,
        }),
      ).unwrap();
      navigate("/signin", {
        state: { phone: phoneNumber, accountType: "admin" as AccountType },
      });
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <main className="signin-page-wrapper">
      <form className="auth-container" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        <p className="signin-subtitle">
          Enter your registered admin phone number to receive an OTP.
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
