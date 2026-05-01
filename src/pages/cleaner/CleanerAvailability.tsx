import { useEffect, useState } from "react";
import {
  fetchCleanerProfile,
  updateCleanerAvailability,
} from "../../api/cleanerApi";
import type { CleanerProfile } from "../../types/cleanerTypes";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import "./CleanerAvailability.css";

export default function CleanerAvailability() {
  const [profile, setProfile] = useState<CleanerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchCleanerProfile();
        setProfile(response.cleaner);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAvailabilityChange = async (
    status: "offline" | "available" | "busy",
  ) => {
    if (!profile?.approval_status || profile.approval_status !== "approved") {
      setMessage("You must be approved before changing availability.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const response = await updateCleanerAvailability({
        availability_status: status,
      });
      setProfile(response.cleaner);
      setMessage("Availability updated successfully!");
    } catch (error) {
      setMessage("Failed to update availability. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Availability">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  const isApproved = profile?.approval_status === "approved";

  return (
    <DashboardLayout title="Manage Availability">
      <div className="cleaner-availability">
        {/* Status Info */}
        <div className="status-info">
          <div className="info-card">
            <h3>Current Status</h3>
            <div className="current-status">
              <span className={`status-badge ${profile?.availability_status}`}>
                {profile?.availability_status || "offline"}
              </span>
            </div>
          </div>
          <div className="info-card">
            <h3>Approval Status</h3>
            <div className="approval-status">
              <span className={`status-badge ${profile?.approval_status}`}>
                {profile?.approval_status || "pending"}
              </span>
            </div>
            {!isApproved && (
              <p className="warning-text">
                ⚠️ You need to be approved by an admin before you can go
                available.
              </p>
            )}
          </div>
        </div>

        {/* Availability Options */}
        <div className="availability-options">
          <h3>Set Your Availability</h3>
          <p className="subtitle">
            Choose your current working status. Customers will only see you when
            you're available.
          </p>

          <div className="options-grid">
            <button
              className={`option-card ${profile?.availability_status === "offline" ? "active" : ""}`}
              onClick={() => handleAvailabilityChange("offline")}
              disabled={saving}
            >
              <div className="option-icon">🌙</div>
              <h4>Offline</h4>
              <p>You are not accepting new jobs</p>
            </button>

            <button
              className={`option-card ${profile?.availability_status === "available" ? "active" : ""} ${!isApproved ? "disabled" : ""}`}
              onClick={() =>
                isApproved && handleAvailabilityChange("available")
              }
              disabled={saving || !isApproved}
            >
              <div className="option-icon">✅</div>
              <h4>Available</h4>
              <p>Ready to accept new assignments</p>
              {!isApproved && (
                <span className="disabled-text">Not approved yet</span>
              )}
            </button>

            <button
              className={`option-card ${profile?.availability_status === "busy" ? "active" : ""} ${!isApproved ? "disabled" : ""}`}
              onClick={() => isApproved && handleAvailabilityChange("busy")}
              disabled={saving || !isApproved}
            >
              <div className="option-icon">🔄</div>
              <h4>Busy</h4>
              <p>Currently on a job</p>
              {!isApproved && (
                <span className="disabled-text">Not approved yet</span>
              )}
            </button>
          </div>

          {message && (
            <div
              className={`message ${message.includes("success") ? "success" : "error"}`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Guidelines */}
        <div className="guidelines">
          <h3>Guidelines</h3>
          <ul>
            <li>
              Set your status to <strong>Available</strong> when you're ready to
              take new jobs.
            </li>
            <li>
              Your profile must be <strong>Approved</strong> by an admin before
              you can go available.
            </li>
            <li>
              Set status to <strong>Busy</strong> when you're currently working
              on a job.
            </li>
            <li>
              Set status to <strong>Offline</strong> when you're not working.
            </li>
            <li>
              Keep your status updated to provide better service to customers.
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
