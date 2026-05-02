import { apiRequest, withQuery, type PaginationParams } from "./client";
import type { Address, AddressPayload } from "../types/apiTypes";

export const fetchAddresses = (params: PaginationParams = {}) =>
  apiRequest<{ message: string; addresses: Address[]; total: number }>(
    withQuery("/services/addresses", params),
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
    `/customer/addresses/${addressId}`,
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

