import type {
  MovementsApiResponse,
  GetMovementsParams,
  MovementStats,
  CreateTransferRequest,
  CreateTransferResponse,
} from "../types/movements.types";
import { getAuthHeaders } from "@/shared/utils/api";

import { API_BASE_URL } from '@/shared/constants'

export const movementsService = {
  async getMovements(
    params: GetMovementsParams = {},
  ): Promise<MovementsApiResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) {
      queryParams.append("page", params.page.toString());
    }

    if (params.per_page) {
      queryParams.append("per_page", params.per_page.toString());
    }

    if (params.materialId) {
      queryParams.append("materialId", params.materialId);
    }

    if (params.locationId) {
      queryParams.append("locationId", params.locationId);
    }

    if (params.fromLocationId) {
      queryParams.append("fromLocationId", params.fromLocationId);
    }

    if (params.toLocationId) {
      queryParams.append("toLocationId", params.toLocationId);
    }

    if (params.technicianId) {
      queryParams.append("technicianId", params.technicianId);
    }

    if (params.type) {
      queryParams.append("type", params.type);
    }

    if (params.fromDate) {
      queryParams.append("fromDate", params.fromDate);
    }

    if (params.toDate) {
      queryParams.append("toDate", params.toDate);
    }

    const url = `${API_BASE_URL}/inventory/movements${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Error al obtener movimientos",
      }));
      const error: Error & { status?: number } = new Error(
        errorData.message || "Error al obtener movimientos",
      );
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  async getMovementStats(): Promise<MovementStats> {
    const response = await fetch(`${API_BASE_URL}/inventory/movements/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Error al obtener estadísticas de movimientos",
      }));
      const error: Error & { status?: number } = new Error(
        errorData.message || "Error al obtener estadísticas de movimientos",
      );
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  async createTransfer(
    payload: CreateTransferRequest,
  ): Promise<CreateTransferResponse> {
    const response = await fetch(`${API_BASE_URL}/inventory/transfer`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || "Error al crear transferencia",
      );
      error.status = response.status;
      throw error;
    }

    return data as CreateTransferResponse;
  },
};
