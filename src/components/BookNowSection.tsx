import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useEffect, useState } from "react";
import { fetchServices } from "../api/servicesApi";
import { formatCurrency } from "../utils/servicePriceUtils";
import "../styles/BookNowSection.css";

const BookNowSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();

  const handleBookClick = () => {
    navigate(
      isAuthenticated && hasRole("customer") ? "/bookings" : "/verify-phone",
    );
  };

  const [startingPrice, setStartingPrice] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchServices();
        const active = res.services.filter((s) => s.is_active);
        if (!mounted) return;
        if (active.length === 0) {
          setStartingPrice(null);
          return;
        }
        const min = Math.min(...active.map((s) => s.base_price));
        setStartingPrice(min);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
          {startingPrice != null && (
            <p className="starting-price">
              Starting at {formatCurrency(startingPrice)}
            </p>
          )}
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
