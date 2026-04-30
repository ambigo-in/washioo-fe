import { useState } from "react";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";


const LoginPage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSendOTP = async () => {
    try {
      await authApi.sendOTP(phone);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send OTP");
    }
  };
  const handleSignin = async () => {
    try {
      const res = await authApi.signin({
        phone_number: phone,
        otp_code: otp,
      });

      login(res);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <input
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />
      {!otpSent ? (
        <button
          onClick={handleSendOTP}
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          Send OTP
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />
          <button
            onClick={handleSignin}
            className="w-full bg-green-600 text-white py-3 rounded"
          >
            Sign In
          </button>
        </>
      )}
    </div>
  );
};

export default LoginPage;