import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBookings } from "../../api/bookingApi";
import { fetchAddresses } from "../../api/addressApi";
import { fetchServices } from "../../api/servicesApi";
import type {
  CustomerBooking,
  ServiceCategory,
  Address,
} from "../../types/apiTypes";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import "./CustomerDashboard.css";

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, servicesRes, addressesRes] = await Promise.all([
          fetchBookings(),
          fetchServices(),
          fetchAddresses(),
        ]);
        setBookings(bookingsRes.bookings);
        setServices(servicesRes.services);
        setAddresses(addressesRes.addresses);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#ffc107",
      assigned: "#17a2b8",
      accepted: "#6f42c1",
      in_progress: "#007bff",
      completed: "#28a745",
      cancelled: "#dc3545",
    };
    return colors[status] || "#6c757d";
  };

  const recentBookings = bookings.slice(0, 3);
  const activeServices = services.filter((s) => s.is_active);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="customer-dashboard">
        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-cards">
            <Link to="/bookings" className="action-card primary">
              <div className="action-icon">🚗</div>
              <div className="action-content">
                <h3>Book a Service</h3>
                <p>Schedule your car or bike wash</p>
              </div>
            </Link>
            <Link to="/my-bookings" className="action-card">
              <div className="action-icon">📋</div>
              <div className="action-content">
                <h3>View Bookings</h3>
                <p>Track your current bookings</p>
              </div>
            </Link>
            <Link to="/addresses" className="action-card">
              <div className="action-icon">📍</div>
              <div className="action-content">
                <h3>Manage Addresses</h3>
                <p>Add or edit locations</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="stats-overview">
          <h2>Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{bookings.length}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {bookings.filter((b) => b.booking_status === "pending").length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {
                  bookings.filter((b) => b.booking_status === "completed")
                    .length
                }
              </div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{addresses.length}</div>
              <div className="stat-label">Saved Addresses</div>
            </div>
          </div>
        </section>

        {/* Available Services */}
        <section className="available-services">
          <h2>Available Services</h2>
          <div className="services-grid">
            {activeServices.map((service) => (
              <div key={service.id} className="service-card">
                <h3>{service.service_name}</h3>
                <p>{service.description}</p>
                <div className="service-footer">
                  <span className="price">₹{service.base_price}</span>
                  <span className="duration">
                    {service.estimated_duration_minutes} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Bookings */}
        <section className="recent-bookings">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <Link to="/my-bookings" className="view-all">
              View All →
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
              <p>No bookings yet.</p>
              <Link to="/bookings" className="btn-primary">
                Book Your First Service
              </Link>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
