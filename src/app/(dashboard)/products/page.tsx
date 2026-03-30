"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ProductFilters } from "@/components/layout/features/products/ProductFilters";
import { ProductStats } from "@/components/layout/features/products/ProductStats";
import { ProductTable } from "@/components/layout/features/products/ProductTable";
import { productService } from "@/services/product.service";
import type { Product, ProductModerationStats } from "@/types/product";

const getCategoryName = (product: Product): string =>
  typeof product.category === "string" ? product.category : product.category.name;

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productService.getAllProducts({
        page: 1,
        limit: 50,
        sort: "-createdAt",
      });
      setProducts(response.products || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load products";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const categories = useMemo(() => {
    const names = products.map((item) => getCategoryName(item));
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products.filter((item) => {
      const matchesSearch =
        term.length === 0 ||
        item.name.toLowerCase().includes(term) ||
        item._id.toLowerCase().includes(term) ||
        getCategoryName(item).toLowerCase().includes(term);

      const matchesCategory = categoryFilter === "all" || getCategoryName(item) === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && item.isApproved) ||
        (statusFilter === "pending" && !item.isApproved);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const stats = useMemo(() => calculateStats(filteredProducts), [filteredProducts]);

  const handleApprove = async (id: string) => {
    try {
      setActionLoadingId(id);
      const { isApproved } = await productService.approveProduct(id);
      setProducts((prev) => prev.map((item) => (item._id === id ? { ...item, isApproved } : item)));
      toast.success("Product approved");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Approval failed";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      setActionLoadingId(id);
      const { isActive } = await productService.toggleProductStatus(id);
      setProducts((prev) => prev.map((item) => (item._id === id ? { ...item, isActive } : item)));
      toast.success("Product status updated");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Status update failed";
      toast.error(message);
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
      setProducts((prev) => prev.filter((item) => item._id !== id));
      toast.success("Product deleted");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Delete failed";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Products Management</h1>
          <p className="text-sm text-slate-500 mt-1">Connected to backend products API with moderation actions.</p>
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
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading products...</div>
      ) : (
        <ProductTable
          actionLoadingId={actionLoadingId}
          onApprove={handleApprove}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          products={filteredProducts}
        />
      )}
    </div>
  );
}