import type { ProductModerationStats } from "@/types/product";
import { Package, Clock3, ShieldCheck, Star } from "lucide-react";

interface ProductStatsProps {
  stats: ProductModerationStats;
}

export function ProductStats({ stats }: ProductStatsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-semibold">Total Products</p>
          <Package className="text-orange-600" size={18} />
        </div>
        <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.queueTotal}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-semibold">Pending Approval</p>
          <Clock3 className="text-amber-600" size={18} />
        </div>
        <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.pendingApproval}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-semibold">Active Products</p>
          <ShieldCheck className="text-emerald-600" size={18} />
        </div>
        <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.activeProducts}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-semibold">Average Rating</p>
          <Star className="text-blue-600" size={18} />
        </div>
        <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.averageRating.toFixed(1)}</p>
      </article>
    </section>
  );
}
