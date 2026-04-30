import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/hero.css";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="hero-main">
      <div className="hero-content">
        <span className="hero-badge">Premium Doorstep Vehicle Care</span>

        <h2 className="hero-title">
          Instant Car & Bike Wash,
          <br />
          <span>Anytime. Anywhere.</span>
        </h2>

        <p className="hero-description">
          Book a professional wash in seconds. Fast, reliable, and doorstep
          ready. Experience premium cleaning service wherever you are.
        </p>

        <div className="hero-buttons">
          <button
            className="primary-btn"
            onClick={() => navigate("/verify-phone")}
          >
            Book Your Wash
          </button>
        </div>
      </div>
    </main>
  );
};

export default HeroSection;
