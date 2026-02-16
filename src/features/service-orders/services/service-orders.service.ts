import type {
  ServiceOrdersApiResponse,
  GetServiceOrdersParams,
} from "../types";
import { getAuthHeaders } from "@/shared/utils/api";

import { API_BASE_URL } from '@/shared/constants'

export const serviceOrdersService = {
  async getServiceOrders(
    params: GetServiceOrdersParams = {},
  ): Promise<ServiceOrdersApiResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) {
      queryParams.append("page", params.page.toString());
    }

    if (params.per_page) {
      queryParams.append("per_page", params.per_page.toString());
    }

    if (params.search) {
      queryParams.append("search", params.search.trim());
    }

    if (params.technicianId) {
      queryParams.append("technicianId", params.technicianId);
    }

    if (params.fromDate) {
      queryParams.append("fromDate", params.fromDate);
    }

    if (params.toDate) {
      queryParams.append("toDate", params.toDate);
    }

    const url = `${API_BASE_URL}/service-orders/materials${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Error al obtener órdenes de servicio",
      }));
      const error: Error & { status?: number } = new Error(
        errorData.message || "Error al obtener órdenes de servicio",
      );
      error.status = response.status;
      throw error;
    }

    return response.json();
  },
};
