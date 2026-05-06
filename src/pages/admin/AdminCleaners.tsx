import { useEffect, useState } from "react";
import { fetchCleaners, updateCleanerProfile } from "../../api/adminApi";
import type { CleanerProfile } from "../../types/cleanerTypes";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  PaginationControls,
  SearchInput,
  StatusTabs,
  matchesSearch,
  paginateItems,
  useDashboardQueryState,
  type StatusTabOption,
} from "../../components/dashboard/DashboardControls";
import { formatIndianPhoneForDisplay } from "../../utils/phoneUtils";
import "./AdminCleaners.css";

type FilterStatus = "all" | "pending" | "approved" | "rejected" | "suspended";

const identityStatusLabel: Record<string, string> = {
  full_available: "Full data available",
  masked_legacy_data: "Masked legacy data",
};

const getIdentityValue = (
  fullValue?: string | null,
  maskedValue?: string | null,
) => fullValue || maskedValue || "Not provided";

const hasFullIdentityData = (cleaner: CleanerProfile) =>
  cleaner.identity_data_status === "full_available" ||
  Boolean(cleaner.aadhaar_number);

export default function AdminCleaners() {
  const [cleaners, setCleaners] = useState<CleanerProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<Exclude<FilterStatus, "all">, number>>({
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  });
  const [loading, setLoading] = useState(true);
  const query = useDashboardQueryState<FilterStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedCleaner, setSelectedCleaner] = useState<CleanerProfile | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const status = query.status === "all" ? undefined : query.status;
        const response = await fetchCleaners({
          approval_status: status,
          limit: query.pageSize,
          offset: query.offset,
        });
        setCleaners(response.cleaners);
        setTotal(response.total);
      } catch (error) {
        console.error("Failed to fetch cleaners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query.offset, query.pageSize, query.status]);

  useEffect(() => {
    let active = true;
    Promise.all(
      (["pending", "approved", "rejected", "suspended"] as const).map(async (status) => {
        const response = await fetchCleaners({
          approval_status: status,
          limit: 1,
          offset: 0,
        });
        return [status, response.total] as const;
      }),
    )
      .then((entries) => {
        if (active) setCounts(Object.fromEntries(entries) as Record<Exclude<FilterStatus, "all">, number>);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [total]);

  const handleUpdateStatus = async (cleanerId: string, status: string) => {
    setUpdatingId(cleanerId);
    try {
      await updateCleanerProfile(cleanerId, { approval_status: status as any });
      // Refresh the list
      const response = await fetchCleaners(
        query.status === "all"
          ? { limit: query.pageSize, offset: query.offset }
          : { approval_status: query.status as any, limit: query.pageSize, offset: query.offset },
      );
      setCleaners(response.cleaners);
      setTotal(response.total);
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
        query.status === "all"
          ? { limit: query.pageSize, offset: query.offset }
          : { approval_status: query.status as any, limit: query.pageSize, offset: query.offset },
      );
      setCleaners(response.cleaners);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to update availability:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "var(--brand-teal)",
      approved: "var(--brand-teal)",
      rejected: "#dc3545",
      suspended: "var(--brand-text-muted)",
      offline: "var(--brand-text-muted)",
      available: "var(--brand-teal)",
      busy: "var(--brand-teal)",
    };
    return colors[status] || "var(--brand-text-muted)";
  };

  const filters: FilterStatus[] = [
    "all",
    "pending",
    "approved",
    "rejected",
    "suspended",
  ];
  const filteredCleaners = cleaners.filter((cleaner) =>
    matchesSearch(cleaner, query.debouncedSearch, [
      (item) => item.full_name,
      (item) => item.phone,
      (item) => item.email,
      (item) => item.vehicle_type,
      (item) => item.approval_status,
      (item) => item.availability_status,
    ]),
  );
  const visibleCleaners = query.debouncedSearch
    ? paginateItems(filteredCleaners, query.page, query.pageSize)
    : filteredCleaners;
  const visibleTotal = query.debouncedSearch ? filteredCleaners.length : total;
  const tabOptions: Array<StatusTabOption<FilterStatus>> = filters.map((status) => ({
    value: status,
    label: status === "all" ? "All" : status,
    count:
      status === "all"
        ? Object.values(counts).reduce((sum, count) => sum + count, 0)
        : counts[status],
  }));

  return (
    <DashboardLayout title="Manage Cleaners">
      <div className="admin-cleaners">
        <div className="dashboard-toolbar">
          <SearchInput
            value={query.search}
            onChange={query.setSearch}
            placeholder="Search cleaners, phone, vehicle..."
          />
        </div>
        <StatusTabs value={query.status} options={tabOptions} onChange={query.setStatus} />

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading cleaners...</p>
          </div>
        ) : visibleCleaners.length > 0 ? (
          <div className="cleaners-list">
            {visibleCleaners.map((cleaner) => (
              <div key={cleaner.id} className="cleaner-card">
                <div className="cleaner-header">
                  <div className="cleaner-info">
                    <h3>{cleaner.full_name}</h3>
                    <span className="phone">
                      {formatIndianPhoneForDisplay(cleaner.phone)}
                    </span>
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
                  <div className="detail-item">
                    <span className="label">Identity</span>
                    <span
                      className={`value identity-chip ${
                        hasFullIdentityData(cleaner) ? "full" : "legacy"
                      }`}
                    >
                      {hasFullIdentityData(cleaner) ? "Full" : "Masked"}
                    </span>
                  </div>
                </div>

                <div className="cleaner-actions">
                  <button
                    className="btn-view-details"
                    onClick={() => setSelectedCleaner(cleaner)}
                  >
                    View Details
                  </button>
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
        <PaginationControls
          page={query.page}
          pageSize={query.pageSize}
          total={visibleTotal}
          onPageChange={query.setPage}
        />

        {/* Cleaner Details Modal */}
        {selectedCleaner && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedCleaner(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Cleaner Details - {selectedCleaner.full_name}</h3>
                <button
                  className="modal-close"
                  onClick={() => setSelectedCleaner(null)}
                >
                  ×
                </button>
              </div>

              <div className="cleaner-details-modal">
                <div className="detail-section">
                  <h4>Personal Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Full Name</span>
                      <span className="value">{selectedCleaner.full_name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone</span>
                      <span className="value">
                        {formatIndianPhoneForDisplay(selectedCleaner.phone)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email</span>
                      <span className="value">
                        {selectedCleaner.email || "Not provided"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Joined Date</span>
                      <span className="value">
                        {new Date(
                          selectedCleaner.created_at,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Identity Verification</h4>
                  {selectedCleaner.identity_data_status && (
                    <p
                      className={`identity-status-note ${
                        hasFullIdentityData(selectedCleaner) ? "full" : "legacy"
                      }`}
                    >
                      {identityStatusLabel[selectedCleaner.identity_data_status] ||
                        selectedCleaner.identity_data_status}
                      {!hasFullIdentityData(selectedCleaner) &&
                        ". Ask the cleaner to resubmit identity details before full verification."}
                    </p>
                  )}
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Aadhaar Card</span>
                      <span className="value">
                        {selectedCleaner.has_aadhaar ? (
                          <span className="verified">✓ Verified</span>
                        ) : (
                          <span className="not-verified">✗ Not Verified</span>
                        )}
                      </span>
                    </div>
                    <div className="detail-item sensitive-detail">
                      <span className="label">
                        {selectedCleaner.aadhaar_number
                          ? "Full Aadhaar Number"
                          : "Masked Aadhaar Number"}
                      </span>
                      <span className="value identity-number">
                        {getIdentityValue(
                          selectedCleaner.aadhaar_number,
                          selectedCleaner.aadhaar_number_masked,
                        )}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Driving License</span>
                      <span className="value">
                        {selectedCleaner.has_driving_license ? (
                          <span className="verified">✓ Verified</span>
                        ) : (
                          <span className="not-verified">✗ Not Verified</span>
                        )}
                      </span>
                    </div>
                    <div className="detail-item sensitive-detail">
                      <span className="label">
                        {selectedCleaner.driving_license_number
                          ? "Full License Number"
                          : "Masked License Number"}
                      </span>
                      <span className="value identity-number">
                        {getIdentityValue(
                          selectedCleaner.driving_license_number,
                          selectedCleaner.driving_license_number_masked,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Service Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Vehicle Type</span>
                      <span className="value">
                        {selectedCleaner.vehicle_type || "Not specified"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Service Radius</span>
                      <span className="value">
                        {selectedCleaner.service_radius_km || 0} km
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Jobs Completed</span>
                      <span className="value">
                        {selectedCleaner.total_jobs_completed}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Rating</span>
                      <span className="value">
                        ⭐ {selectedCleaner.rating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Status Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Approval Status</span>
                      <span
                        className="value status-badge"
                        style={{
                          backgroundColor: getStatusColor(
                            selectedCleaner.approval_status,
                          ),
                        }}
                      >
                        {selectedCleaner.approval_status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Availability Status</span>
                      <span
                        className="value status-badge"
                        style={{
                          backgroundColor: getStatusColor(
                            selectedCleaner.availability_status,
                          ),
                        }}
                      >
                        {selectedCleaner.availability_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedCleaner.approval_status === "pending" && (
                <div className="modal-actions">
                  <button
                    className="btn-approve"
                    onClick={() => {
                      handleUpdateStatus(selectedCleaner.id, "approved");
                      setSelectedCleaner(null);
                    }}
                    disabled={updatingId === selectedCleaner.id}
                  >
                    Approve Cleaner
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => {
                      handleUpdateStatus(selectedCleaner.id, "rejected");
                      setSelectedCleaner(null);
                    }}
                    disabled={updatingId === selectedCleaner.id}
                  >
                    Reject Cleaner
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setSelectedCleaner(null)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
