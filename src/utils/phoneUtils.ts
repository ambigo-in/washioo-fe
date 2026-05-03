const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

export const normalizeIndianPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
};

export const isValidIndianPhone = (value: string) =>
  INDIAN_MOBILE_PATTERN.test(normalizeIndianPhone(value));

export const formatIndianPhoneForDisplay = (value?: string | null) => {
  if (!value) return "";
  const phone = normalizeIndianPhone(value);
  if (!INDIAN_MOBILE_PATTERN.test(phone)) return value;
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
};
