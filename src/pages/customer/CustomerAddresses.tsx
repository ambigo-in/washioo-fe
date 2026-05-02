import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../../api/addressApi";
import type { Address } from "../../types/apiTypes";
import "./CustomerAddresses.css";

interface AddressFormData {
  address_label: string;
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export default function CustomerAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    address_label: "",
    address_line1: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await fetchAddresses();
      setAddresses(data.addresses);
    } catch (err) {
      setError("Failed to load addresses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await updateAddress(String(editingAddress.id), formData);
      } else {
        await createAddress(formData);
      }
      setShowForm(false);
      setEditingAddress(null);
      setFormData({
        address_label: "",
        address_line1: "",
        city: "",
        state: "",
        pincode: "",
        is_default: false,
      });
      loadAddresses();
    } catch (err) {
      setError("Failed to save address");
      console.error(err);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      address_label: address.address_label || "",
      address_line1: address.address_line1 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      is_default: address.is_default,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }
    try {
      await deleteAddress(id);
      loadAddresses();
    } catch (err) {
      setError("Failed to delete address");
      console.error(err);
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await updateAddress(String(address.id), { is_default: true });
      loadAddresses();
    } catch (err) {
      setError("Failed to set default address");
      console.error(err);
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
              setFormData({
                address_label: "",
                address_line1: "",
                city: "",
                state: "",
                pincode: "",
                is_default: false,
              });
            }}
          >
            + Add New Address
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
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
                <p className="address-text">{address.address_line1}</p>
                <p className="address-text">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <div className="address-actions">
                  {!address.is_default && (
                    <button
                      className="btn-link"
                      onClick={() => handleSetDefault(address)}
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    className="btn-link"
                    onClick={() => handleEdit(address)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-link danger"
                    onClick={() => handleDelete(String(address.id))}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{editingAddress ? "Edit Address" : "Add New Address"}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Label (e.g., Home, Office)</label>
                  <input
                    type="text"
                    value={formData.address_label}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address_label: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address_line1: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.is_default}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_default: e.target.checked,
                          })
                        }
                      />
                      Set as default address
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingAddress ? "Update" : "Add"} Address
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
