import { apiRequest } from "./client";
import type { CustomerVehicle, CustomerVehiclePayload } from "../types/apiTypes";

export const fetchCustomerVehicles = () =>
  apiRequest<{
    message: string;
    vehicles: CustomerVehicle[];
    total: number;
  }>("/customer/vehicles", { auth: true });

export const createCustomerVehicle = (payload: CustomerVehiclePayload) =>
  apiRequest<{ message: string; vehicle: CustomerVehicle }>("/customer/vehicles", {
    method: "POST",
    auth: true,
    body: payload,
  });

export const updateCustomerVehicle = (
  vehicleId: string,
  payload: Partial<CustomerVehiclePayload>,
) =>
  apiRequest<{ message: string; vehicle: CustomerVehicle }>(
    `/customer/vehicles/${vehicleId}`,
    {
      method: "PATCH",
      auth: true,
      body: payload,
    },
  );

export const deleteCustomerVehicle = (vehicleId: string) =>
  apiRequest<{ message: string; vehicle_id: string }>(
    `/customer/vehicles/${vehicleId}`,
    {
      method: "DELETE",
      auth: true,
    },
  );
