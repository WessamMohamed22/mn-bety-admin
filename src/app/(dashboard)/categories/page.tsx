"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { GripVertical, Edit2, Trash2, PlusCircle } from "lucide-react";
import { fetchCategories, toggleCategoryStatus, deleteCategory } from "@/store/slices/categorySlice";
import { AppDispatch, RootState } from "@/store";
import toast from "react-hot-toast";
import type { Category } from "@/types/category";

interface CategoryNode extends Category {
  children?: CategoryNode[];
}

export default function CategoriesListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isLoading } = useSelector((state: RootState) => state.category);
  const categoryTree = categories as CategoryNode[];
  
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    // The backend handles building the tree if we pass ?tree=true
    dispatch(fetchCategories(true));
  }, [dispatch]);

  const filteredCategories = categoryTree.filter((c) => {
    if (filter === "active") return c.isActive;
    if (filter === "inactive") return !c.isActive;
    return true;
  });

  const handleToggle = (id: string) => {
    dispatch(toggleCategoryStatus(id));
  };

  const handleDelete = (id: string, hasChildren: boolean) => {
    if (hasChildren) return toast.error("Cannot delete a category with subcategories.");
    if (window.confirm("Are you sure you want to delete this category?")) {
      dispatch(deleteCategory(id)).unwrap().then(() => toast.success("Deleted"));
    }
  };

  // Render a single row (recursive if tree mode)
  const renderRow = (cat: CategoryNode, depth: number = 0) => {
    const isSub = depth > 0;
    
    return (
      <React.Fragment key={cat._id}>
        <div className={`flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSub ? "pl-16 bg-gray-50/50" : ""}`}>
          <div className="flex items-center gap-4 flex-1">
            <GripVertical className="w-5 h-5 text-gray-300 cursor-grab" />
            
            {/* Image Thumbnail */}
            <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden border border-gray-100 shrink-0">
              {cat.image?.url ? (
                <Image
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  height={40}
                  src={cat.image.url}
                  width={40}
                />
              ) : null}
            </div>
            
            <span className={`font-bold ${isSub ? "text-sm text-gray-600" : "text-gray-900"}`}>{cat.name}</span>
          </div>

          <div className="flex items-center gap-12">
            {/* Status Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={cat.isActive} onChange={() => handleToggle(cat._id)} />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
            </label>

            <span className="text-sm font-mono text-gray-400 w-12 text-center">{cat.order}</span>

            {/* Actions */}
            <div className="flex items-center gap-3 w-32 justify-end">
              {!isSub && (
                <Link href={`/categories/create?parent=${cat._id}`} className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 mr-2">
                  <PlusCircle className="w-3 h-3" /> Subcategory
                </Link>
              )}
              <button className="text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(cat._id, cat.children?.length > 0)} className={`transition-colors ${cat.children?.length > 0 ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:text-red-600"}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Recursively render children if in Tree View */}
        {viewMode === "tree" && cat.children?.map((child) => renderRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4" dir="ltr">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
          <p className="text-gray-500">Define and organize your product taxonomy hierarchy.</p>
        </div>
        <Link href="/categories/create" className="btn bg-orange-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-orange-800 transition-colors">
          Create Category
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(["all", "active", "inactive"] as const).map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`px-4 py-1.5 text-sm font-bold rounded-md capitalize transition-all ${filter === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <button onClick={() => setViewMode("tree")} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === "tree" ? "bg-orange-50 text-orange-700" : "text-gray-600 hover:bg-gray-50"}`}>
            Tree View
          </button>
          <div className="w-px bg-gray-200"></div>
          <button onClick={() => setViewMode("table")} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === "table" ? "bg-orange-50 text-orange-700" : "text-gray-600 hover:bg-gray-50"}`}>
            Table View
          </button>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="flex justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50 rounded-t-2xl">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-12">Category Name</span>
          <div className="flex gap-12 pr-35">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order</span>
          </div>
        </div>

        {/* List Items */}
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading categories...</div>
        ) : (
          <div className="flex flex-col">
            {filteredCategories.length === 0 ? (
               <div className="p-12 text-center text-gray-500">No categories found.</div>
            ) : (
              filteredCategories.map(cat => renderRow(cat, 0))
            )}
          </div>
        )}
      </div>
    </div>
  );
}