import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signUp } from "../api/authApi";
import { saveTokens } from "../utils/tokenManager";
import { useAuth } from "../context/AuthContext";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const phone = location.state?.phone || "";

  const handleSignUp = async () => {
    const response = await signUp({
      full_name: fullName,
      phone_number: phone,
      email,
      otp_code: otpCode,
      role: "customer",
    });

    saveTokens(response.access_token, response.refresh_token);
    login();
    navigate("/bookings");
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full Name"
      />
      <input value={phone} disabled />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value)}
        placeholder="Enter OTP"
      />
      <button onClick={handleSignUp}>Create Account</button>
    </div>
  );
}
    