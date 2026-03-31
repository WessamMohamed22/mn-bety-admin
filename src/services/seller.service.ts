import api from "@/services/api";
import { API_ENDPOINTS } from "@/constants/endpoints";
import type { Seller, SellersListResult, SellersPaginationMeta, SellersQuery } from "@/types/seller";

const getErrorMessage = (err: unknown, fallback: string): string => {
  const maybeError = err as { response?: { data?: { message?: string } } };
  return maybeError.response?.data?.message || fallback;
};

const normalizePagination = (payload: {
  pagination?: SellersPaginationMeta;
  total?: number;
  page?: number;
  pages?: number;
  limit?: number;
}): SellersPaginationMeta => {
  if (payload.pagination) return payload.pagination;

  return {
    total: payload.total,
    page: payload.page,
    pages: payload.pages,
    limit: payload.limit,
    currentPage: payload.page,
    totalPages: payload.pages,
    totalItems: payload.total,
  };
};

export const sellerService = {
  async getAllSellers(query: SellersQuery = {}): Promise<SellersListResult> {
    try {
      const response = await api.get(API_ENDPOINTS.SELLERS, { params: query });
      const payload = response.data?.data || {};

      return {
        sellers: payload.sellers || [],
        pagination: normalizePagination(payload),
      };
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Failed to fetch sellers"));
    }
  },

  async getSellerById(id: string): Promise<Seller> {
    try {
      const response = await api.get(`${API_ENDPOINTS.SELLERS}/${id}`);
      const seller = response.data?.data?.seller as Seller | undefined;

      if (!seller) {
        throw new Error("Invalid seller response");
      }

      return seller;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Failed to fetch seller details"));
    }
  },

  async approveSeller(id: string): Promise<{ isApproved: boolean }> {
    try {
      const response = await api.patch(`${API_ENDPOINTS.SELLERS}/${id}/approve`);
      return response.data?.data as { isApproved: boolean };
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Failed to approve seller"));
    }
  },

  async rejectSeller(id: string): Promise<{ isApproved: boolean }> {
    try {
      const response = await api.patch(`${API_ENDPOINTS.SELLERS}/${id}/reject`);
      return response.data?.data as { isApproved: boolean };
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Failed to reject seller"));
    }
  },

  async toggleSellerStatus(id: string): Promise<{ isActive: boolean }> {
    try {
      const response = await api.patch(`${API_ENDPOINTS.SELLERS}/${id}/toggle`);
      return response.data?.data as { isActive: boolean };
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, "Failed to update seller status"));
    }
  },
};