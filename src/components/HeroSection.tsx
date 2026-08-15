import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/hero.css";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();

  const handleBook = () => {
    navigate(
      isAuthenticated && hasRole("customer") ? "/bookings" : "/verify-phone",
    );
  };

  const handleOilChange = () => {
    navigate(
      isAuthenticated && hasRole("customer")
        ? "bookings"
        : "/verify-phone",
    );
  };

  return (
    <main className="hero-main">
      {/* LEFT SIDE: Content */}
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-icon">✨</span> NEW SERVICE LAUNCHED!
        </div>

        <h2 className="hero-title">
          Instant Car &amp; Bike Wash
          <br />
          <span>Anytime. Anywhere.</span>
        </h2>

        <div className="hero-features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">⏱️</div>
            <span className="feature-text">
              Instant
              <br />
              Service
            </span>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">🛡️</div>
            <span className="feature-text">
              Trusted
              <br />
              Professionals
            </span>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">🚪</div>
            <span className="feature-text">
              Doorstep
              <br />
              Convenience
            </span>
          </div>
        </div>

        <div className="hero-buttons">
          <button className="primary-btn" onClick={handleBook}>
            ✨ Book Your Wash Now
          </button>
        </div>

        <p className="hero-trust-line">
          <span className="trust-item">🛡️ 100% Safe</span>
          <span className="trust-dot">•</span>
          <span className="trust-item">✔️ Verified Experts</span>
          <span className="trust-dot">•</span>
          <span className="trust-item">⭐ Satisfaction Guaranteed</span>
        </p>
      </div>

      {/* RIGHT SIDE: Promo Area */}
      <div className="hero-promo">
        {/* Background Image securely filling the space */}
           <div className="promo-bottom-container">
            <div className="hero-promo-cta">
              <button className="promo-btn" onClick={handleOilChange}>
                Book Oil Change Now →
              </button>
              <p className="hero-promo-subtext">
                Limited Time Offer – Book Now!
              </p>
            </div>
          </div>
        <img
          src="banner.png"
          alt="Free mechanic for oil change"
          className="hero-promo-image"
        />
        {/* </div> */}
      </div>
    </main>
  );
};

export default HeroSection;
