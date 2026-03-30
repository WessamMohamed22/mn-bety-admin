import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryService } from "../../services/category.service";
import { Category } from "../../types/category";

interface CategoryNode extends Category {
  children?: CategoryNode[];
}

interface CategoryState {
  categories: CategoryNode[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

const mapCategoryTree = (
  categories: CategoryNode[],
  mapper: (category: CategoryNode) => CategoryNode
): CategoryNode[] => {
  return categories.map((category) => {
    const next = mapper(category);
    return {
      ...next,
      children: next.children ? mapCategoryTree(next.children, mapper) : next.children,
    };
  });
};

const removeCategoryFromTree = (categories: CategoryNode[], id: string): CategoryNode[] => {
  return categories
    .filter((category) => category._id !== id)
    .map((category) => ({
      ...category,
      children: category.children ? removeCategoryFromTree(category.children, id) : category.children,
    }));
};

const appendSubCategory = (
  categories: CategoryNode[],
  parentId: string,
  subCategory: CategoryNode
): CategoryNode[] => {
  return categories.map((category) => {
    if (category._id === parentId) {
      return {
        ...category,
        children: [...(category.children || []), subCategory],
      };
    }

    return {
      ...category,
      children: category.children ? appendSubCategory(category.children, parentId, subCategory) : category.children,
    };
  });
};

const getErrorMessage = (err: unknown, fallback: string) => {
  const maybeError = err as { response?: { data?: { message?: string } } };
  return maybeError.response?.data?.message || fallback;
};

export const fetchCategories = createAsyncThunk(
  "category/fetchAll",
  async (tree: boolean = true, { rejectWithValue }) => {
    try {
      return await categoryService.getAllCategories(tree);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch categories"));
    }
  }
);

export const createCategory = createAsyncThunk(
  "category/create",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      return await categoryService.createCategory(formData);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Failed to create category"));
    }
  }
);

export const updateCategory = createAsyncThunk("category/update", async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
  try { return await categoryService.updateCategory(id, formData); }
  catch (err: unknown) { return rejectWithValue(getErrorMessage(err, "Failed to update category")); }
});

export const toggleCategoryStatus = createAsyncThunk("category/toggle", async (id: string, { rejectWithValue }) => {
  try { return { id, ...(await categoryService.toggleStatus(id)) }; }
  catch (err: unknown) { return rejectWithValue(getErrorMessage(err, "Failed to toggle status")); }
});


export const deleteCategory = createAsyncThunk("category/delete", async (id: string, { rejectWithValue }) => {
  try { await categoryService.deleteCategory(id); return id; }
  catch (err: unknown) { return rejectWithValue(getErrorMessage(err, "Failed to delete category")); }
});

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload as CategoryNode[];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to fetch categories";
      })
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const newCategory = action.payload as CategoryNode;

        if (!newCategory.parent) {
          state.categories.push(newCategory);
          return;
        }

        const parentId = typeof newCategory.parent === "string" ? newCategory.parent : newCategory.parent._id;
        state.categories = appendSubCategory(state.categories, parentId, newCategory);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to create category";
      })
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = mapCategoryTree(state.categories, (category) => {
          if (category._id !== action.payload._id) {
            return category;
          }

          return {
            ...category,
            ...action.payload,
            children: category.children,
          };
        });
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to update category";
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        state.categories = mapCategoryTree(state.categories, (category) => {
          if (category._id !== action.payload.id) {
            return category;
          }

          return {
            ...category,
            isActive: action.payload.isActive,
          };
        });
      })
      .addCase(toggleCategoryStatus.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to toggle status";
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = removeCategoryFromTree(state.categories, action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to delete category";
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;