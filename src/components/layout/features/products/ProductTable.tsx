"use client";

import Image from "next/image";
import { CheckCircle2, Power, Trash2 } from "lucide-react";
import type { Product } from "@/types/product";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface ProductTableProps {
  products: Product[];
  actionLoadingId: string | null;
  onApprove: (id: string) => Promise<void>;
  onToggleActive: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const getCategoryName = (product: Product): string =>
  typeof product.category === "string" ? product.category : product.category.name;

const getSellerName = (product: Product): string => {
  if (typeof product.seller === "string") return product.seller;
  return product.seller.userId?.fullName || "Unknown Seller";
};

export function ProductTable({
  products,
  actionLoadingId,
  onApprove,
  onToggleActive,
  onDelete,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        No products found.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-600">
              <th className="px-4 py-3 text-right font-bold">Product</th>
              <th className="px-4 py-3 text-right font-bold">Seller</th>
              <th className="px-4 py-3 text-right font-bold">Category</th>
              <th className="px-4 py-3 text-right font-bold">Price</th>
              <th className="px-4 py-3 text-right font-bold">Created</th>
              <th className="px-4 py-3 text-right font-bold">Status</th>
              <th className="px-4 py-3 text-right font-bold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const isLoading = actionLoadingId === product._id;

              return (
                <tr className="border-b border-slate-100 last:border-b-0" key={product._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        alt={product.name}
                        className="rounded-lg object-cover bg-slate-100 h-auto"
                        height={46}
                        src={product.images[0]?.url || "https://placehold.co/64x64/png"}
                        unoptimized
                        width={46}
                      />
                      <div>
                        <p className="font-bold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">#{product._id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-700">{getSellerName(product)}</td>
                  <td className="px-4 py-3 text-slate-700">{getCategoryName(product)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(product.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          product.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
                        ].join(" ")}
                      >
                        {product.isApproved ? "Approved" : "Pending"}
                      </span>
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          product.isActive ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600",
                        ].join(" ")}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                        disabled={isLoading || product.isApproved}
                        onClick={() => onApprove(product._id)}
                        title="Approve"
                        type="button"
                      >
                        <CheckCircle2 size={18} />
                      </button>

                      <button
                        className="p-2 rounded-lg text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                        disabled={isLoading}
                        onClick={() => onToggleActive(product._id)}
                        title="Toggle Active"
                        type="button"
                      >
                        <Power size={18} />
                      </button>

                      <button
                        className="p-2 rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-50"
                        disabled={isLoading}
                        onClick={() => onDelete(product._id)}
                        title="Delete"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
