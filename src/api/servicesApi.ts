import { apiRequest } from "./client";
import type { ServiceCategory } from "../types/apiTypes";

export const fetchServices = () =>
  apiRequest<{ message: string; services: ServiceCategory[]; total: number }>(
    "/services/",
  );

export const fetchService = (serviceId: string) =>
  apiRequest<{ message: string; service: ServiceCategory }>(
    `/services/service-categories/${serviceId}`,
  );

