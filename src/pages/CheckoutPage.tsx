import React, { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createAddress, fetchAddresses } from "../api/addressApi";
import { createBooking } from "../api/bookingApi";
import { getApiErrorMessage } from "../api/client";
import Header from "../components/Header";
import type { Address, AddressPayload } from "../types/apiTypes";
import "../styles/checkout.css";

type CheckoutState = {
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number | null;
};

const emptyAddress: AddressPayload = {
  address_label: "Home",
  address_line1: "",
  address_line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  latitude: null,
  longitude: null,
  is_default: false,
};

const today = new Date().toISOString().split("T")[0];

const compactAddressPayload = (payload: AddressPayload): AddressPayload => ({
  address_label: payload.address_label?.trim() || "Home",
  address_line1: payload.address_line1.trim(),
  address_line2: payload.address_line2?.trim() || null,
  landmark: payload.landmark?.trim() || null,
  city: payload.city?.trim() || null,
  state: payload.state?.trim() || null,
  pincode: payload.pincode?.trim() || null,
  country: payload.country?.trim() || "India",
  latitude: payload.latitude ?? null,
  longitude: payload.longitude ?? null,
  is_default: payload.is_default ?? false,
});

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const serviceData = useMemo(
    () => location.state as CheckoutState | null,
    [location.state],
  );

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<AddressPayload>(emptyAddress);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (!serviceData?.serviceId) {
      navigate("/bookings", { replace: true });
    }
  }, [navigate, serviceData?.serviceId]);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await fetchAddresses();
        setAddresses(data.addresses || []);
        const defaultAddress =
          data.addresses?.find((address) => address.is_default) ||
          data.addresses?.[0];

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else {
          setShowForm(true);
        }
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, []);

  const updateForm = (field: keyof AddressPayload, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setError("");
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setSuccess("Location captured for this address.");
      },
      () => setError("Unable to capture location. You can still save manually."),
    );
  };

  const handleCreateAddress = async (event: FormEvent) => {
    event.preventDefault();
    const payload = compactAddressPayload(formData);

    if (!payload.address_line1) {
      setError("Address line 1 is required.");
      return;
    }

    setSavingAddress(true);
    setError("");
    setSuccess("");

    try {
      const response = await createAddress(payload);
      const nextAddresses = [response.address, ...addresses];
      setAddresses(nextAddresses);
      setSelectedAddressId(response.address.id);
      setFormData(emptyAddress);
      setShowForm(false);
      setSuccess("Address saved.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSavingAddress(false);
    }
  };

  const handleBooking = async () => {
    if (!serviceData) return;

    if (!selectedAddressId) {
      setError("Choose or add an address before booking.");
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      setError("Choose a service date and time.");
      return;
    }

    setBooking(true);
    setError("");
    setSuccess("");

    try {
      await createBooking({
        service_category_id: serviceData.serviceId,
        address_id: selectedAddressId,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        special_instructions: instructions.trim() || null,
      });
      navigate("/my-bookings", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBooking(false);
    }
  };

  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId,
  );

  return (
    <>
      <Header />
      <section className="checkout-page">
        <div className="checkout-heading">
          <span>CONFIRM BOOKING</span>
          <h1>Checkout</h1>
        </div>

        <div className="checkout-layout">
          <div className="address-section">
            <h2>Select Address</h2>

            {error && <p className="form-alert error">{error}</p>}
            {success && <p className="form-alert success">{success}</p>}

            {loading ? (
              <p>Loading addresses...</p>
            ) : addresses.length ? (
              <div className="address-list">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    className={`address-card ${
                      selectedAddressId === address.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedAddressId(address.id)}
                    type="button"
                  >
                    <h3>{address.address_label || "Saved address"}</h3>
                    <p>
                      {address.address_line1}
                      {address.city ? `, ${address.city}` : ""}
                    </p>
                    <span>
                      {[address.state, address.pincode, address.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p>No saved addresses yet.</p>
            )}

            <button type="button" onClick={() => setShowForm((value) => !value)}>
              {showForm ? "Close Address Form" : "+ Add New Address"}
            </button>

            {showForm && (
              <form className="address-form" onSubmit={handleCreateAddress}>
                <input
                  placeholder="Label"
                  value={formData.address_label || ""}
                  onChange={(event) => updateForm("address_label", event.target.value)}
                />
                <input
                  placeholder="Address Line 1"
                  value={formData.address_line1}
                  onChange={(event) => updateForm("address_line1", event.target.value)}
                />
                <input
                  placeholder="Address Line 2"
                  value={formData.address_line2 || ""}
                  onChange={(event) => updateForm("address_line2", event.target.value)}
                />
                <input
                  placeholder="Landmark"
                  value={formData.landmark || ""}
                  onChange={(event) => updateForm("landmark", event.target.value)}
                />
                <div className="form-row">
                  <input
                    placeholder="City"
                    value={formData.city || ""}
                    onChange={(event) => updateForm("city", event.target.value)}
                  />
                  <input
                    placeholder="State"
                    value={formData.state || ""}
                    onChange={(event) => updateForm("state", event.target.value)}
                  />
                </div>
                <div className="form-row">
                  <input
                    placeholder="Pincode"
                    value={formData.pincode || ""}
                    onChange={(event) => updateForm("pincode", event.target.value)}
                  />
                  <label className="checkbox-row">
                    <input
                      checked={!!formData.is_default}
                      onChange={(event) =>
                        updateForm("is_default", event.target.checked)
                      }
                      type="checkbox"
                    />
                    Default
                  </label>
                </div>
                <button onClick={getLiveLocation} type="button">
                  Use Live Location
                </button>
                <button disabled={savingAddress} type="submit">
                  {savingAddress ? "Saving..." : "Save Address"}
                </button>
              </form>
            )}
          </div>

          <aside className="booking-summary">
            <h2>{serviceData?.serviceName || "Selected service"}</h2>
            <div className="summary-price">Rs. {serviceData?.price || 0}</div>
            <p>{serviceData?.duration || 0} mins estimated</p>

            {selectedAddress && (
              <div className="selected-address-summary">
                <span>Service address</span>
                <strong>{selectedAddress.address_label || "Address"}</strong>
                <p>{selectedAddress.address_line1}</p>
              </div>
            )}

            <label>
              Date
              <input
                min={today}
                type="date"
                value={scheduledDate}
                onChange={(event) => setScheduledDate(event.target.value)}
              />
            </label>
            <label>
              Time
              <input
                type="time"
                value={scheduledTime}
                onChange={(event) => setScheduledTime(event.target.value)}
              />
            </label>
            <textarea
              placeholder="Special instructions optional"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
            />

            <button disabled={booking} onClick={handleBooking} type="button">
              {booking ? "Confirming..." : "Confirm Booking"}
            </button>
          </aside>
        </div>
      </section>
    </>
  );
};

export default CheckoutPage;

