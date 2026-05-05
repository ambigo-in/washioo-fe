import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { LoadingButton } from "../../components/ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  loadCleanerProfile,
  setCleanerAvailability,
} from "../../store/slices/cleanerSlice";
import "./CleanerAvailability.css";

export default function CleanerAvailability() {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.cleaner);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(loadCleanerProfile());
  }, [dispatch]);

  const handleAvailabilityChange = async (
    status: "offline" | "available" | "busy",
  ) => {
    if (!profile?.approval_status || profile.approval_status !== "approved") {
      setMessage("You must be approved before changing availability.");
      return;
    }

    setMessage("");
    try {
      await dispatch(setCleanerAvailability(status)).unwrap();
      setMessage("Availability updated successfully!");
    } catch (error) {
      setMessage("Failed to update availability. Please try again.");
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
            <LoadingButton
              className={`option-card ${profile?.availability_status === "offline" ? "active" : ""}`}
              onClick={() => handleAvailabilityChange("offline")}
              isLoading={loading}
              loadingText="Saving..."
            >
              <div className="option-icon">🌙</div>
              <h4>Offline</h4>
              <p>You are not accepting new jobs</p>
            </LoadingButton>

            <LoadingButton
              className={`option-card ${profile?.availability_status === "available" ? "active" : ""} ${!isApproved ? "disabled" : ""}`}
              onClick={() =>
                isApproved && handleAvailabilityChange("available")
              }
              disabled={!isApproved}
              isLoading={loading}
              loadingText="Saving..."
            >
              <div className="option-icon">✅</div>
              <h4>Available</h4>
              <p>Ready to accept new assignments</p>
              {!isApproved && (
                <span className="disabled-text">Not approved yet</span>
              )}
            </LoadingButton>

            <LoadingButton
              className={`option-card ${profile?.availability_status === "busy" ? "active" : ""} ${!isApproved ? "disabled" : ""}`}
              onClick={() => isApproved && handleAvailabilityChange("busy")}
              disabled={!isApproved}
              isLoading={loading}
              loadingText="Saving..."
            >
              <div className="option-icon">🔄</div>
              <h4>Busy</h4>
              <p>Currently on a job</p>
              {!isApproved && (
                <span className="disabled-text">Not approved yet</span>
              )}
            </LoadingButton>
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
