import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import OpenInMapsButton from "../../components/OpenInMapsButton";
import { LoadingButton } from "../../components/ui";
import type { Address, AddressPayload } from "../../types/apiTypes";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  loadAddresses,
  patchAddress,
  removeAddress,
  saveAddress,
} from "../../store/slices/customerSlice";
import {
  getCurrentCoordinates,
  locationAccuracyMessage,
  type LocationError,
} from "../../utils/locationUtils";
import { formatAddress } from "../../utils/addressUtils";
import "./CustomerAddresses.css";

interface AddressFormData {
  address_label: string;
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}

type AddressFieldErrors = Partial<
  Record<
    | "address_label"
    | "address_line1"
    | "city"
    | "state"
    | "pincode"
    | "location",
    string
  >
>;

const emptyFormData: AddressFormData = {
  address_label: "",
  address_line1: "",
  city: "",
  state: "",
  pincode: "",
  latitude: null,
  longitude: null,
  is_default: false,
};

export default function CustomerAddresses() {
  const dispatch = useAppDispatch();
  const { addresses, loading } = useAppSelector((state) => state.customer);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [locating, setLocating] = useState(false);
  const [success, setSuccess] = useState("");
  const [locationInstructions, setLocationInstructions] = useState("");
  const [formData, setFormData] = useState<AddressFormData>(emptyFormData);
  const [fieldErrors, setFieldErrors] = useState<AddressFieldErrors>({});

  useEffect(() => {
    dispatch(loadAddresses())
      .unwrap()
      .catch(() => setError("Failed to load addresses"));
  }, [dispatch]);

  useEffect(() => {
    const firstError = document.querySelector<HTMLElement>(
      ".modal-content [data-field-error='true']",
    );
    firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    firstError?.focus?.();
  }, [fieldErrors]);

  const updateFormField = (
    field: keyof AddressFormData,
    value: string | boolean | number | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextFieldErrors: AddressFieldErrors = {};
    if (!formData.address_label.trim()) {
      nextFieldErrors.address_label = "Add a simple label like Home or Office.";
    }
    if (!formData.address_line1.trim()) {
      nextFieldErrors.address_line1 = "Street address is required.";
    }
    if (!formData.city.trim()) {
      nextFieldErrors.city = "City is required.";
    }
    if (!formData.state.trim()) {
      nextFieldErrors.state = "State is required.";
    }
    if (!formData.pincode.trim()) {
      nextFieldErrors.pincode = "Pincode is required.";
    }
    if (formData.latitude == null || formData.longitude == null) {
      nextFieldErrors.location = "Tap Use My Live Location before saving.";
    }

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      setError("Fix the highlighted address fields.");
      return;
    }

    setFieldErrors({});
    setError("");
    const payload: AddressPayload = {
      ...formData,
      country: "India",
      location_verified: true,
    };

    try {
      if (editingAddress) {
        await dispatch(
          patchAddress({
            addressId: String(editingAddress.id),
            changes: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(saveAddress(payload)).unwrap();
      }
      setShowForm(false);
      setEditingAddress(null);
      setFormData(emptyFormData);
      setSuccess("Address saved.");
    } catch (err) {
      setError("Failed to save address");
      console.error(err);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFieldErrors({});
    setError("");
    setFormData({
      address_label: address.address_label || "",
      address_line1: address.address_line1 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      latitude: address.latitude ?? null,
      longitude: address.longitude ?? null,
      is_default: address.is_default,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this address?")) {
      return;
    }
    try {
      await dispatch(removeAddress(id)).unwrap();
      setSuccess("Address removed.");
    } catch (err) {
      setError("Failed to remove address");
      console.error(err);
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await dispatch(
        patchAddress({
          addressId: String(address.id),
          changes: { is_default: true },
        }),
      ).unwrap();
    } catch (err) {
      setError("Failed to set default address");
      console.error(err);
    }
  };

  const handleUseLiveLocation = async () => {
    setLocating(true);
    setError("");
    setSuccess("");
    setLocationInstructions("");

    try {
      const coordinates = await getCurrentCoordinates();

      setFormData((prev) => ({
        ...prev,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }));

      setFieldErrors((prev) => ({ ...prev, location: undefined }));
      setSuccess(locationAccuracyMessage(coordinates.accuracy));
    } catch (err) {
      if (err && typeof err === "object" && "type" in err) {
        const locationError = err as LocationError;
        setError(locationError.message);
        if (locationError.instructions) {
          setLocationInstructions(locationError.instructions);
        }
      } else {
        setError(
          err instanceof Error ? err.message : "Unable to capture location.",
        );
      }
    } finally {
      setLocating(false);
    }
  };

  return (
    <DashboardLayout title="My Addresses">
      <div className="addresses-page">
        <div className="page-header">
          <h2>Manage Your Addresses</h2>
          <button
            className="btn-primary"
            onClick={() => {
              setShowForm(true);
              setEditingAddress(null);
              setFormData(emptyFormData);
              setFieldErrors({});
              setError("");
            }}
          >
            + Add New Address
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {locationInstructions && (
          <div className="info-message">
            <p>{locationInstructions}</p>
          </div>
        )}
        {success && <div className="success-message">{success}</div>}

        {loading && addresses.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="empty-state">
            <p>No addresses added yet.</p>
            <p>Add your first address to get started!</p>
          </div>
        ) : (
          <div className="addresses-grid">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`address-card ${address.is_default ? "default" : ""}`}
              >
                {address.is_default && (
                  <span className="default-badge">Default</span>
                )}
                <h3>{address.address_label || "Address"}</h3>
                <p className="address-text">{formatAddress(address)}</p>
                {address.latitude != null && address.longitude != null && (
                  <div className="address-location-link">
                    <OpenInMapsButton
                      latitude={address.latitude}
                      longitude={address.longitude}
                      label="Open address location"
                    />
                  </div>
                )}
                <div className="address-actions">
                  {!address.is_default && (
                    <LoadingButton
                      className="btn-link"
                      isLoading={loading}
                      loadingText="Saving..."
                      onClick={() => handleSetDefault(address)}
                    >
                      Set as Default
                    </LoadingButton>
                  )}
                  <button
                    className="btn-link"
                    onClick={() => handleEdit(address)}
                  >
                    Edit
                  </button>
                  <LoadingButton
                    className="btn-link danger"
                    isLoading={loading}
                    loadingText="Removing..."
                    onClick={() => handleDelete(String(address.id))}
                  >
                    Remove address
                  </LoadingButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{editingAddress ? "Edit Address" : "Add New Address"}</h3>
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label>Label (e.g., Home, Office)</label>
                  <input
                    type="text"
                    value={formData.address_label}
                    onChange={(e) =>
                      updateFormField("address_label", e.target.value)
                    }
                    aria-invalid={!!fieldErrors.address_label}
                    className={
                      fieldErrors.address_label ? "field-invalid" : undefined
                    }
                    data-field-error={
                      fieldErrors.address_label ? "true" : undefined
                    }
                  />
                  {fieldErrors.address_label && (
                    <p className="field-error">{fieldErrors.address_label}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) =>
                      updateFormField("address_line1", e.target.value)
                    }
                    aria-invalid={!!fieldErrors.address_line1}
                    className={
                      fieldErrors.address_line1 ? "field-invalid" : undefined
                    }
                    data-field-error={
                      fieldErrors.address_line1 ? "true" : undefined
                    }
                  />
                  {fieldErrors.address_line1 && (
                    <p className="field-error">{fieldErrors.address_line1}</p>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormField("city", e.target.value)}
                      aria-invalid={!!fieldErrors.city}
                      className={fieldErrors.city ? "field-invalid" : undefined}
                      data-field-error={fieldErrors.city ? "true" : undefined}
                    />
                    {fieldErrors.city && (
                      <p className="field-error">{fieldErrors.city}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateFormField("state", e.target.value)}
                      aria-invalid={!!fieldErrors.state}
                      className={
                        fieldErrors.state ? "field-invalid" : undefined
                      }
                      data-field-error={fieldErrors.state ? "true" : undefined}
                    />
                    {fieldErrors.state && (
                      <p className="field-error">{fieldErrors.state}</p>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) =>
                        updateFormField("pincode", e.target.value)
                      }
                      aria-invalid={!!fieldErrors.pincode}
                      className={
                        fieldErrors.pincode ? "field-invalid" : undefined
                      }
                      data-field-error={
                        fieldErrors.pincode ? "true" : undefined
                      }
                    />
                    {fieldErrors.pincode && (
                      <p className="field-error">{fieldErrors.pincode}</p>
                    )}
                  </div>
                  <div className="form-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.is_default}
                        onChange={(e) =>
                          updateFormField("is_default", e.target.checked)
                        }
                      />
                      Set as default address
                    </label>
                  </div>
                </div>
                <LoadingButton
                  type="button"
                  className="btn-location"
                  disabled={locating}
                  isLoading={false}
                  onClick={handleUseLiveLocation}
                >
                  {locating ? "Capturing Location..." : "Use My Live Location"}
                </LoadingButton>
                {fieldErrors.location && (
                  <div
                    className="field-error-box"
                    data-field-error="true"
                    tabIndex={-1}
                  >
                    {fieldErrors.location}
                  </div>
                )}
                {formData.latitude != null && formData.longitude != null && (
                  <div className="location-preview">
                    Location captured. It will be used for directions.
                  </div>
                )}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="submit"
                    className="btn-primary"
                    isLoading={loading}
                    loadingText="Saving address..."
                  >
                    {editingAddress ? "Update" : "Add"} Address
                  </LoadingButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
