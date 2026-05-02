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
      <section className="book-now" aria-labelledby="book-now-title">
        <div className="book-now-content">
          <span className="book-now-label">Ready when you are</span>
          <h1 id="book-now-title">Book Your First Wash Today</h1>
          <p>
            Fast doorstep vehicle care with simple booking, transparent pricing,
            and a clean finish every time.
          </p>
        </div>

        <button onClick={handleBookClick} className="book-now-btn">
          Book Now
        </button>
      </section>
      {/* <footer className="footer">
        <p>Copyright 2026 Washioo. All rights reserved.</p>
      </footer> */}
    </>
  );
};

export default BookNowSection;

