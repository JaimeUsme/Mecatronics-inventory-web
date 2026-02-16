import type {
  StockApiResponse,
  GetStockParams,
  StockStats,
} from "../types/stock.types";
import { getAuthHeaders } from "@/shared/utils/api";

import { API_BASE_URL } from '@/shared/constants'

export const stockService = {
  async getStock(params: GetStockParams = {}): Promise<StockApiResponse> {
    const queryParams = new URLSearchParams();

    if (params.type) {
      queryParams.append("type", params.type);
    }

    if (params.locationId) {
      queryParams.append("locationId", params.locationId);
    }

    if (params.category) {
      queryParams.append("category", params.category);
    }

    if (params.stockStatus) {
      queryParams.append("stockStatus", params.stockStatus);
    }

    if (params.search && params.search.trim()) {
      queryParams.append("search", params.search.trim());
    }

    const url = `${API_BASE_URL}/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Error al obtener stock",
      }));
      const error: Error & { status?: number } = new Error(
        errorData.message || "Error al obtener stock",
      );
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  async getStats(): Promise<StockStats> {
    const response = await fetch(`${API_BASE_URL}/inventory/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Error al obtener estadísticas de stock",
      }));
      const error: Error & { status?: number } = new Error(
        errorData.message || "Error al obtener estadísticas de stock",
      );
      error.status = response.status;
      throw error;
    }

    return response.json();
  },
};
