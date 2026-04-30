import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp } from "../api/authApi";
import "../styles/PhoneVerificationPage.css";

export default function PhoneVerificationPage() {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const response = await sendOtp(phone);

    if (response.user_exist) {
      navigate("/signin", { state: { phone } });
    } else {
      navigate("/signup", { state: { phone } });
    }
  };

  return (
    <div className="auth-container">
      <h2>Enter Mobile Number</h2>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+91XXXXXXXXXX"
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}