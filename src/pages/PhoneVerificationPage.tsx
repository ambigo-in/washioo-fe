import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp } from "../api/authApi";
import { getApiErrorMessage } from "../api/client";
import "../styles/PhoneVerificationPage.css";

const normalizePhone = (value: string) => value.replace(/\s+/g, "");

export default function PhoneVerificationPage() {
  const [phone, setPhone] = useState("");
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
      const response = await sendOtp(phoneNumber);
      navigate(response.user_exist ? "/signin" : "/signup", {
        state: { phone: phoneNumber, userExists: response.user_exist },
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
        <button disabled={loading} type="submit">
          {loading ? "Sending OTP..." : "Continue"}
        </button>
      </form>
    </main>
  );
}

