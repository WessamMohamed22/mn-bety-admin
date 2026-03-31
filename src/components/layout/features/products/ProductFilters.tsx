"use client";

import { Search, Filter } from "lucide-react";

interface ProductFiltersProps {
  searchTerm: string;
  categoryFilter: string;
  statusFilter: "all" | "approved" | "pending";
  categories: Array<{ label: string; value: string }>;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: "all" | "approved" | "pending") => void;
}

const selectClass = `
  w-full rounded-xl border border-slate-300 bg-white
  py-2.5 px-3 text-sm text-slate-800 font-medium
  outline-none cursor-pointer
  focus:ring-2 focus:ring-orange-300 focus:border-orange-400
  hover:border-slate-400 transition-colors
  appearance-none
`.trim();

export function ProductFilters({
  searchTerm,
  categoryFilter,
  statusFilter,
  categories,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
}: ProductFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter size={15} className="text-slate-400" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Filter Products
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={16}
          />
          <input
            className="
              w-full rounded-xl border border-slate-300 bg-white
              py-2.5 pr-10 pl-3 text-sm text-slate-800 font-medium
              placeholder:text-slate-400 placeholder:font-normal
              outline-none
              focus:ring-2 focus:ring-orange-300 focus:border-orange-400
              hover:border-slate-400 transition-colors
            "
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, ID or category..."
            type="text"
            value={searchTerm}
          />
        </div>

        {/* Category select */}
        <div className="relative">
          <select
            className={selectClass}
            onChange={(e) => onCategoryChange(e.target.value)}
            value={categoryFilter}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {/* Custom arrow */}
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            ▾
          </span>
        </div>

        {/* Status select */}
        <div className="relative">
          <select
            className={selectClass}
            onChange={(e) => onStatusChange(e.target.value as "all" | "approved" | "pending")}
            value={statusFilter}
          >
            <option value="all">All Statuses</option>
            <option value="approved">✓ Approved</option>
            <option value="pending">⏳ Pending</option>
          </select>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            ▾
          </span>
        </div>

      </div>

      {/* Active filters badges */}
      {(searchTerm || categoryFilter !== "all" || statusFilter !== "all") && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400">Active filters:</span>

          {searchTerm && (
            <span className="flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">
              🔍 {searchTerm}
              <button
                onClick={() => onSearchChange("")}
                className="ml-1 hover:text-orange-900 transition-colors"
                type="button"
              >
                ×
              </button>
            </span>
          )}

          {categoryFilter !== "all" && (
            <span className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
              📂 {categories.find((c) => c.value === categoryFilter)?.label || categoryFilter}
              <button
                onClick={() => onCategoryChange("all")}
                className="ml-1 hover:text-blue-900 transition-colors"
                type="button"
              >
                ×
              </button>
            </span>
          )}

          {statusFilter !== "all" && (
            <span className={[
              "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border",
              statusFilter === "approved"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-amber-50 border-amber-200 text-amber-700",
            ].join(" ")}>
              {statusFilter === "approved" ? "✓ Approved" : "⏳ Pending"}
              <button
                onClick={() => onStatusChange("all")}
                className="ml-1 hover:opacity-70 transition-opacity"
                type="button"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}