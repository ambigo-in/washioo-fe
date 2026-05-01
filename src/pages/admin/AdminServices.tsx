import { useEffect, useState } from "react";
import {
  fetchAdminServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from "../../api/adminApi";
import type {
  AdminServiceCategory,
  ServiceCategoryPayload,
} from "../../types/adminTypes";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import "./AdminServices.css";

export default function AdminServices() {
  const [services, setServices] = useState<AdminServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<ServiceCategoryPayload>({
    service_name: "",
    description: "",
    base_price: 0,
    estimated_duration_minutes: 60,
    is_active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAdminServiceCategories();
        setServices(response.services);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateServiceCategory(editingId, formData);
      } else {
        await createServiceCategory(formData);
      }
      // Refresh the list
      const response = await fetchAdminServiceCategories();
      setServices(response.services);
      resetForm();
    } catch (error) {
      console.error("Failed to save service:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service: AdminServiceCategory) => {
    setFormData({
      service_name: service.service_name,
      description: service.description || "",
      base_price: service.base_price,
      estimated_duration_minutes: service.estimated_duration_minutes || 60,
      is_active: service.is_active,
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteServiceCategory(serviceId);
      const response = await fetchAdminServiceCategories();
      setServices(response.services);
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  const handleToggleActive = async (service: AdminServiceCategory) => {
    try {
      await updateServiceCategory(service.id, {
        is_active: !service.is_active,
      });
      const response = await fetchAdminServiceCategories();
      setServices(response.services);
    } catch (error) {
      console.error("Failed to toggle service:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      service_name: "",
      description: "",
      base_price: 0,
      estimated_duration_minutes: 60,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <DashboardLayout title="Manage Services">
      <div className="admin-services">
        {/* Header Actions */}
        <div className="page-header">
          <h2>Service Categories</h2>
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Service"}
          </button>
        </div>

        {/* Service Form */}
        {showForm && (
          <div className="service-form-card">
            <h3>{editingId ? "Edit Service" : "Add New Service"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    value={formData.service_name}
                    onChange={(e) =>
                      setFormData({ ...formData, service_name: e.target.value })
                    }
                    placeholder="e.g., Car Wash"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Base Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        base_price: parseFloat(e.target.value),
                      })
                    }
                    placeholder="499"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the service..."
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Estimated Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.estimated_duration_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimated_duration_minutes: parseInt(e.target.value),
                      })
                    }
                    placeholder="60"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                  Active
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Service"
                      : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services List */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading services...</p>
          </div>
        ) : services.length > 0 ? (
          <div className="services-list">
            {services.map((service) => (
              <div
                key={service.id}
                className={`service-card ${!service.is_active ? "inactive" : ""}`}
              >
                <div className="service-header">
                  <div className="service-info">
                    <h3>{service.service_name}</h3>
                    <span
                      className={`status-badge ${service.is_active ? "active" : "inactive"}`}
                    >
                      {service.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="service-price">₹{service.base_price}</div>
                </div>

                <p className="service-description">{service.description}</p>

                <div className="service-meta">
                  <span>⏱ {service.estimated_duration_minutes} min</span>
                  <span>
                    📅 Created:{" "}
                    {new Date(service.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="service-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(service)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-toggle"
                    onClick={() => handleToggleActive(service)}
                  >
                    {service.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(service.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No services found. Add your first service!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
