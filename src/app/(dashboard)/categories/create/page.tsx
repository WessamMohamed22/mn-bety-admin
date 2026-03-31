"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { UploadCloud } from "lucide-react";
import { fetchCategories, createCategory } from "../../../../store/slices/categorySlice";
import { AppDispatch, RootState } from "../../../../store";
import type { Category } from "../../../../types/category";

interface CategoryNode extends Category {
  children?: CategoryNode[];
}

export default function CreateCategoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { categories } = useSelector((state: RootState) => state.category);

  const [activeTab, setActiveTab] = useState<"main" | "sub">("main");
  const [formData, setFormData] = useState({ name: "", parent: "", order: 1, isActive: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Filter only main categories (parent is null/undefined) for the dropdown
  const mainCategories = (categories as CategoryNode[]).filter((c) => !c.parent);

  useEffect(() => {
    dispatch(fetchCategories(true));
  }, [dispatch]);

  const handleTabChange = (tab: "main" | "sub") => {
    setActiveTab(tab);
    setFormData({ name: "", parent: "", order: 1, isActive: true });
    setImageFile(null);
    setPreview(null);
  };

  const handleImageDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Category name is required");
    if (activeTab === "sub" && !formData.parent) return toast.error("Please select a parent category");

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("order", formData.order.toString());
    submitData.append("isActive", formData.isActive.toString());
    if (activeTab === "sub") submitData.append("parent", formData.parent);
    if (imageFile) submitData.append("categoryImage", imageFile);

    dispatch(createCategory(submitData))
      .unwrap()
      .then(() => {
        toast.success("Category created successfully!");
        router.push("/categories"); // Redirect back to list
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message);
      });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" dir="ltr">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <p className="text-gray-500 text-sm mt-1">Organize your store&apos;s architecture by curating main categories and their nested sub-collections.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button onClick={() => handleTabChange("main")} className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === "main" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            Main Category
          </button>
          <button onClick={() => handleTabChange("sub")} className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === "sub" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            Subcategory
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Details */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" placeholder="e.g. Living Room Furniture" />
            </div>

            {activeTab === "sub" && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Parent Category</label>
                <select value={formData.parent} onChange={(e) => setFormData({ ...formData, parent: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-all">
                  <option value="">Select parent...</option>
                  {mainCategories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Order</label>
              <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-all" min="0" />
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100 mt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
              <span className="text-sm font-bold text-gray-700">Active Visibility</span>
            </div>
          </div>

          {/* Right Column: Image Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cover Image</label>
            <div className="relative w-full h-64 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors overflow-hidden group">
              <input type="file" accept="image/*" onChange={handleImageDrop} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              {preview ? (
                <Image src={preview} alt="Preview" className="object-cover" fill unoptimized sizes="(max-width: 768px) 100vw, 40vw" />
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2 group-hover:text-orange-500 transition-colors" />
                  <span className="text-sm font-bold text-gray-600">Drop your category image here</span>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="md:col-span-2 flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => router.push("/categories")} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Discard</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-orange-700 hover:bg-orange-800 rounded-lg shadow-sm transition-colors">Create Category</button>
          </div>
        </form>
      </div>
    </div>
  );
}