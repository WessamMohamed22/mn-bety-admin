"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Edit2, PlusCircle, Power, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { categoryService } from "@/services/category.service";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/category";

type ModalMode = "create" | "edit";

type CategoryFormState = {
  name: string;
  parent: string;
  order: number;
  isActive: boolean;
  imageFile: File | null;
  imagePreview: string;
};

const initialFormState: CategoryFormState = {
  name: "",
  parent: "",
  order: 0,
  isActive: true,
  imageFile: null,
  imagePreview: "",
};

const getParentId = (category: Category): string | null => {
  if (!category.parent) return null;
  if (typeof category.parent === "string") return category.parent;
  return category.parent._id;
};

export default function CategoriesListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [formState, setFormState] = useState<CategoryFormState>(initialFormState);

  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getAllCategories({ tree: false });
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories", error);
      toast.error("فشل تحميل الأقسام");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const parentCategories = useMemo(() => {
    return categories.filter((category) => !getParentId(category));
  }, [categories]);

  const getSubCategories = (parentId: string) => {
    return categories.filter((category) => getParentId(category) === parentId);
  };

  const filteredParentCategories = parentCategories.filter((category) => {
    if (filter === "active") return category.isActive;
    if (filter === "inactive") return !category.isActive;
    return true;
  });

  const toggleSubList = (parentId: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingCategoryId(null);
    setFormState(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setModalMode("edit");
    setEditingCategoryId(category._id);
    setFormState({
      name: category.name,
      parent: getParentId(category) || "",
      order: category.order ?? 0,
      isActive: category.isActive,
      imageFile: null,
      imagePreview: category.image?.url || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setFormState(initialFormState);
    setEditingCategoryId(null);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setFormState((prev) => ({ ...prev, imageFile: null, imagePreview: "" }));
      return;
    }

    const preview = URL.createObjectURL(file);
    setFormState((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: preview,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      toast.error("اسم القسم مطلوب");
      return;
    }

    const payload: CreateCategoryPayload | UpdateCategoryPayload = {
      name: formState.name.trim(),
      parent: formState.parent || undefined,
      order: formState.order,
      isActive: formState.isActive,
      image: formState.imageFile || undefined,
    };

    try {
      setIsSubmitting(true);

      if (modalMode === "create") {
        await categoryService.createCategory(payload);
        toast.success("تم إضافة القسم بنجاح");
      } else if (editingCategoryId) {
        await categoryService.updateCategory(editingCategoryId, payload);
        toast.success("تم تعديل القسم بنجاح");
      }

      closeModal();
      await loadCategories();
    } catch (error) {
      console.error("Failed to save category", error);
      const maybeAxiosError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      toast.error(maybeAxiosError.response?.data?.message || "تعذر حفظ بيانات القسم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const subCount = getSubCategories(category._id).length;
    if (subCount > 0) {
      toast.error("لا يمكن حذف قسم رئيسي يحتوي على أقسام فرعية");
      return;
    }

    const confirmed = window.confirm(`هل تريد حذف القسم \"${category.name}\"؟`);
    if (!confirmed) return;

    try {
      await categoryService.deleteCategory(category._id);
      toast.success("تم حذف القسم");
      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category", error);
      toast.error("تعذر حذف القسم");
    }
  };

  const handleToggleStatus = async (category: Category) => {
    const actionLabel = category.isActive ? "تعطيل" : "تفعيل";
    const confirmed = window.confirm(`هل تريد ${actionLabel} القسم \"${category.name}\"؟`);
    if (!confirmed) return;

    try {
      await categoryService.toggleStatus(category._id);
      toast.success(`تم ${actionLabel} القسم`);
      await loadCategories();
    } catch (error) {
      console.error("Failed to toggle category status", error);
      toast.error("تعذر تحديث حالة القسم");
    }
  };

  const renderStatus = (isActive: boolean) => {
    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
          isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8" dir="ltr">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
          <p className="text-gray-500">Manage main categories and sub-categories from backend data.</p>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-lg bg-orange-700 px-5 py-2.5 font-bold text-white transition-colors hover:bg-orange-800"
          onClick={openCreateModal}
          type="button"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Category
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(["all", "active", "inactive"] as const).map((t) => (
            <button
              className={`rounded-md px-4 py-1.5 text-sm font-bold capitalize transition-all ${
                filter === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
              key={t}
              onClick={() => setFilter(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-12 gap-2 border-b border-gray-200 bg-gray-50/70 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          <span className="col-span-5">Category</span>
          <span className="col-span-2 text-center">Status</span>
          <span className="col-span-2 text-center">Type</span>
          <span className="col-span-3 text-right">Actions</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading categories...</div>
        ) : (
          <div>
            {filteredParentCategories.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No categories found.</div>
            ) : (
              filteredParentCategories.map((parent) => {
                const subCategories = getSubCategories(parent._id);
                const isExpanded = Boolean(expandedParents[parent._id]);

                return (
                  <div className="border-b border-gray-100" key={parent._id}>
                    <div className="grid grid-cols-12 items-center gap-2 px-4 py-3 hover:bg-gray-50">
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="h-11 w-11 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                          {parent.image?.url ? (
                            <Image
                              alt={parent.name}
                              className="h-full w-full object-cover"
                              height={44}
                              src={parent.image.url}
                              width={44}
                            />
                          ) : null}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">{parent.name}</p>
                          <p className="text-xs text-gray-500">/{parent.slug}</p>
                        </div>
                      </div>

                      <div className="col-span-2 text-center">{renderStatus(parent.isActive)}</div>
                      <div className="col-span-2 text-center text-sm font-medium text-gray-700">Main</div>

                      <div className="col-span-3 flex items-center justify-end gap-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                          onClick={() => toggleSubList(parent._id)}
                          type="button"
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          Sub-categories ({subCategories.length})
                        </button>

                        <button
                          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openEditModal(parent)}
                          title="Edit"
                          type="button"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                          onClick={() => handleToggleStatus(parent)}
                          title="Toggle Active"
                          type="button"
                        >
                          <Power className="h-4 w-4" />
                        </button>

                        <button
                          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(parent)}
                          title="Delete"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-slate-50/70 px-5 py-2">
                        {subCategories.length === 0 ? (
                          <p className="py-2 text-sm text-gray-500">No sub-categories under this parent.</p>
                        ) : (
                          <div className="space-y-2 py-2">
                            {subCategories.map((sub) => (
                              <div
                                className="grid grid-cols-12 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2"
                                key={sub._id}
                              >
                                <div className="col-span-5 flex items-center gap-3">
                                  <div className="h-8 w-8 overflow-hidden rounded-md border border-gray-100 bg-gray-100">
                                    {sub.image?.url ? (
                                      <Image
                                        alt={sub.name}
                                        className="h-full w-full object-cover"
                                        height={32}
                                        src={sub.image.url}
                                        width={32}
                                      />
                                    ) : null}
                                  </div>
                                  <p className="text-sm font-medium text-gray-800">{sub.name}</p>
                                </div>

                                <div className="col-span-2 text-center">{renderStatus(sub.isActive)}</div>
                                <div className="col-span-2 text-center text-sm font-medium text-gray-700">Sub</div>

                                <div className="col-span-3 flex items-center justify-end gap-1">
                                  <button
                                    className="rounded-md p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                    onClick={() => openEditModal(sub)}
                                    type="button"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>

                                  <button
                                    className="rounded-md p-2 text-gray-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                                    onClick={() => handleToggleStatus(sub)}
                                    type="button"
                                  >
                                    <Power className="h-4 w-4" />
                                  </button>

                                  <button
                                    className="rounded-md p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                    onClick={() => handleDelete(sub)}
                                    type="button"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4" role="dialog">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {modalMode === "create" ? "Add New Category" : "Edit Category"}
              </h2>

              <button
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                onClick={closeModal}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Category Name</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Enter category name"
                  required
                  type="text"
                  value={formState.name}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Display Order</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  min={0}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      order: Number(event.target.value),
                    }))
                  }
                  type="number"
                  value={formState.order}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Parent Category (Optional)</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      parent: event.target.value,
                    }))
                  }
                  value={formState.parent}
                >
                  <option value="">Main Category</option>
                  {parentCategories
                    .filter((category) => category._id !== editingCategoryId)
                    .map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Category Image</label>
                <input
                  accept="image/*"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  onChange={handleImageChange}
                  type="file"
                />

                {formState.imagePreview && (
                  <div className="mt-2 h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      alt="Category Preview"
                      className="h-full w-full object-cover"
                      height={80}
                      src={formState.imagePreview}
                      width={80}
                    />
                  </div>
                )}
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  checked={formState.isActive}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      isActive: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                Active Category
              </label>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={closeModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting
                    ? "Saving..."
                    : modalMode === "create"
                      ? "Create Category"
                      : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}