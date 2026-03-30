"use client";

import { Search } from "lucide-react";

interface ProductFiltersProps {
  searchTerm: string;
  categoryFilter: string;
  statusFilter: "all" | "approved" | "pending";
  categories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: "all" | "approved" | "pending") => void;
}

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="relative lg:col-span-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-3 text-sm outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name"
            type="text"
            value={searchTerm}
          />
        </div>

        <select
          className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300"
          onChange={(event) => onCategoryChange(event.target.value)}
          value={categoryFilter}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300"
          onChange={(event) => onStatusChange(event.target.value as "all" | "approved" | "pending")}
          value={statusFilter}
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>
    </div>
  );
}
