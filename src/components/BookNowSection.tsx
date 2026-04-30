import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BookNowSection.css";

const BookNowSection: React.FC = () => {

        const navigate = useNavigate();
        const handleLogoClick = () => {
          const accessToken = localStorage.getItem("access_token");
          const refreshToken = localStorage.getItem("refresh_token");

          if (accessToken && refreshToken) {
            navigate("/bookings");
          } else {
            navigate("/verify-phone");
          }
        };
        
  return (
    <>
      <div className="book-now">
        <h1> Book Your First Wash Today</h1>
        <button onClick={handleLogoClick} className="primary-btn">
          Book Now
        </button>
      </div>
      <div className="footer">
        <p>© 2026 Washioo. All rights reserved.</p>
      </div>
    </>
  );
};

export default BookNowSection;