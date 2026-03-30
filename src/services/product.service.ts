import api from "@/services/api";
import { API_ENDPOINTS } from "@/constants/endpoints";
import type { ProductQuery, ProductsListResult, Product } from "@/types/product";

const getErrorMessage = (err: unknown, fallback: string): string => {
	const maybeError = err as { response?: { data?: { message?: string } } };
	return maybeError.response?.data?.message || fallback;
};

export const productService = {
	async getAllProducts(query: ProductQuery = {}): Promise<ProductsListResult> {
		try {
			const response = await api.get(API_ENDPOINTS.PRODUCTS, { params: query });
			return response.data.data as ProductsListResult;
		} catch (err: unknown) {
			throw new Error(getErrorMessage(err, "Failed to fetch products"));
		}
	},

	async approveProduct(id: string): Promise<{ isApproved: boolean }> {
		try {
			const response = await api.patch(`${API_ENDPOINTS.PRODUCTS}/${id}/approve`);
			return response.data.data as { isApproved: boolean };
		} catch (err: unknown) {
			throw new Error(getErrorMessage(err, "Failed to approve product"));
		}
	},

	async toggleProductStatus(id: string): Promise<{ isActive: boolean }> {
		try {
			const response = await api.patch(`${API_ENDPOINTS.PRODUCTS}/${id}/toggle`);
			return response.data.data as { isActive: boolean };
		} catch (err: unknown) {
			throw new Error(getErrorMessage(err, "Failed to toggle product status"));
		}
	},

	async deleteProduct(id: string): Promise<void> {
		try {
			await api.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`);
		} catch (err: unknown) {
			throw new Error(getErrorMessage(err, "Failed to delete product"));
		}
	},

	async updateProduct(id: string, data: FormData): Promise<Product> {
		try {
			const response = await api.put(`${API_ENDPOINTS.PRODUCTS}/${id}`, data, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			return response.data.data.product as Product;
		} catch (err: unknown) {
			throw new Error(getErrorMessage(err, "Failed to update product"));
		}
	},
};