import { useEffect, useState } from "react";
import { fetchCleaners, updateCleanerProfile } from "../../api/adminApi";
import type { CleanerProfile } from "../../types/cleanerTypes";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import "./AdminCleaners.css";

type FilterStatus = "all" | "pending" | "approved" | "rejected" | "suspended";

export default function AdminCleaners() {
  const [cleaners, setCleaners] = useState<CleanerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const status = filter === "all" ? undefined : filter;
        const response = await fetchCleaners({ approval_status: status });
        setCleaners(response.cleaners);
      } catch (error) {
        console.error("Failed to fetch cleaners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  const handleUpdateStatus = async (cleanerId: string, status: string) => {
    setUpdatingId(cleanerId);
    try {
      await updateCleanerProfile(cleanerId, { approval_status: status as any });
      // Refresh the list
      const response = await fetchCleaners(
        filter === "all" ? undefined : { approval_status: filter as any },
      );
      setCleaners(response.cleaners);
    } catch (error) {
      console.error("Failed to update cleaner:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateAvailability = async (
    cleanerId: string,
    status: string,
  ) => {
    setUpdatingId(cleanerId);
    try {
      await updateCleanerProfile(cleanerId, {
        availability_status: status as any,
      });
      const response = await fetchCleaners(
        filter === "all" ? undefined : { approval_status: filter as any },
      );
      setCleaners(response.cleaners);
    } catch (error) {
      console.error("Failed to update availability:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#ffc107",
      approved: "#28a745",
      rejected: "#dc3545",
      suspended: "#6c757d",
      offline: "#6c757d",
      available: "#28a745",
      busy: "#007bff",
    };
    return colors[status] || "#6c757d";
  };

  const filters: FilterStatus[] = [
    "all",
    "pending",
    "approved",
    "rejected",
    "suspended",
  ];

  return (
    <DashboardLayout title="Manage Cleaners">
      <div className="admin-cleaners">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          {filters.map((status) => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? "active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== "all" && (
                <span className="count">
                  {cleaners.filter((c) => c.approval_status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading cleaners...</p>
          </div>
        ) : cleaners.length > 0 ? (
          <div className="cleaners-list">
            {cleaners.map((cleaner) => (
              <div key={cleaner.id} className="cleaner-card">
                <div className="cleaner-header">
                  <div className="cleaner-info">
                    <h3>{cleaner.full_name}</h3>
                    <span className="phone">{cleaner.phone}</span>
                  </div>
                  <div className="badges">
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(
                          cleaner.approval_status,
                        ),
                      }}
                    >
                      {cleaner.approval_status}
                    </span>
                    <span
                      className="status-badge availability"
                      style={{
                        backgroundColor: getStatusColor(
                          cleaner.availability_status,
                        ),
                      }}
                    >
                      {cleaner.availability_status}
                    </span>
                  </div>
                </div>

                <div className="cleaner-details">
                  <div className="detail-item">
                    <span className="label">Vehicle</span>
                    <span className="value">
                      {cleaner.vehicle_type || "Not specified"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Service Radius</span>
                    <span className="value">
                      {cleaner.service_radius_km || 0} km
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Jobs Completed</span>
                    <span className="value">
                      {cleaner.total_jobs_completed}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Rating</span>
                    <span className="value">
                      ⭐ {cleaner.rating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                </div>

                <div className="cleaner-actions">
                  {cleaner.approval_status === "pending" && (
                    <>
                      <button
                        className="btn-approve"
                        onClick={() =>
                          handleUpdateStatus(cleaner.id, "approved")
                        }
                        disabled={updatingId === cleaner.id}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() =>
                          handleUpdateStatus(cleaner.id, "rejected")
                        }
                        disabled={updatingId === cleaner.id}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {cleaner.approval_status === "approved" && (
                    <>
                      {cleaner.availability_status !== "available" && (
                        <button
                          className="btn-available"
                          onClick={() =>
                            handleUpdateAvailability(cleaner.id, "available")
                          }
                          disabled={updatingId === cleaner.id}
                        >
                          Set Available
                        </button>
                      )}
                      {cleaner.availability_status === "available" && (
                        <button
                          className="btn-busy"
                          onClick={() =>
                            handleUpdateAvailability(cleaner.id, "busy")
                          }
                          disabled={updatingId === cleaner.id}
                        >
                          Set Busy
                        </button>
                      )}
                      <button
                        className="btn-suspend"
                        onClick={() =>
                          handleUpdateStatus(cleaner.id, "suspended")
                        }
                        disabled={updatingId === cleaner.id}
                      >
                        Suspend
                      </button>
                    </>
                  )}
                  {cleaner.approval_status === "suspended" && (
                    <button
                      className="btn-approve"
                      onClick={() => handleUpdateStatus(cleaner.id, "approved")}
                      disabled={updatingId === cleaner.id}
                    >
                      Reactivate
                    </button>
                  )}
                  {cleaner.approval_status === "rejected" && (
                    <button
                      className="btn-approve"
                      onClick={() => handleUpdateStatus(cleaner.id, "pending")}
                      disabled={updatingId === cleaner.id}
                    >
                      Reset to Pending
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No cleaners found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
