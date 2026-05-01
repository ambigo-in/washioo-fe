import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/VehicleServiceShowcase.css";

const services = [
  {
    title: "Car Wash",
    image: "/p1.png",
  },
  {
    title: "Bike Wash",
    image: "/p2.png",
  },
];

const VehicleServicesShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();

  const handleBookClick = () => {
    navigate(isAuthenticated && hasRole("customer") ? "/bookings" : "/verify-phone");
  };

  return (
    <section className="vehicle-services-section">
      <div className="vehicle-services-overlay">
        <div className="vehicle-services-header">
          <div>
            <p className="section-label">SERVICES</p>
            <h2>What Can We Do For Your Vehicle?</h2>
          </div>

          <button onClick={handleBookClick} className="view-all-btn">
            View All
          </button>
        </div>

        <div className="services-card-row">
          {services.map((service) => (
            <div
              key={service.title}
              className="service-card"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.15)), url(${service.image})`,
              }}
            >
              <div className="service-card-content">
                <h3>{service.title}</h3>
                <button onClick={handleBookClick} className="service-arrow">
                  Book
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VehicleServicesShowcase;
