import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllBookings, fetchCleaners } from "../../api/adminApi";
import type { AdminBooking } from "../../types/adminTypes";
import type { CleanerProfile } from "../../types/cleanerTypes";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [cleaners, setCleaners] = useState<CleanerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, cleanersRes] = await Promise.all([
          fetchAllBookings(),
          fetchCleaners(),
        ]);
        setBookings(bookingsRes.bookings);
        setCleaners(cleanersRes.cleaners);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
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

  // Calculate stats
  const pendingBookings = bookings.filter(
    (b) => b.booking_status === "pending",
  );
  const activeBookings = bookings.filter((b) =>
    ["assigned", "accepted", "in_progress"].includes(b.booking_status),
  );
  const completedBookings = bookings.filter(
    (b) => b.booking_status === "completed",
  );
  const availableCleaners = cleaners.filter(
    (c) => c.availability_status === "available",
  );
  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + (b.final_price || b.estimated_price),
    0,
  );

  // Recent bookings
  const recentBookings = bookings.slice(0, 5);

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="admin-dashboard">
        {/* Stats Overview */}
        <section className="stats-overview">
          <h2>Platform Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{bookings.length}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-value">{pendingBookings.length}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card info">
              <div className="stat-value">{activeBookings.length}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">{completedBookings.length}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{cleaners.length}</div>
              <div className="stat-label">Total Cleaners</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{availableCleaners.length}</div>
              <div className="stat-label">Available</div>
            </div>
            <div className="stat-card revenue">
              <div className="stat-value">₹{totalRevenue.toLocaleString()}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-cards">
            <Link to="/admin/bookings" className="action-card">
              <div className="action-icon">📋</div>
              <div className="action-content">
                <h3>Manage Bookings</h3>
                <p>View and assign bookings</p>
              </div>
            </Link>
            <Link to="/admin/cleaners" className="action-card">
              <div className="action-icon">🧹</div>
              <div className="action-content">
                <h3>Manage Cleaners</h3>
                <p>Approve and manage cleaners</p>
              </div>
            </Link>
            <Link to="/admin/payments" className="action-card">
              <div className="action-icon">💳</div>
              <div className="action-content">
                <h3>Manage Payments</h3>
                <p>Track and update payment status</p>
              </div>
            </Link>
            <Link to="/admin/services" className="action-card">
              <div className="action-icon">🔧</div>
              <div className="action-content">
                <h3>Manage Services</h3>
                <p>Add or edit service categories</p>
              </div>
            </Link>
            <Link to="/admin/users" className="action-card">
              <div className="action-icon">👥</div>
              <div className="action-content">
                <h3>Manage Users</h3>
                <p>View and manage users</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Bookings */}
        <section className="recent-bookings">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <Link to="/admin/bookings" className="view-all">
              View All →
            </Link>
          </div>
          {recentBookings.length > 0 ? (
            <div className="bookings-table">
              <table>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.booking_reference}</td>
                      <td>{booking.customer_name}</td>
                      <td>{booking.service_name}</td>
                      <td>
                        {new Date(booking.scheduled_date).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(
                              booking.booking_status,
                            ),
                          }}
                        >
                          {booking.booking_status.replace("_", " ")}
                        </span>
                      </td>
                      <td>₹{booking.estimated_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No bookings yet.</p>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
