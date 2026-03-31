import api from "@/services/api";
import { API_ENDPOINTS } from "@/constants/endpoints";
import type {
	Product,
	ProductModerationStats,
	ProductPaginationMeta,
	ProductQuery,
	ProductsListResult,
} from "@/types/product";

const getErrorMessage = (err: unknown, fallback: string): string => {
	const maybeError = err as { response?: { data?: { message?: string } } };
	return maybeError.response?.data?.message || fallback;
};

const normalizePagination = (payload: {
	pagination?: ProductPaginationMeta;
	total?: number;
	page?: number;
	pages?: number;
	limit?: number;
}): ProductPaginationMeta => {
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

const buildStats = (products: Product[]): ProductModerationStats => {
	const queueTotal = products.length;
	const pendingApproval = products.filter((item) => !item.isApproved).length;
	const activeProducts = products.filter((item) => item.isActive).length;
	const averageRating =
		queueTotal === 0 ? 0 : products.reduce((sum, item) => sum + (item.rating || 0), 0) / queueTotal;

	return {
		queueTotal,
		pendingApproval,
		activeProducts,
		averageRating,
	};
};

export const productService = {
	async getAllProducts(query: ProductQuery = {}): Promise<ProductsListResult> {
		try {
			const response = await api.get(API_ENDPOINTS.PRODUCTS, { params: query });
			const payload = response.data?.data || {};

			return {
				products: payload.products || [],
				pagination: normalizePagination(payload),
			};
		} catch (err: unknown) {
			throw new Error(getErrorMessage(err, "Failed to fetch products"));
		}
	},

	async getProductById(idOrSlug: string): Promise<Product> {
		try {
			const response = await api.get(`${API_ENDPOINTS.PRODUCTS}/${idOrSlug}`);
			const product = response.data?.data?.product as Product | undefined;

			if (!product) {
				throw new Error("Invalid product response");
			}

			return product;
		} catch (err: unknown) {
			throw new Error(getErrorMessage(err, "Failed to fetch product details"));
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

	async getModerationStats(): Promise<ProductModerationStats> {
		// No dedicated stats endpoint in current backend routes.
		const result = await this.getAllProducts({ page: 1, limit: 50 });
		return buildStats(result.products);
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