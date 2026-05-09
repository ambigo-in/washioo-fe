import { useEffect, useState } from "react";
import {
  createCustomerVehicle,
  deleteCustomerVehicle,
  fetchCustomerVehicles,
  updateCustomerVehicle,
} from "../../api/vehicleApi";
import { getApiErrorMessage } from "../../api/client";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import type {
  CustomerVehicle,
  CustomerVehiclePayload,
  CustomerVehicleType,
} from "../../types/apiTypes";
import { useLanguage } from "../../i18n/LanguageContext";
import "./CustomerVehicles.css";

const emptyVehicle: CustomerVehiclePayload = {
  vehicle_type: "bike",
  make: "",
  model: "",
  license_plate: "",
  is_default: false,
};

const cleanPayload = (payload: CustomerVehiclePayload): CustomerVehiclePayload => ({
  vehicle_type: payload.vehicle_type,
  make: payload.make?.trim() || null,
  model: payload.model?.trim() || null,
  license_plate: payload.license_plate?.trim() || null,
  is_default: !!payload.is_default,
});

export default function CustomerVehicles() {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [formData, setFormData] = useState<CustomerVehiclePayload>(emptyVehicle);
  const [editingVehicle, setEditingVehicle] = useState<CustomerVehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadVehicles = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchCustomerVehicles();
      setVehicles(response.vehicles);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVehicles();
  }, []);

  const resetForm = () => {
    setFormData(emptyVehicle);
    setEditingVehicle(null);
    setShowForm(false);
  };

  const handleEdit = (vehicle: CustomerVehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_type: vehicle.vehicle_type,
      make: vehicle.make || "",
      model: vehicle.model || "",
      license_plate: vehicle.license_plate || "",
      is_default: vehicle.is_default,
    });
    setShowForm(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = cleanPayload(formData);
      if (editingVehicle) {
        await updateCustomerVehicle(editingVehicle.id, payload);
        setSuccess(t("vehicles.updated"));
      } else {
        await createCustomerVehicle(payload);
        setSuccess(t("vehicles.added"));
      }
      resetForm();
      await loadVehicles();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (vehicle: CustomerVehicle) => {
    setError("");
    setSuccess("");
    try {
      await updateCustomerVehicle(vehicle.id, { is_default: true });
      setSuccess(t("vehicles.defaultUpdated"));
      await loadVehicles();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDelete = async (vehicle: CustomerVehicle) => {
    if (!window.confirm(t("vehicles.deleteConfirm"))) return;
    setError("");
    setSuccess("");
    try {
      await deleteCustomerVehicle(vehicle.id);
      setSuccess(t("vehicles.deleted"));
      await loadVehicles();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <DashboardLayout title={t("vehicles.myVehicles")}>
      <div className="vehicles-page">
        <div className="vehicles-header">
          <div>
            <h2>{t("vehicles.manage")}</h2>
            <p>{t("vehicles.manageHint")}</p>
          </div>
          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              setShowForm(true);
              setEditingVehicle(null);
              setFormData(emptyVehicle);
            }}
          >
            + {t("vehicles.addVehicle")}
          </button>
        </div>

        {error && <p className="vehicle-alert error">{error}</p>}
        {success && <p className="vehicle-alert success">{success}</p>}

        {loading ? (
          <div className="vehicles-state">{t("vehicles.loading")}</div>
        ) : vehicles.length === 0 ? (
          <div className="vehicles-state">{t("vehicles.none")}</div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className={`vehicle-card ${vehicle.is_default ? "default" : ""}`}
              >
                {vehicle.is_default && (
                  <span className="default-badge">{t("common.default")}</span>
                )}
                <span className="vehicle-type">
                  {t(`vehicles.${vehicle.vehicle_type}`)}
                </span>
                <h3>
                  {[vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
                    t("common.vehicle")}
                </h3>
                <p>{vehicle.license_plate || t("vehicles.noPlate")}</p>
                <div className="vehicle-actions">
                  {!vehicle.is_default && (
                    <button type="button" onClick={() => handleSetDefault(vehicle)}>
                      {t("vehicles.setDefault")}
                    </button>
                  )}
                  <button type="button" onClick={() => handleEdit(vehicle)}>
                    {t("common.edit")}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDelete(vehicle)}
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {showForm && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="vehicle-modal" onClick={(event) => event.stopPropagation()}>
              <h3>
                {editingVehicle ? t("vehicles.editVehicle") : t("vehicles.addVehicle")}
              </h3>
              <form onSubmit={handleSubmit}>
                <label>
                  {t("vehicles.vehicleType")}
                  <select
                    value={formData.vehicle_type}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        vehicle_type: event.target.value as CustomerVehicleType,
                      }))
                    }
                  >
                    <option value="bike">{t("vehicles.bike")}</option>
                    <option value="car">{t("vehicles.car")}</option>
                  </select>
                </label>
                <label>
                  {t("common.make")}
                  <input
                    value={formData.make || ""}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        make: event.target.value,
                      }))
                    }
                    placeholder="Honda, Hyundai, BMW"
                  />
                </label>
                <label>
                  {t("common.model")}
                  <input
                    value={formData.model || ""}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        model: event.target.value,
                      }))
                    }
                    placeholder="Activa, Creta, GS"
                  />
                </label>
                <label>
                  {t("common.licensePlate")}
                  <input
                    value={formData.license_plate || ""}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        license_plate: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="KA01AB1234"
                  />
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={!!formData.is_default}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        is_default: event.target.checked,
                      }))
                    }
                  />
                  {t("vehicles.setAsDefault")}
                </label>
                <div className="vehicle-form-actions">
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    {t("common.cancel")}
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving
                      ? t("common.saving")
                      : editingVehicle
                        ? t("common.update")
                        : t("common.add")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
