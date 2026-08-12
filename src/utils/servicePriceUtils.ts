import type { ServiceCategory } from "../types/apiTypes";

export function formatCurrency(amount: number | null | undefined) {
  if (amount == null) return "";
  return `₹${amount.toLocaleString()}`;
}

export function getServicePriceLabel(service: ServiceCategory) {
  const base = formatCurrency(service.base_price);
  const variable = service.allow_extra_payment || !!service.max_extra_amount;
  return variable ? `Starting at ${base}` : base;
}

export function getServiceExtraPaymentNote(service: ServiceCategory) {
  if (!service.allow_extra_payment) return "";
  const parts: string[] = [];
  if (service.max_extra_amount) {
    parts.push(
      `Extra payment accepted up to ${formatCurrency(service.max_extra_amount)}`,
    );
  } else {
    parts.push("Extra payment may be accepted on-site");
  }
  if (service.extra_payment_instructions) {
    parts.push(service.extra_payment_instructions);
  }
  return parts.join(". ");
}

export default {
  formatCurrency,
  getServicePriceLabel,
  getServiceExtraPaymentNote,
};
