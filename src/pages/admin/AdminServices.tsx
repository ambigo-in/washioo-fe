import { useEffect, useRef, useState } from "react";
import {
  fetchAdminServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  uploadServiceCategoryImage,
} from "../../api/adminApi";
import { getApiErrorMessage } from "../../api/client";
import type {
  AdminServiceCategory,
  ServiceCategoryPayload,
} from "../../types/adminTypes";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  FilterSelect,
  PaginationControls,
  SearchInput,
  matchesSearch,
  paginateItems,
  useDashboardQueryState,
} from "../../components/dashboard/DashboardControls";
import "./AdminServices.css";

const MAX_SERVICE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_SERVICE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export default function AdminServices() {
  const [services, setServices] = useState<AdminServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const formRef = useRef<HTMLDivElement | null>(null);
  const query = useDashboardQueryState<"all" | "active" | "inactive">("all");

  const [formData, setFormData] = useState<ServiceCategoryPayload>({
    service_name: "",
    description: "",
    base_price: 0,
    estimated_duration_minutes: 60,
    allow_extra_payment: false,
    max_extra_amount: 0,
    extra_payment_instructions: "",
    image_url: null,
    is_active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAdminServiceCategories();
        setServices(response.services);
      } catch (error) {
        setFormError(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    setFormMessage("");
    try {
      let savedService: AdminServiceCategory;
      if (editingId) {
        const response = await updateServiceCategory(editingId, formData);
        savedService = response.service;
      } else {
        const response = await createServiceCategory(formData);
        savedService = response.service;
      }

      if (selectedImageFile) {
        try {
          await uploadServiceCategoryImage(savedService.id, selectedImageFile);
        } catch (error) {
          setFormError(
            `Service details were saved, but image upload failed: ${getApiErrorMessage(error)}`,
          );
          const response = await fetchAdminServiceCategories();
          setServices(response.services);
          return;
        }
      }
      // Refresh the list
      const response = await fetchAdminServiceCategories();
      setServices(response.services);
      setFormMessage(
        editingId
          ? "Service updated successfully."
          : "Service created successfully.",
      );
      resetForm();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const scrollToForm = () => {
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const handleEdit = (service: AdminServiceCategory) => {
    setFormError("");
    setFormMessage("");
    setFormData({
      service_name: service.service_name,
      description: service.description || "",
      base_price: service.base_price,
      estimated_duration_minutes: service.estimated_duration_minutes || 60,
      allow_extra_payment: service.allow_extra_payment,
      max_extra_amount: service.max_extra_amount ?? 0,
      extra_payment_instructions: service.extra_payment_instructions || "",
      image_url: service.image_url,
      is_active: service.is_active,
    });
    setSelectedImageFile(null);
    setEditingId(service.id);
    setShowForm(true);
    scrollToForm();
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    setFormError("");
    setFormMessage("");
    try {
      await deleteServiceCategory(serviceId);
      const response = await fetchAdminServiceCategories();
      setServices(response.services);
      setFormMessage("Service deactivated successfully.");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const handleToggleActive = async (service: AdminServiceCategory) => {
    setFormError("");
    setFormMessage("");
    try {
      await updateServiceCategory(service.id, {
        is_active: !service.is_active,
      });
      const response = await fetchAdminServiceCategories();
      setServices(response.services);
      setFormMessage(
        service.is_active
          ? "Service deactivated successfully."
          : "Service activated successfully.",
      );
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const resetForm = () => {
    setFormData({
      service_name: "",
      description: "",
      base_price: 0,
      estimated_duration_minutes: 60,
      allow_extra_payment: false,
      max_extra_amount: 0,
      extra_payment_instructions: "",
      image_url: null,
      is_active: true,
    });
    setSelectedImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleImageFileChange = (file?: File | null) => {
    setFormError("");
    setSelectedImageFile(null);

    if (!file) return;
    if (!ALLOWED_SERVICE_IMAGE_TYPES.has(file.type)) {
      setFormError("Only JPG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > MAX_SERVICE_IMAGE_SIZE_BYTES) {
      setFormError("Image file must be 5 MB or smaller.");
      return;
    }

    setSelectedImageFile(file);
  };

  const getServiceImage = (service: AdminServiceCategory, index: number) =>
    service.image_url || (index % 2 === 0 ? "/p2.png" : "/p1.png");

  const filteredServices = services
    .filter((service) => {
      if (query.status === "active") return service.is_active;
      if (query.status === "inactive") return !service.is_active;
      return true;
    })
    .filter((service) =>
      matchesSearch(service, query.debouncedSearch, [
        (item) => item.service_name,
        (item) => item.description,
        (item) => item.base_price,
      ]),
    );
  const visibleServices = paginateItems(
    filteredServices,
    query.page,
    query.pageSize,
  );

  return (
    <DashboardLayout title="Manage Services">
      <div className="admin-services">
        {/* Header Actions */}
        <div className="page-header">
          <h2>Service Categories</h2>
          <button
            className="btn-add"
            onClick={() => {
              setFormError("");
              setFormMessage("");
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
                scrollToForm();
              }
            }}
          >
            {showForm ? "Cancel" : "+ Add Service"}
          </button>
        </div>
        <div className="dashboard-toolbar">
          <SearchInput
            value={query.search}
            onChange={query.setSearch}
            placeholder="Search services..."
          />
          <FilterSelect
            value={query.status}
            onChange={query.setStatus}
            options={[
              { value: "all", label: "All Services" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>

        {formError && <p className="service-alert error">{formError}</p>}
        {formMessage && <p className="service-alert success">{formMessage}</p>}

        {/* Service Form */}
        {showForm && (
          <div className="service-form-card" ref={formRef}>
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
                <div className="form-group checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.allow_extra_payment ?? false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allow_extra_payment: e.target.checked,
                        })
                      }
                    />
                    Allow extra payment collection above base price
                  </label>
                </div>
                <div className="form-group">
                  <label>Max Extra Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.max_extra_amount ?? 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_extra_amount: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                    placeholder="0"
                    disabled={!formData.allow_extra_payment}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Extra Payment Instructions</label>
                  <textarea
                    value={formData.extra_payment_instructions ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        extra_payment_instructions: e.target.value,
                      })
                    }
                    placeholder="e.g., collect difference only with admin approval"
                    rows={3}
                    disabled={!formData.allow_extra_payment}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group service-image-field">
                  <label>Service Image</label>
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt=""
                      className="service-image-preview"
                    />
                  )}
                  <input
                    id="service-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      handleImageFileChange(e.target.files?.[0] ?? null)
                    }
                  />
                  <label
                    className="image-upload-button"
                    htmlFor="service-image-upload"
                  >
                    Choose Image
                  </label>
                  <span className="field-hint">
                    JPG, PNG, or WebP up to 5 MB. Selecting a new file replaces
                    the current service image.
                  </span>
                  {selectedImageFile && (
                    <span className="selected-file-name">
                      Selected: {selectedImageFile.name}
                    </span>
                  )}
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
        ) : visibleServices.length > 0 ? (
          <div className="services-list">
            {visibleServices.map((service, index) => (
              <div
                key={service.id}
                className={`admin-service-card ${
                  !service.is_active ? "inactive" : ""
                }`}
                style={{
                  backgroundImage: `url("${getServiceImage(service, index)}")`,
                }}
              >
                <div className="admin-service-card-content">
                  <div className="service-header">
                    <div className="service-info">
                      <h3>{service.service_name}</h3>
                      <span
                        className={`status-badge ${
                          service.is_active ? "active" : "inactive"
                        }`}
                      >
                        {service.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="service-price">
                      Rs. {service.base_price.toLocaleString()}
                    </div>
                  </div>

                  <p className="service-description">
                    {service.description || "No description added yet."}
                  </p>

                  <div className="service-meta">
                    <span>
                      <strong>Duration</strong>
                      {service.estimated_duration_minutes || 0} min
                    </span>
                    <span>
                      <strong>Extra payment</strong>
                      {service.allow_extra_payment ? "Allowed" : "Not allowed"}
                    </span>
                    {service.allow_extra_payment &&
                      service.max_extra_amount != null && (
                        <span>
                          <strong>Max extra</strong>
                          Rs. {service.max_extra_amount.toLocaleString()}
                        </span>
                      )}
                  </div>
                  {service.allow_extra_payment &&
                    service.extra_payment_instructions && (
                      <div className="service-extra-note">
                        <strong>Admin note</strong>
                        <p>{service.extra_payment_instructions}</p>
                      </div>
                    )}

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
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No services found. Add your first service!</p>
          </div>
        )}
        <PaginationControls
          page={query.page}
          pageSize={query.pageSize}
          total={filteredServices.length}
          onPageChange={query.setPage}
        />
      </div>
    </DashboardLayout>
  );
}
