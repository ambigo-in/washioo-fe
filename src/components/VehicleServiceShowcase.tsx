import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { fetchServices } from "../api/servicesApi";
import type { ServiceCategory } from "../types/apiTypes";
import { getServicePriceLabel } from "../utils/servicePriceUtils";
import "../styles/VehicleServiceShowcase.css";

const fallbackServiceImage = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes("bike")) return "/p2.png";
  if (name.includes("car")) return "/p1.png";
  return "/p3.png";
};

const getCompactServiceDescription = (service: ServiceCategory) => {
  const fallback = service.service_name.toLowerCase().includes("bike")
    ? "Complete bike cleaning inside & out"
    : service.service_name.toLowerCase().includes("car")
      ? "Premium car wash for a showroom shine"
      : "Quality wash and detailing services.";

  const rawDescription = service.description?.trim();
  if (!rawDescription) return fallback;

  const cleanDescription = rawDescription.replace(/\s+/g, " ");

  if (cleanDescription.length <= 50) {
    return cleanDescription;
  }

  return `${cleanDescription.slice(0, 47).trim()}...`;
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
      <div className="vehicle-services-wrap">
        <div className="vehicle-services-heading">
          <span className="section-line" />
          <h2>Our Services</h2>
          <span className="section-line" />
        </div>

        {loading ? (
          <div className="services-loading">Loading services...</div>
        ) : error ? (
          <div className="services-error">{error}</div>
        ) : (
          <div className="services-card-row">
            {activeServices.map((service) => (
              <article key={service.id} className="service-card">
                <div className="service-card-copy">
                  <h3>{service.service_name}</h3>
                  <p className="service-card-description">
                    {getCompactServiceDescription(service)}
                  </p>
                  <div className="service-price-row">
                    <span className="service-price">
                      {getServicePriceLabel(service)}
                    </span>
                  </div>
                </div>

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

                <button
                  type="button"
                  onClick={handleBookClick}
                  className="service-arrow"
                  aria-label={`Book ${service.service_name}`}
                >
                  Book Now <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VehicleServicesShowcase;
