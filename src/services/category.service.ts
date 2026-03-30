import api from "./api";
import { Category } from "../types/category";

export const categoryService = {
  getAllCategories: async (tree: boolean = false): Promise<Category[]> => {
    const response = await api.get(`/categories?tree=${tree}`);
    return response.data.data.categories;
  },
  createCategory: async (data: FormData): Promise<Category> => {
    const response = await api.post("/categories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.category;
  },
  updateCategory: async (id: string, data: FormData): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.category;
  },
  toggleStatus: async (id: string): Promise<{ isActive: boolean }> => {
    const response = await api.patch(`/categories/${id}/toggle`);
    return response.data.data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};