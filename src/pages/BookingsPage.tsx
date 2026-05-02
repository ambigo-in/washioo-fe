import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import type { ServiceCategory } from "../types/apiTypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loadServices } from "../store/slices/servicesSlice";
import "../styles/BookNowSection.css";

type DisplayService = ServiceCategory & { image: string };

const serviceImageFor = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes("bike")) return "/p2.png";
  if (name.includes("car")) return "/p1.png";
  return "/p3.png";
};

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.services);
  const services: DisplayService[] = items.map((service) => ({
    ...service,
    image: serviceImageFor(service.service_name),
  }));

  React.useEffect(() => {
    dispatch(loadServices());
  }, [dispatch]);

  const handleBookNow = (service: DisplayService) => {
    navigate("/checkout", {
      state: {
        serviceId: service.id,
        serviceName: service.service_name,
        price: service.base_price,
        duration: service.estimated_duration_minutes,
      },
    });
  };

  return (
    <>
      <Header />

      <section className="bookings-page">
        <div className="bookings-header">
          <span>PREMIUM SERVICES</span>
          <h1>Select Your Vehicle Wash Service</h1>
          <p>
            Choose a professional doorstep wash, pick your address and time, and
            track the booking from pending to completion.
          </p>
        </div>

        {loading ? (
          <div className="loading-state">Loading services...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : services.length === 0 ? (
          <div className="empty-state">No active services are available.</div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <article key={service.id} className="service-booking-card">
                <div className="service-image-wrapper">
                  <img
                    src={service.image}
                    alt={service.service_name}
                    className="service-image"
                  />
                </div>

                <div className="service-details">
                  <h2>{service.service_name}</h2>
                  <p>{service.description || "Premium doorstep wash service."}</p>

                  <div className="service-meta">
                    <span>Rs. {service.base_price}</span>
                    <span>
                      {service.estimated_duration_minutes || 0} mins
                    </span>
                  </div>

                  <button
                    className="book-service-btn"
                    onClick={() => handleBookNow(service)}
                    type="button"
                  >
                    Book Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default BookingsPage;

