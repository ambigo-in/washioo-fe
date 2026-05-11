import React, { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { LoadingButton } from "../components/ui";
import { fetchCustomerVehicles } from "../api/vehicleApi";
import type { AddressPayload, CustomerVehicle } from "../types/apiTypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  bookService,
  loadAddresses,
  saveAddress,
} from "../store/slices/customerSlice";
import {
  getCurrentCoordinates,
  locationAccuracyMessage,
  type LocationError,
} from "../utils/locationUtils";
import { formatAddress } from "../utils/addressUtils";
import {
  addLocalDays,
  formatDisplayTime,
  getLocalDateInputValue,
  getLocalTimeInputValue,
  getMinTimeForDate,
  isPastSchedule,
} from "../utils/dateTimeUtils";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/checkout.css";

type CheckoutState = {
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number | null;
};

type CheckoutFieldErrors = Partial<
  Record<"address_line1" | "location" | "selectedAddress" | "schedule", string>
>;

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

const quickTimeOptions = ["now", "09:00", "14:00", "18:00"];

const compactAddressPayload = (payload: AddressPayload): AddressPayload => ({
  address_label: payload.address_label?.trim() || "Home",
  address_line1: payload.address_line1.trim(),
  address_line2: payload.address_line2?.trim() || null,
  landmark: payload.landmark?.trim() || null,
  city: payload.city?.trim() || null,
  state: payload.state?.trim() || null,
  pincode: payload.pincode?.trim() || null,
  country: payload.country?.trim() || "India",
  latitude: payload.latitude,
  longitude: payload.longitude,
  location_verified: payload.latitude != null && payload.longitude != null,
  is_default: payload.is_default ?? false,
});

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const serviceData = useMemo(
    () => location.state as CheckoutState | null,
    [location.state],
  );

  const dispatch = useAppDispatch();
  const { addresses, loading } = useAppSelector((state) => state.customer);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locationInstructions, setLocationInstructions] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});

  const [formData, setFormData] = useState<AddressPayload>(emptyAddress);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [instructions, setInstructions] = useState("");
  const today = getLocalDateInputValue();
  const tomorrow = getLocalDateInputValue(addLocalDays(1));
  const minScheduledTime = scheduledDate ? getMinTimeForDate(scheduledDate) : undefined;

  const hasUnsavedAddress = !!(
    formData.address_line1.trim() ||
    formData.address_line2?.trim() ||
    formData.landmark?.trim() ||
    formData.city?.trim() ||
    formData.state?.trim() ||
    formData.pincode?.trim() ||
    formData.latitude != null ||
    formData.longitude != null
  );

  useEffect(() => {
    if (!serviceData?.serviceId) {
      navigate("/bookings", { replace: true });
    }
  }, [navigate, serviceData?.serviceId]);

  useEffect(() => {
    dispatch(loadAddresses())
      .unwrap()
      .catch((err) => setError(String(err)));
  }, [dispatch]);

  useEffect(() => {
    fetchCustomerVehicles()
      .then((response) => setVehicles(response.vehicles))
      .catch(() => setVehicles([]));
  }, []);

  useEffect(() => {
    const defaultAddress =
      addresses.find((address) => address.is_default) || addresses[0];

    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress.id);
    } else if (!defaultAddress && !loading) {
      setShowForm(true);
    }
  }, [addresses, loading, selectedAddressId]);

  useEffect(() => {
    const defaultVehicle =
      vehicles.find((vehicle) => vehicle.is_default) || vehicles[0];
    if (defaultVehicle && !selectedVehicleId) {
      setSelectedVehicleId(defaultVehicle.id);
    }
  }, [vehicles, selectedVehicleId]);

  const updateForm = (field: keyof AddressPayload, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "address_line1") {
      setFieldErrors((prev) => ({ ...prev, address_line1: undefined }));
    }
  };

  useEffect(() => {
    const firstError = document.querySelector<HTMLElement>(
      ".checkout-page [data-field-error='true']",
    );
    firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    firstError?.focus?.();
  }, [fieldErrors]);

  const getLiveLocation = async () => {
    setLocating(true);
    setError("");
    setSuccess("");
    setLocationInstructions("");

    try {
      const coordinates = await getCurrentCoordinates();

      setFormData((prev) => ({
        ...prev,
        ...coordinates,
        location_verified: true,
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
          err instanceof Error ? err.message : t("address.unableCapture"),
        );
      }
    } finally {
      setLocating(false);
    }
  };

  const handleCreateAddress = async (event: FormEvent) => {
    event.preventDefault();
    const payload = compactAddressPayload(formData);
    const nextFieldErrors: CheckoutFieldErrors = {};

    if (!payload.address_line1) {
      nextFieldErrors.address_line1 = t("address.addressLine1Required");
    }

    if (payload.latitude == null || payload.longitude == null) {
      nextFieldErrors.location = t("address.locationBeforeSaving");
    }

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      setError(t("address.fixField"));
      return;
    }

    setFieldErrors({});
    setError("");
    setSuccess("");

    try {
      const response = await dispatch(saveAddress(payload)).unwrap();
      setSelectedAddressId(response.address.id);
      setFormData(emptyAddress);
      setShowForm(false);
      setSuccess(t("address.addressSaved"));
    } catch (err) {
      setError(String(err));
    }
  };

  const saveAddressIfNeeded = async (): Promise<string | null> => {
    if (!hasUnsavedAddress) {
      return selectedAddressId || null;
    }

    const payload = compactAddressPayload(formData);
    const nextFieldErrors: CheckoutFieldErrors = {};

    if (!payload.address_line1) {
      nextFieldErrors.address_line1 = t("address.addressLine1Required");
    }

    if (payload.latitude == null || payload.longitude == null) {
      nextFieldErrors.location = t("address.locationBeforeBooking");
    }

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      setError(t("booking.fixBeforeBooking"));
      throw new Error("Address validation failed");
    }

    const response = await dispatch(saveAddress(payload)).unwrap();
    setSelectedAddressId(response.address.id);
    setFormData(emptyAddress);
    setShowForm(false);
    setSuccess(t("address.addressSavedSelected"));
    return response.address.id;
  };

  const handleBooking = async () => {
    if (!serviceData) return;

    const nextFieldErrors: CheckoutFieldErrors = {};
    let bookingAddressId: string | null = selectedAddressId || null;

    try {
      if (showForm && hasUnsavedAddress) {
        bookingAddressId = await saveAddressIfNeeded();
      }
    } catch {
      return;
    }

    if (!bookingAddressId) {
      nextFieldErrors.selectedAddress =
        t("booking.addressRequired");
    }

    if (!scheduledDate || !scheduledTime) {
      nextFieldErrors.schedule = t("booking.scheduleRequired");
    } else if (isPastSchedule(scheduledDate, scheduledTime)) {
      nextFieldErrors.schedule = t("booking.scheduleFutureRequired");
    }

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors((prev) => ({ ...prev, ...nextFieldErrors }));
      setError(t("booking.fixBookingDetail"));
      return;
    }

    if (!bookingAddressId) return;

    setFieldErrors({});
    setError("");
    setSuccess("");

    try {
      await dispatch(
        bookService({
          service_category_id: serviceData.serviceId,
          address_id: bookingAddressId,
          vehicle_id: selectedVehicleId || null,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          special_instructions: instructions.trim() || null,
        }),
      ).unwrap();
      navigate("/my-bookings", { replace: true });
    } catch (err) {
      setError(String(err));
    }
  };

  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId,
  );
  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId,
  );

  return (
    <>
      <Header />
      <section className="checkout-page">
        <div className="checkout-heading">
          <span>{t("booking.confirmBookingKicker")}</span>
          <h1>{t("booking.checkout")}</h1>
        </div>

        <div className="checkout-layout">
          <div className="address-section">
            <h2>{t("booking.selectAddress")}</h2>

            {error && <p className="form-alert error">{error}</p>}
            {locationInstructions && (
              <div className="form-alert info">
                <p>{locationInstructions}</p>
              </div>
            )}
            {success && <p className="form-alert success">{success}</p>}

            {loading ? (
              <p>{t("address.loading")}</p>
            ) : addresses.length ? (
              <div className="address-list">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    className={`address-card ${
                      selectedAddressId === address.id ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedAddressId(address.id);
                      setFieldErrors((prev) => ({
                        ...prev,
                        selectedAddress: undefined,
                      }));
                    }}
                    type="button"
                  >
                    <h3>{address.address_label || t("address.selectedFallback")}</h3>
                    <p>{formatAddress(address)}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p>{t("address.noSaved")}</p>
            )}
            {fieldErrors.selectedAddress && (
              <p
                className="field-error-box"
                data-field-error="true"
                tabIndex={-1}
              >
                {fieldErrors.selectedAddress}
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
            >
              {showForm ? t("address.closeForm") : t("address.addNewWithPlus")}
            </button>

            {showForm && (
              <form className="address-form" onSubmit={handleCreateAddress}>
                <input
                  placeholder={t("address.label")}
                  value={formData.address_label || ""}
                  onChange={(event) =>
                    updateForm("address_label", event.target.value)
                  }
                />
                <input
                  placeholder={t("address.addressLine1")}
                  value={formData.address_line1}
                  onChange={(event) =>
                    updateForm("address_line1", event.target.value)
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
                <input
                  placeholder={t("address.line2")}
                  value={formData.address_line2 || ""}
                  onChange={(event) =>
                    updateForm("address_line2", event.target.value)
                  }
                />
                <input
                  placeholder={t("common.landmark")}
                  value={formData.landmark || ""}
                  onChange={(event) =>
                    updateForm("landmark", event.target.value)
                  }
                />
                <div className="form-row">
                  <input
                    placeholder={t("common.city")}
                    value={formData.city || ""}
                    onChange={(event) => updateForm("city", event.target.value)}
                  />
                  <input
                    placeholder={t("common.state")}
                    value={formData.state || ""}
                    onChange={(event) =>
                      updateForm("state", event.target.value)
                    }
                  />
                </div>
                <div className="form-row">
                  <input
                    placeholder={t("common.pincode")}
                    value={formData.pincode || ""}
                    onChange={(event) =>
                      updateForm("pincode", event.target.value)
                    }
                  />
                  <label className="checkbox-row">
                    <input
                      checked={!!formData.is_default}
                      onChange={(event) =>
                        updateForm("is_default", event.target.checked)
                      }
                      type="checkbox"
                    />
                    {t("common.default")}
                  </label>
                </div>
                <button
                  disabled={locating}
                  onClick={getLiveLocation}
                  type="button"
                >
                  {locating ? t("address.capturingLocation") : t("address.useLiveLocation")}
                </button>
                {fieldErrors.location && (
                  <p
                    className="field-error-box"
                    data-field-error="true"
                    tabIndex={-1}
                  >
                    {fieldErrors.location}
                  </p>
                )}
                {formData.latitude != null && formData.longitude != null && (
                  <p className="location-captured">
                    {t("address.locationCapturedService")}
                  </p>
                )}
                <LoadingButton
                  isLoading={loading}
                  loadingText={t("address.savingAddress")}
                  type="submit"
                >
                  {t("address.saveAddress")}
                </LoadingButton>
              </form>
            )}
          </div>

          <aside className="booking-summary">
            <h2>{serviceData?.serviceName || t("booking.selectedService")}</h2>
            <div className="summary-price">Rs. {serviceData?.price || 0}</div>
            <p>{serviceData?.duration || 0} mins estimated</p>

            {selectedAddress && (
              <div className="selected-address-summary">
                <span>{t("booking.serviceAddress")}</span>
                <strong>{selectedAddress.address_label || t("common.address")}</strong>
                <p>{formatAddress(selectedAddress)}</p>
              </div>
            )}

            {vehicles.length > 0 && (
              <label>
                {t("common.vehicle")}
                <select
                  value={selectedVehicleId}
                  onChange={(event) => setSelectedVehicleId(event.target.value)}
                >
                  <option value="">{t("booking.noVehicle")}</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {[vehicle.make, vehicle.model]
                        .filter(Boolean)
                        .join(" ") || vehicle.vehicle_type}
                      {vehicle.license_plate
                        ? ` - ${vehicle.license_plate}`
                        : ""}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {selectedVehicle && (
              <div className="selected-address-summary">
                <span>{t("common.vehicle")}</span>
                <strong>
                  {[selectedVehicle.make, selectedVehicle.model]
                    .filter(Boolean)
                    .join(" ") || selectedVehicle.vehicle_type}
                </strong>
                <p>{selectedVehicle.license_plate || t("booking.noPlate")}</p>
              </div>
            )}

            <div className="quick-schedule-row">
              <button
                type="button"
                onClick={() => {
                  setScheduledDate(today);
                  if (scheduledTime && isPastSchedule(today, scheduledTime)) {
                    setScheduledTime(getLocalTimeInputValue());
                  }
                  setFieldErrors((prev) => ({ ...prev, schedule: undefined }));
                }}
              >
                {t("booking.today")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setScheduledDate(tomorrow);
                  setFieldErrors((prev) => ({ ...prev, schedule: undefined }));
                }}
              >
                {t("booking.tomorrow")}
              </button>
            </div>
            <label>
              {t("common.date")}
              <input
                min={today}
                type="date"
                value={scheduledDate}
                onChange={(event) => {
                  const nextDate = event.target.value;
                  setScheduledDate(nextDate);
                  if (
                    scheduledTime &&
                    isPastSchedule(nextDate, scheduledTime)
                  ) {
                    setScheduledTime(getLocalTimeInputValue());
                  }
                  setFieldErrors((prev) => ({ ...prev, schedule: undefined }));
                }}
                aria-invalid={!!fieldErrors.schedule}
                className={fieldErrors.schedule ? "field-invalid" : undefined}
                data-field-error={fieldErrors.schedule ? "true" : undefined}
              />
            </label>
            <div className="quick-schedule-row">
              {quickTimeOptions.map((timeOption) => (
                <button
                  key={timeOption}
                  type="button"
                  disabled={
                    timeOption !== "now" &&
                    isPastSchedule(scheduledDate || today, timeOption)
                  }
                  onClick={() => {
                    setScheduledTime(
                      timeOption === "now" ? getLocalTimeInputValue() : timeOption,
                    );
                    if (!scheduledDate) {
                      setScheduledDate(today);
                    }
                    setFieldErrors((prev) => ({
                      ...prev,
                      schedule: undefined,
                    }));
                  }}
                >
                  {timeOption === "now"
                    ? t("booking.now")
                    : formatDisplayTime(timeOption)}
                </button>
              ))}
            </div>
            <label>
              {t("common.time")}
              <input
                type="time"
                min={minScheduledTime}
                value={scheduledTime}
                onChange={(event) => {
                  setScheduledTime(event.target.value);
                  setFieldErrors((prev) => ({ ...prev, schedule: undefined }));
                }}
                aria-invalid={!!fieldErrors.schedule}
                className={fieldErrors.schedule ? "field-invalid" : undefined}
              />
            </label>
            {fieldErrors.schedule && (
              <p className="field-error">{fieldErrors.schedule}</p>
            )}
            <textarea
              placeholder={t("booking.specialInstructionsOptional")}
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
            />

            <LoadingButton
              isLoading={loading}
              loadingText={t("booking.confirming")}
              onClick={handleBooking}
              type="button"
            >
              {t("booking.confirmBooking")}
            </LoadingButton>
          </aside>
        </div>
      </section>
    </>
  );
};

export default CheckoutPage;
