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
          <h1 id="book-now-title">Book Your First Wash</h1>
          <p className="book-now-description">
            Fast doorstep vehicle care with simple booking and transparent
            pricing
          </p>
          {startingPrice != null && (
            <p className="starting-price">
              Starting from <strong>{formatCurrency(startingPrice)}</strong>
            </p>
          )}
        </div>

        <button onClick={handleBookClick} className="book-now-btn">
          Book Now
        </button>
      </section>
    </>
  );
};

export default BookNowSection;
