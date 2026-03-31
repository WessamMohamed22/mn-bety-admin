import api from "./api";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category";

type GetCategoriesParams = {
  tree?: boolean;
  active?: "true" | "false";
};

const isFormData = (value: unknown): value is FormData =>
  typeof FormData !== "undefined" && value instanceof FormData;

const buildCategoryFormData = (
  payload: CreateCategoryPayload | UpdateCategoryPayload | FormData
) => {
  if (isFormData(payload)) {
    const normalized = new FormData();

    payload.forEach((value, key) => {
      if (key === "image") {
        normalized.append("categoryImage", value);
        return;
      }

      normalized.append(key, value);
    });

    return normalized;
  }

  const formData = new FormData();
  formData.append("name", payload.name);

  if (payload.parent) {
    formData.append("parent", payload.parent);
  }

  if (payload.order !== undefined) {
    formData.append("order", String(payload.order));
  }

  if (payload.isActive !== undefined) {
    formData.append("isActive", String(payload.isActive));
  }

  if (payload.image) {
    formData.append("categoryImage", payload.image);
  }

  return formData;
};

export const categoryService = {
  getAllCategories: async (
    params: GetCategoriesParams | boolean = {}
  ): Promise<Category[]> => {
    const resolvedParams =
      typeof params === "boolean"
        ? { tree: params }
        : params;

    const response = await api.get("/categories", {
      params: {
        tree: String(Boolean(resolvedParams.tree)),
        ...(resolvedParams.active ? { active: resolvedParams.active } : {}),
      },
    });

    return response.data.data.categories;
  },

  createCategory: async (payload: CreateCategoryPayload | FormData): Promise<Category> => {
    const response = await api.post("/categories", buildCategoryFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data.category;
  },

  updateCategory: async (
    id: string,
    payload: UpdateCategoryPayload | FormData
  ): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, buildCategoryFormData(payload), {
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