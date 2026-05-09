import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  loadAddresses,
  loadCustomerBookings,
} from "../../store/slices/customerSlice";
import { loadServices } from "../../store/slices/servicesSlice";
import { useLanguage } from "../../i18n/LanguageContext";
import "./CustomerDashboard.css";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { bookings, addresses, loading: customerLoading } = useAppSelector(
    (state) => state.customer,
  );
  const { items: services, loading: servicesLoading } = useAppSelector(
    (state) => state.services,
  );
  const loading = customerLoading || servicesLoading;
  const serviceImages = ["/p2.png", "/p1.png"];

  useEffect(() => {
    dispatch(loadCustomerBookings());
    dispatch(loadServices());
    dispatch(loadAddresses());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "var(--brand-teal)",
      assigned: "var(--brand-teal)",
      accepted: "var(--brand-teal-dark)",
      in_progress: "var(--brand-teal)",
      completed: "var(--brand-teal)",
      cancelled: "#dc3545",
    };
    return colors[status] || "var(--brand-text-muted)";
  };

  const recentBookings = bookings.slice(0, 3);
  const activeServices = services.filter((s) => s.is_active);

  const handleBookNow = (service: (typeof activeServices)[number]) => {
    navigate("/checkout", {
      state: {
        serviceId: service.id,
        serviceName: service.service_name,
        price: service.base_price,
        duration: service.estimated_duration_minutes,
      },
    });
  };

  if (loading) {
    return (
      <DashboardLayout title={t("common.dashboard")}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t("customer.loadingDashboard")}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("common.dashboard")}>
      <div className="customer-dashboard">
        <section className="quick-actions">
          <h2>{t("customer.quickActions")}</h2>
          <div className="action-cards">
            <Link to="/bookings" className="action-card primary">
              <div className="action-icon">▣</div>
              <div className="action-content">
                <h3>{t("customer.bookService")}</h3>
                <p>{t("customer.bookServiceHint")}</p>
              </div>
            </Link>
            <Link to="/my-bookings" className="action-card">
              <div className="action-icon">≡</div>
              <div className="action-content">
                <h3>{t("actions.viewBookings")}</h3>
                <p>{t("customer.viewBookingsHint")}</p>
              </div>
            </Link>
            <Link to="/addresses" className="action-card">
              <div className="action-icon">⌖</div>
              <div className="action-content">
                <h3>{t("actions.manageAddresses")}</h3>
                <p>{t("customer.manageAddressesHint")}</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="stats-overview">
          <h2>{t("customer.overview")}</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{bookings.length}</div>
              <div className="stat-label">{t("customer.bookingsTotal")}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {bookings.filter((b) => b.booking_status === "pending").length}
              </div>
              <div className="stat-label">{t("customer.pending")}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {
                  bookings.filter((b) => b.booking_status === "completed")
                    .length
                }
              </div>
              <div className="stat-label">{t("customer.completed")}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{addresses.length}</div>
              <div className="stat-label">{t("customer.savedAddresses")}</div>
            </div>
          </div>
        </section>

        <section className="available-services">
          <h2>{t("customer.availableServices")}</h2>
          <div className="customer-services-grid">
            {activeServices.map((service, index) => (
              <div key={service.id} className="customer-service-card">
                <img
                  src={serviceImages[index % serviceImages.length]}
                  alt={service.service_name}
                  className="customer-service-image"
                />
                <h3>{service.service_name}</h3>
                <p>{service.description}</p>
                <div className="service-footer">
                  <span className="price">₹{service.base_price}</span>
                  <span className="duration">
                    {service.estimated_duration_minutes} min
                  </span>
                </div>
                <button
                  className="customer-book-service-btn"
                  onClick={() => handleBookNow(service)}
                  type="button"
                >
                  {t("customer.bookNow")}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="recent-bookings">
          <div className="section-header">
            <h2>{t("customer.recentBookings")}</h2>
            <Link to="/my-bookings" className="view-all">
              {t("actions.viewAll")} →
            </Link>
          </div>
          {recentBookings.length > 0 ? (
            <div className="bookings-list">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-info">
                    <h4>{booking.service_name}</h4>
                    <p className="booking-ref">{booking.booking_reference}</p>
                    <p className="booking-date">
                      {new Date(booking.scheduled_date).toLocaleDateString()} at{" "}
                      {booking.scheduled_time.slice(0, 5)}
                    </p>
                  </div>
                  <div className="booking-status">
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(booking.booking_status),
                      }}
                    >
                      {booking.booking_status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>{t("customer.noBookings")}</p>
              <Link to="/bookings" className="btn-primary">
                {t("customer.firstBooking")}
              </Link>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
