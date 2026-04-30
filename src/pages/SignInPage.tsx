import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signIn } from "../api/authApi";
import { saveTokens } from "../utils/tokenManager";
import { useAuth } from "../context/AuthContext";
import "../styles/SignInPage.css";

export default function SignInPage() {
  const [otpCode, setOtpCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const phone = location.state?.phone || "";

  const handleSignIn = async () => {
    const response = await signIn({
      phone_number: phone,
      otp_code: otpCode,
    });

    saveTokens(response.access_token, response.refresh_token);
    login();
    navigate("/bookings");
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      <input value={phone} disabled />
      <input
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value)}
        placeholder="Enter OTP"
      />
      <button onClick={handleSignIn}>Login</button>
    </div>
  );
}
