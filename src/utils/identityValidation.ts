export const normalizeAadhaarNumber = (value: string) =>
  value.replace(/\D/g, "");

export const normalizeDrivingLicenseNumber = (value: string) =>
  value.trim().toUpperCase().replace(/\s+/g, "");

export const isValidAadhaarNumber = (value: string) =>
  /^\d{12}$/.test(normalizeAadhaarNumber(value));

export const isValidDrivingLicenseNumber = (value: string) => {
  const normalized = normalizeDrivingLicenseNumber(value);
  return !normalized || /^[A-Z0-9]{15,16}$/.test(normalized);
};
