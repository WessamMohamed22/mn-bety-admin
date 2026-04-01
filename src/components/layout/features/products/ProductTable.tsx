"use client";

import Image from "next/image";
import { Eye, Trash2 } from "lucide-react";
import type { Product } from "@/types/product";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ToggleLeft, ToggleRight } from "lucide-react";
interface ProductTableProps {
  products: Product[];
  actionLoadingId: string | null;
  onApprove: (id: string) => Promise<void>; // دي اللي هنستخدمها للـ Switch
  onDelete: (id: string) => Promise<void>;
  onDetails: (id: string) => void;
}

// ─── Switch Toggle ─────────────────────────────────────────────────────────────
function ApprovalSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? "bg-emerald-500 focus:ring-emerald-500" : "bg-red-400 focus:ring-red-400"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200
          ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`}
      />
    </button>
  );
}

export function ProductTable({
  products,
  actionLoadingId,
  onApprove,
  onDelete,
  onDetails,
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
              <th className="px-4 py-3 text-left font-bold">Product</th>
              <th className="px-4 py-3 text-left font-bold">Seller</th>
              <th className="px-4 py-3 text-left font-bold">Price</th>
              <th className="px-4 py-3 text-center font-bold">Approval Status</th>
              <th className="px-4 py-3 text-left font-bold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const isLoading = actionLoadingId === product._id;

              return (
                <tr key={product._id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        alt={product.name}
                        className="rounded-lg object-cover bg-slate-100"
                        height={46}
                        src={product.images[0]?.url || "https://placehold.co/64x64/png"}
                        unoptimized
                        width={46}
                      />
                      <p className="font-bold text-slate-900">{product.name}</p>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {typeof product.seller === 'string' ? product.seller : product.seller?.userId?.fullName || "N/A"}
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 group">
                      <button
                        onClick={() => onApprove(product._id)}
                        disabled={isLoading}
                        className={`transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-50 
        ${product.isApproved ? "text-emerald-500" : "text-slate-300"}`}
                        title={product.isApproved ? "Click to Disapprove" : "Click to Approve"}
                      >
                        {product.isApproved ? (
                          <ToggleRight size={32} strokeWidth={2} />
                        ) : (
                          <ToggleLeft size={32} strokeWidth={2} />
                        )}
                      </button>
                      <span
                        className={`text-[11px] font-black  tracking-tight transition-colors duration-300 min-w-16.25 text-left
        ${product.isApproved ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {product.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onDetails(product._id)} className="text-slate-600 hover:text-slate-900">
                        <Eye size={17} />
                      </button>
                      <button onClick={() => onDelete(product._id)} disabled={isLoading} className="text-red-600 hover:text-red-800 disabled:opacity-30">
                        <Trash2 size={17} />
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