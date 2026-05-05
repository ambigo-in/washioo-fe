import { apiRequest, withQuery, type PaginationParams } from "./client";
import type { Address, AddressPayload } from "../types/apiTypes";

export const fetchAddresses = (params: PaginationParams = {}) =>
  apiRequest<{ message: string; addresses: Address[]; total: number }>(
    withQuery("/services/addresses", { limit: 50, offset: 0, ...params }),
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
  apiRequest<{
    message: string;
    address_id?: string;
    soft_deleted?: boolean;
    hard_deleted?: boolean;
  }>(
    `/services/address/${addressId}`,
    {
      method: "DELETE",
      auth: true,
    },
  );

