import { apiRequest } from "./client";
import type { Address, AddressPayload } from "../types/apiTypes";

export const fetchAddresses = () =>
  apiRequest<{ message: string; addresses: Address[]; total: number }>(
    "/services/addresses",
    { auth: true },
  );

export const createAddress = (payload: AddressPayload) =>
  apiRequest<{ message: string; address: Address }>("/services/address", {
    method: "POST",
    auth: true,
    body: payload,
  });

export const updateAddress = (addressId: string, payload: Partial<AddressPayload>) =>
  apiRequest<{ message: string; address: Address }>(
    `/services/address/${addressId}`,
    {
      method: "PATCH",
      auth: true,
      body: payload,
    },
  );

export const deleteAddress = (addressId: string) =>
  apiRequest<{ message: string; address_id: string }>(
    `/services/address/${addressId}`,
    {
      method: "DELETE",
      auth: true,
    },
  );

