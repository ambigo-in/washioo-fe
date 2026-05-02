import { apiRequest, withQuery, type PaginationParams } from "./client";
import type { ServiceCategory } from "../types/apiTypes";

export const fetchServices = (params: PaginationParams = {}) =>
  apiRequest<{ message: string; services: ServiceCategory[]; total: number }>(
    withQuery("/services/", { limit: 50, offset: 0, ...params }),
  );

export const fetchService = (serviceId: string) =>
  apiRequest<{ message: string; service: ServiceCategory }>(
    `/services/service-categories/${serviceId}`,
  );

