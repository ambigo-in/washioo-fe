import React, { useEffect, useState } from "react";
import {
  fetchCleanupPreview,
  runAllCleanupTasks,
  runCleanupTarget,
} from "../../api/adminApi";
import { getApiErrorMessage } from "../../api/client";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { LoadingButton } from "../../components/ui";
import { useAuth } from "../../context/useAuth";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateProfileRequest } from "../../store/slices/authSlice";
import type { CleanupPreviewItem, CleanupTarget } from "../../types/adminTypes";
import "./AdminSettings.css";

interface SettingsFormData {
  full_name: string;
  email: string;
  phone: string;
}

export default function AdminSettings() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const { user, setUser } = useAuth();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [cleanupItems, setCleanupItems] = useState<CleanupPreviewItem[]>([]);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupTargetLoading, setCleanupTargetLoading] =
    useState<CleanupTarget | "all" | null>(null);
  const [cleanupMessage, setCleanupMessage] = useState("");
  const [cleanupError, setCleanupError] = useState("");
  const [formData, setFormData] = useState<SettingsFormData>({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const loadCleanupPreview = async () => {
    try {
      setCleanupLoading(true);
      const response = await fetchCleanupPreview();
      setCleanupItems(response.items);
    } catch (err) {
      setCleanupError(getApiErrorMessage(err));
    } finally {
      setCleanupLoading(false);
    }
  };

  useEffect(() => {
    const previewTimer = window.setTimeout(() => {
      void loadCleanupPreview();
    }, 0);

    return () => window.clearTimeout(previewTimer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      const updatedUser = await dispatch(updateProfileRequest(formData)).unwrap();
      setUser(updatedUser.user);
      setSuccess("Settings updated successfully!");
    } catch (err) {
      setError("Failed to update settings");
      console.error(err);
    }
  };

  const handleCleanupTarget = async (target: CleanupTarget) => {
    const item = cleanupItems.find((cleanupItem) => cleanupItem.key === target);
    const confirmed = window.confirm(
      `Delete ${item?.eligible_records || 0} eligible ${item?.label.toLowerCase() || "records"}?`,
    );
    if (!confirmed) return;

    try {
      setCleanupTargetLoading(target);
      setCleanupError("");
      setCleanupMessage("");
      const response = await runCleanupTarget(target);
      setCleanupMessage(`${response.deleted_count} records deleted.`);
      await loadCleanupPreview();
    } catch (err) {
      setCleanupError(getApiErrorMessage(err));
    } finally {
      setCleanupTargetLoading(null);
    }
  };

  const handleRunAllCleanup = async () => {
    const totalEligible = cleanupItems.reduce(
      (sum, item) => sum + item.eligible_records,
      0,
    );
    const confirmed = window.confirm(
      `Run all cleanup tasks for ${totalEligible} eligible records?`,
    );
    if (!confirmed) return;

    try {
      setCleanupTargetLoading("all");
      setCleanupError("");
      setCleanupMessage("");
      const response = await runAllCleanupTasks();
      setCleanupMessage(`${response.deleted_count} records deleted.`);
      await loadCleanupPreview();
    } catch (err) {
      setCleanupError(getApiErrorMessage(err));
    } finally {
      setCleanupTargetLoading(null);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="settings-page">
        <div className="settings-section">
          <h3>Profile Settings</h3>
          <div className="settings-card">
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-actions">
                <LoadingButton
                  type="submit"
                  className="btn-primary"
                  isLoading={loading}
                  loadingText="Saving..."
                >
                  Save Changes
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>

        <div className="settings-section">
          <h3>Platform Information</h3>
          <div className="settings-card">
            <div className="info-row">
              <span className="info-label">Platform Name</span>
              <span className="info-value">Washioo</span>
            </div>
            <div className="info-row">
              <span className="info-label">Version</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Admin Role</span>
              <span className="info-value">Super Admin</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Database Cleanup</h3>
          <div className="settings-card">
            {cleanupMessage && (
              <div className="success-message">{cleanupMessage}</div>
            )}
            {cleanupError && <div className="error-message">{cleanupError}</div>}

            <div className="cleanup-header">
              <div>
                <h4>Storage Maintenance</h4>
                <p>
                  Removes old temporary records while keeping bookings,
                  payments, users, and ratings.
                </p>
              </div>
              <div className="cleanup-actions">
                <button
                  className="btn-secondary"
                  disabled={cleanupLoading || cleanupTargetLoading !== null}
                  type="button"
                  onClick={loadCleanupPreview}
                >
                  Refresh
                </button>
                <LoadingButton
                  className="btn-danger"
                  isLoading={cleanupTargetLoading === "all"}
                  disabled={
                    cleanupLoading ||
                    cleanupItems.every((item) => item.eligible_records === 0)
                  }
                  loadingText="Cleaning..."
                  onClick={handleRunAllCleanup}
                >
                  Run All
                </LoadingButton>
              </div>
            </div>

            <div className="cleanup-table-wrap">
              <table className="cleanup-table">
                <thead>
                  <tr>
                    <th>Cleanup Task</th>
                    <th>Eligible Records</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cleanupItems.map((item) => (
                    <tr key={item.key}>
                      <td>{item.label}</td>
                      <td>{item.eligible_records.toLocaleString()}</td>
                      <td>
                        <LoadingButton
                          className="btn-cleanup"
                          isLoading={cleanupTargetLoading === item.key}
                          disabled={
                            cleanupLoading ||
                            cleanupTargetLoading !== null ||
                            item.eligible_records === 0
                          }
                          loadingText="Cleaning..."
                          onClick={() => handleCleanupTarget(item.key)}
                        >
                          Delete
                        </LoadingButton>
                      </td>
                    </tr>
                  ))}
                  {!cleanupItems.length && (
                    <tr>
                      <td colSpan={3}>
                        {cleanupLoading
                          ? "Loading cleanup preview..."
                          : "No cleanup tasks found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Account Actions</h3>
          <div className="settings-card">
            <div className="action-row">
              <div className="action-info">
                <h4>Logout</h4>
                <p>Sign out from your account</p>
              </div>
              <button className="btn-danger">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
