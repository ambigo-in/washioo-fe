import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { fetchServices } from "../api/servicesApi";
import type { ServiceCategory } from "../types/apiTypes";
import {
  getServicePriceLabel,
  getServiceExtraPaymentNote,
} from "../utils/servicePriceUtils";
import "../styles/VehicleServiceShowcase.css";

const fallbackServiceImage = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes("bike")) return "/p2.png";
  if (name.includes("car")) return "/p1.png";
  return "/p3.png";
};

const VehicleServicesShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeServices = useMemo(
    () => services.filter((service) => service.is_active),
    [services],
  );

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetchServices();
        setServices(response.services);
      } catch {
        setError("Unable to load services right now.");
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const handleBookClick = () => {
    navigate(
      isAuthenticated && hasRole("customer") ? "/bookings" : "/verify-phone",
    );
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

        {loading ? (
          <div className="services-loading">Loading services...</div>
        ) : error ? (
          <div className="services-error">{error}</div>
        ) : (
          <div className="services-card-row">
            {activeServices.map((service) => (
              <article key={service.id} className="service-card">
                <div className="service-card-media">
                  <img
                    src={
                      service.image_url ||
                      fallbackServiceImage(service.service_name)
                    }
                    alt={service.service_name}
                    onError={(event) => {
                      event.currentTarget.src = fallbackServiceImage(
                        service.service_name,
                      );
                    }}
                  />
                </div>
                <div className="service-card-content">
                  <div>
                    <span>Premium doorstep care</span>
                    <h3>{service.service_name}</h3>
                    <div className="service-price-row">
                      <span className="service-price">
                        {getServicePriceLabel(service)}
                      </span>
                    </div>
                    <p>
                      {service.description ||
                        "Quality wash and detailing services."}
                    </p>
                    {service.allow_extra_payment && (
                      <p className="service-extra-note">
                        {getServiceExtraPaymentNote(service)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleBookClick}
                    className="service-arrow"
                    aria-label={`Book ${service.service_name}`}
                  >
                    Book
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VehicleServicesShowcase;
