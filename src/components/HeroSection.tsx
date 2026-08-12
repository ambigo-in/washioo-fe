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

  return (
    <main className="hero-main">
      <div className="hero-inner">
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
            <button className="primary-btn" onClick={handleBook}>
              Book Your Wash
            </button>
          </div>
        </div>

        <div className="hero-media">
          <div className="promo-ribbon">
            <img src="/assets/promo-banner.svg" alt="promo banner" />
          </div>
          <div className="promo-image" role="img" aria-label="promo">
            <img src="/assets/hero-right.svg" alt="promo" />
          </div>
          <div className="hero-features">
            <div className="feature">
              <img src="/assets/icon-instant.svg" alt="instant" />
              <div>
                <strong>Instant Service</strong>
                <small>Book in seconds</small>
              </div>
            </div>
            <div className="feature">
              <img src="/assets/icon-trusted.svg" alt="trusted" />
              <div>
                <strong>Trusted Professionals</strong>
                <small>Verified experts</small>
              </div>
            </div>
            <div className="feature">
              <img src="/assets/icon-doorstep.svg" alt="doorstep" />
              <div>
                <strong>Doorstep Convenience</strong>
                <small>We come to you</small>
              </div>
            </div>
          </div>
          <div className="promo-cta">
            <button
              className="secondary-btn"
              onClick={() => navigate("/services")}
            >
              Book Oil Change Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HeroSection;
