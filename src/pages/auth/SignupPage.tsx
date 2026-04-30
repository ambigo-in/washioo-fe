import { useState } from "react";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    otp_code: "",
    role: "customer",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const sendOTP = async () => {
    try {
      await authApi.sendOTP(form.phone_number);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "OTP failed");
    }
  };
  const signup = async () => {
    try {
      const res = await authApi.signup(form);
      login(res);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };
  return (
    <div className="max-w-lg mx-auto mt-16 bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Signup</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <input
        placeholder="Full Name"
        className="w-full p-3 border rounded mb-3"
        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
      />

      <input
        placeholder="Email"
        className="w-full p-3 border rounded mb-3"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        placeholder="Phone Number"
        className="w-full p-3 border rounded mb-3"
        onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
      />

      <select
        className="w-full p-3 border rounded mb-3"
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="customer">Customer</option>
        <option value="cleaner">Cleaner</option>
      </select>

      {!otpSent ? (
        <button
          onClick={sendOTP}
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          Send OTP
        </button>
      ) : (
        <>
          <input
            placeholder="OTP Code"
            className="w-full p-3 border rounded mb-3"
            onChange={(e) => setForm({ ...form, otp_code: e.target.value })}
          />
          <button
            onClick={signup}
            className="w-full bg-green-600 text-white py-3 rounded"
          >
            Complete Signup
          </button>
        </>
      )}
    </div>
  );
};

export default SignupPage;