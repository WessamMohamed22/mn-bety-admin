"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { UploadCloud, ChevronLeft, Plus, FolderPlus, Layers } from "lucide-react";
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
        router.push("/categories");
      })
      .catch((err: any) => toast.error(err.message || "Failed to create"));
  };

  return (
    <div className="p-4 sm:p-6 bg-[#F8FAFC] min-h-screen text-slate-900" dir="ltr">
      {/* HEADER SECTION */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Category Management</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Architecture / New Collection</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* COMPACT TABS */}
          <div className="flex bg-slate-50/50 p-1.5 border-b border-slate-100">
            <button 
              onClick={() => handleTabChange("main")} 
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "main" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <FolderPlus size={14} /> Main Category
            </button>
            <button 
              onClick={() => handleTabChange("sub")} 
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "sub" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Layers size={14} /> Subcategory
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT SIDE: FORM FIELDS */}
              <div className="lg:col-span-7 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Category Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm font-bold placeholder:text-slate-300" 
                      placeholder="e.g. Living Room Furniture" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Display Order</label>
                    <input 
                      type="number" 
                      value={formData.order} 
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-orange-500 transition-all text-sm font-bold" 
                      min="0" 
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="w-full flex items-center justify-between gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                      <span className="text-[11px] font-black text-slate-600 uppercase">Visibility</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {activeTab === "sub" && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Parent Category</label>
                    <div className="relative">
                      <select 
                        value={formData.parent} 
                        onChange={(e) => setFormData({ ...formData, parent: e.target.value })} 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-orange-500 transition-all text-sm font-bold appearance-none"
                      >
                        <option value="">Select parent collection...</option>
                        {mainCategories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                         <Plus size={14} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE: IMAGE UPLOAD */}
              <div className="lg:col-span-5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Cover Media</label>
                <div className="relative group aspect-square lg:aspect-auto lg:h-[185px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center hover:bg-slate-100 hover:border-orange-200 transition-all overflow-hidden">
                  <input type="file" accept="image/*" onChange={handleImageDrop} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {preview ? (
                    <Image src={preview} alt="Preview" className="object-cover" fill unoptimized />
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-5 h-5 text-orange-500" />
                      </div>
                      <span className="text-[11px] font-black text-slate-600 block">Drop Image Here</span>
                      <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">PNG, JPG or WEBP (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={() => router.push("/categories")} 
                className="px-6 py-2.5 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
              >
                Discard
              </button>
              <button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2.5 rounded-xl font-black text-xs transition-all shadow-md shadow-orange-100 flex items-center gap-2 uppercase tracking-widest"
              >
                Create Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}