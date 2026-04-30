import React from "react";
import "../styles/VehicleServiceShowcase.css";
import { useNavigate } from "react-router-dom";

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

  const handleLogoClick = () => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (accessToken && refreshToken) {
      navigate("/bookings");
    } else {
      navigate("/verify-phone");
    }
  };

  return (
    <section className="vehicle-services-section">
      <div className="vehicle-services-overlay">
        <div className="vehicle-services-header">
          <div>
            <p className="section-label">SERVICES</p>
            <h2>What Can We Do For Your Vehicle?</h2>
          </div>

          <button onClick={handleLogoClick} className="view-all-btn">
            View All <span>→</span>
          </button>
        </div>

        <div className="services-card-row">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.15)), url(${service.image})`,
              }}
            >
              <div className="service-card-content">
                <h3>{service.title}</h3>
                <button onClick={handleLogoClick} className="service-arrow">
                  →
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