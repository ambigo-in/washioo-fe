import type { Address } from "../types/apiTypes";

type AddressLike = Pick<
  Address,
  | "address_line1"
  | "address_line2"
  | "landmark"
  | "city"
  | "state"
  | "pincode"
  | "country"
>;

export const formatAddress = (address?: AddressLike | null) => {
  if (!address) return "Address not available";

  return [
    address.address_line1,
    address.address_line2,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(", ");
};
