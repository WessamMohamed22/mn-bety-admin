"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ProductFilters } from "@/components/layout/features/products/ProductFilters";
import { ProductStats } from "@/components/layout/features/products/ProductStats";
import { ProductTable } from "@/components/layout/features/products/ProductTable";
import { productService } from "@/services/product.service";
import type { Product, ProductModerationStats, ProductPaginationMeta } from "@/types/product";

const PAGE_SIZE = 10;

// حساب الإحصائيات بناءً على المنتجات الحالية
const calculateStats = (products: Product[]): ProductModerationStats => {
  const queueTotal = products.length;
  const pendingApproval = products.filter((item) => !item.isApproved).length;
  const activeProducts = products.filter((item) => item.isActive).length;
  const averageRating =
    queueTotal === 0 ? 0 : products.reduce((sum, item) => sum + (item.rating || 0), 0) / queueTotal;

  return {
    queueTotal,
    pendingApproval,
    activeProducts,
    averageRating,
  };
};

const getNormalizedPagination = (meta: ProductPaginationMeta, fallbackPage: number) => {
  const currentPage = meta.currentPage || meta.pageNumber || meta.page || fallbackPage;
  const limit = meta.limit || meta.safeLimit || PAGE_SIZE;
  const totalItems = meta.totalItems || meta.total || 0;
  const totalPages = meta.totalPages || meta.pages || Math.max(1, Math.ceil(totalItems / limit));

  return {
    currentPage,
    limit,
    totalItems,
    totalPages,
    hasNextPage: typeof meta.hasNextPage === "boolean" ? meta.hasNextPage : currentPage < totalPages,
    hasPrevPage: typeof meta.hasPrevPage === "boolean" ? meta.hasPrevPage : currentPage > 1,
  };
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductModerationStats>({
    queueTotal: 0,
    pendingApproval: 0,
    activeProducts: 0,
    averageRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagination, setPagination] = useState(() => getNormalizedPagination({}, 1));

  // Search Debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, categoryFilter, statusFilter]);

  // Load Data
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const query: any = {
          page,
          limit: PAGE_SIZE,
          search: debouncedSearchTerm || undefined,
          category: categoryFilter === "all" ? undefined : categoryFilter,
        };

        // التعديل الجديد: إرسال حالة الـ Approval فقط إذا لم تكن "all"
        if (statusFilter === "approved") query.isApproved = true;
        if (statusFilter === "pending") query.isApproved = false;

        const productsResult = await productService.getAllProducts(query);

        setProducts(productsResult.products || []);
        setPagination(getNormalizedPagination(productsResult.pagination || {}, page));
        setStats(calculateStats(productsResult.products || []));
      } catch (error: any) {
        toast.error(error.message || "Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, [page, debouncedSearchTerm, categoryFilter, statusFilter, reloadKey]);

  const categories = useMemo(() => {
    const map = new Map<string, { label: string; value: string }>();
    products.forEach((item) => {
      if (typeof item.category === "string") {
        map.set(item.category, { label: item.category, value: item.category });
        return;
      }
      const value = item.category._id || item.category.slug || item.category.name;
      map.set(value, { label: item.category.name, value });
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [products]);

  const visibleCountLabel = useMemo(() => {
    if (pagination.totalItems === 0) return "No products";
    const start = (pagination.currentPage - 1) * pagination.limit + 1;
    const end = Math.min(start + products.length - 1, pagination.totalItems);
    return `Showing ${start}-${end} of ${pagination.totalItems}`;
  }, [pagination.currentPage, pagination.limit, pagination.totalItems, products.length]);

  // التعديل الجديد: دالة الـ Toggle (تستخدم للـ Switch)
  const handleApproveToggle = async (id: string) => {
    try {
      setActionLoadingId(id);
      await productService.approveProduct(id); 
      setReloadKey((value) => value + 1);
      toast.success("Status updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Update failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      setActionLoadingId(id);
      await productService.toggleProductStatus(id);
      setReloadKey((value) => value + 1);
      toast.success("Product active status updated");
    } catch (error: any) {
      toast.error("Status update failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm("Are you sure you want to delete this product?");
    if (!shouldDelete) return;

    try {
      setActionLoadingId(id);
      await productService.deleteProduct(id);
      
      // منطق الباجيناشن عند الحذف
      const hasSingleItemOnPage = products.length === 1;
      const nextPage = hasSingleItemOnPage && page > 1 ? page - 1 : page;
      setPage(nextPage);
      
      if (nextPage === page) setReloadKey((value) => value + 1);
      toast.success("Product deleted");
    } catch (error: any) {
      toast.error("Delete failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Products Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage product approvals and inventory status.</p>
        </div>
      </div>

      <ProductStats stats={stats} />

      <ProductFilters
        categories={categories}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
      />

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-20 text-center text-slate-400 font-bold animate-pulse">
          LOADING PRODUCTS...
        </div>
      ) : (
        <>
          <ProductTable
            actionLoadingId={actionLoadingId}
            onApprove={handleApproveToggle} // نمرر الدالة المحدثة
            onDelete={handleDelete}
            onDetails={(id) => router.push(`/products/${id}`)}
            onToggleActive={handleToggleActive}
            products={products}
          />

          {/* Pagination Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">{visibleCountLabel}</p>

            <div className="flex items-center gap-2">
              <button
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-opacity"
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>

              <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                Page {pagination.currentPage} / {pagination.totalPages}
              </span>

              <button
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-opacity"
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}