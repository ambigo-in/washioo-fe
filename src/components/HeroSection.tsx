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
        ? "/bookings/oil-change"
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
        <img
          src="banner2.jpg"
          alt="Free mechanic for oil change"
          className="hero-promo-image"
        />

        {/* Overlay Content */}
        <div className="hero-promo-content">
          <div className="hero-promo-badge">
            <span className="hero-promo-badge-top">✨ FESTIVE OFFER ✨</span>
            <p className="hero-promo-badge-main">
              FREE MECHANIC <br /> <span>FOR OIL CHANGE</span>
            </p>
          </div>

          <div className="promo-bottom-container">
            <ul className="hero-promo-features">
              <li>
                <span className="hero-promo-feature-icon">💧</span>
                <span>
                  Premium
                  <br />
                  Oil Brands
                </span>
              </li>
              <li>
                <span className="hero-promo-feature-icon">🔧</span>
                <span>
                  Free Oil
                  <br />
                  Change
                </span>
              </li>
              <li>
                <span className="hero-promo-feature-icon">👨‍🔧</span>
                <span>
                  Expert
                  <br />
                  Mechanic
                </span>
              </li>
              <li>
                <span className="hero-promo-feature-icon">🏠</span>
                <span>
                  Doorstep
                  <br />
                  Service
                </span>
              </li>
            </ul>

            <div className="hero-promo-cta">
              <button className="promo-btn" onClick={handleOilChange}>
                Book Oil Change Now →
              </button>
              <p className="hero-promo-subtext">
                Limited Time Offer – Book Now!
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HeroSection;
