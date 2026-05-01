import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/BookNowSection.css";

const BookNowSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();

  const handleBookClick = () => {
    navigate(isAuthenticated && hasRole("customer") ? "/bookings" : "/verify-phone");
  };

  return (
    <>
      <div className="book-now">
        <h1>Book Your First Wash Today</h1>
        <button onClick={handleBookClick} className="primary-btn">
          Book Now
        </button>
      </div>
      <div className="footer">
        <p>Copyright 2026 Washioo. All rights reserved.</p>
      </div>
    </>
  );
};

export default BookNowSection;

