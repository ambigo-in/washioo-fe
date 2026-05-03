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
        setSuccess("Vehicle updated.");
      } else {
        await createCustomerVehicle(payload);
        setSuccess("Vehicle added.");
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
      setSuccess("Default vehicle updated.");
      await loadVehicles();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDelete = async (vehicle: CustomerVehicle) => {
    if (!window.confirm("Delete this vehicle?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteCustomerVehicle(vehicle.id);
      setSuccess("Vehicle deleted.");
      await loadVehicles();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <DashboardLayout title="My Vehicles">
      <div className="vehicles-page">
        <div className="vehicles-header">
          <div>
            <h2>Manage Your Vehicles</h2>
            <p>Save your bike or car details once and reuse them while booking.</p>
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
            + Add Vehicle
          </button>
        </div>

        {error && <p className="vehicle-alert error">{error}</p>}
        {success && <p className="vehicle-alert success">{success}</p>}

        {loading ? (
          <div className="vehicles-state">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="vehicles-state">No vehicles added yet.</div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className={`vehicle-card ${vehicle.is_default ? "default" : ""}`}
              >
                {vehicle.is_default && <span className="default-badge">Default</span>}
                <span className="vehicle-type">{vehicle.vehicle_type}</span>
                <h3>
                  {[vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
                    "Vehicle"}
                </h3>
                <p>{vehicle.license_plate || "No license plate added"}</p>
                <div className="vehicle-actions">
                  {!vehicle.is_default && (
                    <button type="button" onClick={() => handleSetDefault(vehicle)}>
                      Set Default
                    </button>
                  )}
                  <button type="button" onClick={() => handleEdit(vehicle)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDelete(vehicle)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {showForm && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="vehicle-modal" onClick={(event) => event.stopPropagation()}>
              <h3>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  Vehicle Type
                  <select
                    value={formData.vehicle_type}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        vehicle_type: event.target.value as CustomerVehicleType,
                      }))
                    }
                  >
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                  </select>
                </label>
                <label>
                  Make
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
                  Model
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
                  License Plate
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
                  Set as default vehicle
                </label>
                <div className="vehicle-form-actions">
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? "Saving..." : editingVehicle ? "Update" : "Add"}
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
