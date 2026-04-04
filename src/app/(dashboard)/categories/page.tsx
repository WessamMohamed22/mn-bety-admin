"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Edit2, ImageIcon, PlusCircle, Power, Trash2, X } from "lucide-react";
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

const renderStatus = (isActive: boolean) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
      isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
    }`}
  >
    {isActive ? "Active" : "Inactive"}
  </span>
);

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
      toast.error("تعذر حفظ بيانات القسم");
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

    const confirmed = window.confirm(`هل تريد حذف القسم "${category.name}"؟`);
    if (!confirmed) return;

    try {
      await categoryService.deleteCategory(category._id);
      toast.success("تم حذف القسم");
      await loadCategories();
    } catch (error) {
      toast.error("تعذر حذف القسم");
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await categoryService.toggleStatus(category._id);
      toast.success(`تم تحديث حالة القسم`);
      await loadCategories();
    } catch (error) {
      toast.error("تعذر تحديث حالة القسم");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8" dir="ltr">
      {/* Header Section - Responsive Stack */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Categories</h1>
          <p className="text-sm text-gray-500 font-medium">Manage your store departments and hierarchy.</p>
        </div>

        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-orange-800 active:scale-95"
          onClick={openCreateModal}
          type="button"
        >
          <PlusCircle className="h-5 w-5" />
          Add New Category
        </button>
      </div>

      {/* Filters - Scrollable on mobile */}
      <div className="mb-6 flex overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(["all", "active", "inactive"] as const).map((t) => (
            <button
              className={`rounded-lg px-6 py-2 text-sm font-bold capitalize transition-all ${filter === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              key={t}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table-like Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header - Hidden on mobile, Flex on Desktop */}
        <div className="hidden md:flex items-center gap-3 border-b border-gray-200 bg-gray-50/70 px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
          <div className="w-[42%] min-w-70">Category</div>
          <div className="w-28 text-center">Status</div>
          <div className="w-32 text-center">Type</div>
          <div className="w-48 text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse font-bold">Loading categories...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredParentCategories.map((parent) => {
              const subCategories = getSubCategories(parent._id);
              const isExpanded = Boolean(expandedParents[parent._id]);

              return (
                <div key={parent._id} className="transition-colors hover:bg-gray-50/50">
                  {/* Row Structure - Responsive Flex */}
                  <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:py-4">

                    {/* Category Info */}
                    <div className="flex items-center gap-4 md:w-[42%] md:min-w-70">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 relative">
                        {parent.image?.url ? (
                          <Image alt={parent.name} fill className="object-cover" src={parent.image.url} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300"><ImageIcon size={20} /></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{parent.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter md:hidden">Main Category</p>
                      </div>
                    </div>

                    {/* Status & Type - Horizontal on mobile, Fixed width on Desktop */}
                    <div className="flex items-center justify-between md:justify-center gap-8 md:w-28">
                      <span className="text-[10px] font-bold text-gray-400 uppercase md:hidden tracking-widest">Status</span>
                      {renderStatus(parent.isActive)}
                    </div>

                    <div className="hidden md:flex items-center justify-center md:w-32 text-sm font-bold text-gray-500">
                      Main
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-50 pt-4 md:w-48 md:flex-nowrap md:justify-end md:border-0 md:pt-0">
                      <button
                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600 hover:bg-slate-200"
                        onClick={() => toggleSubList(parent._id)}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        SUBS ({subCategories.length})
                      </button>

                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(parent)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleToggleStatus(parent)} className={`p-2 transition-colors rounded-lg ${parent.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                          <Power size={18} />
                        </button>
                        <button onClick={() => handleDelete(parent)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Sub-categories Area */}
                  {isExpanded && (
                    <div className="space-y-2 border-t border-gray-100/50 bg-gray-50/50 px-4 py-3 md:px-12">
                      {subCategories.map((sub) => (
                        <div key={sub._id} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100 relative">
                              {sub.image?.url && <Image alt={sub.name} fill className="object-cover" src={sub.image.url} />}
                            </div>
                            <span className="text-sm font-bold text-gray-700">{sub.name}</span>
                          </div>
                          <div className="flex items-center gap-1 self-end sm:self-auto">
                            <button onClick={() => openEditModal(sub)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(sub)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal - Adjusted for Mobile Viewport */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-gray-100 px-8 py-5">
              <h2 className="text-xl font-black text-gray-900">{modalMode === "create" ? "New Category" : "Edit Category"}</h2>
              <button className="rounded-full bg-gray-100 p-2 text-gray-400" onClick={closeModal}><X size={20} /></button>
            </div>

            <form className="p-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 no-scrollbar">
                {/* Inputs Stack */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category Name</label>
                  <input className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-orange-50 transition-all outline-none" onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))} placeholder="Electronics..." required value={formState.name} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Order</label>
                    <input className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold" type="number" onChange={(e) => setFormState(prev => ({ ...prev, order: Number(e.target.value) }))} value={formState.order} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Parent</label>
                    <select className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold appearance-none" onChange={(e) => setFormState(prev => ({ ...prev, parent: e.target.value }))} value={formState.parent}>
                      <option value="">None</option>
                      {parentCategories.filter(c => c._id !== editingCategoryId).map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Upload Photo</label>
                  <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/50 relative">
                    {formState.imagePreview ? (
                      <div className="relative h-14 w-14 overflow-hidden rounded-lg"><Image alt="preview" fill src={formState.imagePreview} className="object-cover" /></div>
                    ) : (
                      <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><ImageIcon size={24} /></div>
                    )}
                    <div className="flex-1 text-xs font-bold text-gray-500">Click to choose a file...</div>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50/30">
                  <input type="checkbox" id="activeCheck" checked={formState.isActive} onChange={(e) => setFormState(prev => ({ ...prev, isActive: e.target.checked }))} className="h-5 w-5 rounded accent-orange-600" />
                  <label htmlFor="activeCheck" className="text-xs font-black text-orange-800 uppercase tracking-tight cursor-pointer">Visible on Storefront</label>
                </div>
              </div>

              {/* Action Buttons Stack */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button className="flex-1 rounded-xl border border-gray-100 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors" onClick={closeModal} type="button">Discard</button>
                <button className="flex-2 rounded-xl bg-orange-700 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-orange-100 hover:bg-orange-800 disabled:opacity-50 transition-all" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Saving..." : "Confirm & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}