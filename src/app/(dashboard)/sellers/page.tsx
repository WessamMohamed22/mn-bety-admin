"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { sellerService } from "@/services/seller.service";
import type { Seller, SellersPaginationMeta } from "@/types/seller";

const PAGE_SIZE = 10;

const getOwnerName = (seller: Seller): string => {
  if (typeof seller.userId === "string" || !seller.userId) return "Unknown";
  return seller.userId.fullName || seller.userId.email || "Unknown";
};

const getStoreName = (seller: Seller): string => {
  // Use owner name as store name since there's no explicit store name field
  return getOwnerName(seller);
};

const getNormalizedPagination = (meta: SellersPaginationMeta, fallbackPage: number) => {
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

export default function SellersPage() {
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagination, setPagination] = useState(() => getNormalizedPagination({}, 1));

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    const loadSellers = async () => {
      try {
        setIsLoading(true);
        const result = await sellerService.getAllSellers({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearchTerm || undefined,
          isApproved:
            statusFilter === "all"
              ? undefined
              : statusFilter === "approved",
        });

        setSellers(result.sellers || []);
        setPagination(getNormalizedPagination(result.pagination || {}, page));
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load sellers";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSellers();
  }, [page, debouncedSearchTerm, statusFilter, reloadKey]);

  const visibleCountLabel = useMemo(() => {
    if (pagination.totalItems === 0) return "No sellers";

    const start = (pagination.currentPage - 1) * pagination.limit + 1;
    const end = Math.min(start + sellers.length - 1, pagination.totalItems);
    return `Showing ${start}-${end} of ${pagination.totalItems}`;
  }, [pagination.currentPage, pagination.limit, pagination.totalItems, sellers.length]);

  const handleApprove = async (sellerId: string) => {
    const confirmed = window.confirm("Approve this seller account?");
    if (!confirmed) return;

    try {
      setActionLoadingId(sellerId);
      await sellerService.approveSeller(sellerId);
      setReloadKey((prev) => prev + 1);
      toast.success("Seller approved");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to approve seller";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (sellerId: string) => {
    const confirmed = window.confirm("Reject this seller account?");
    if (!confirmed) return;

    try {
      setActionLoadingId(sellerId);
      await sellerService.rejectSeller(sellerId);
      setReloadKey((prev) => prev + 1);
      toast.success("Seller rejected");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to reject seller";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (seller: Seller) => {
    const confirmed = window.confirm(
      seller.isActive ? "Suspend this seller account?" : "Activate this seller account?"
    );
    if (!confirmed) return;

    try {
      setActionLoadingId(seller._id);
      await sellerService.toggleSellerStatus(seller._id);
      setReloadKey((prev) => prev + 1);
      toast.success("Seller status updated");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update seller status";
      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Sellers Management</h1>
          <p className="mt-1 text-sm text-slate-500">Approve sellers, inspect store details, and manage account status.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 md:max-w-md"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by store name"
            type="text"
            value={searchTerm}
          />

          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-300"
            onChange={(event) => setStatusFilter(event.target.value as "all" | "approved" | "pending")}
            value={statusFilter}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading sellers...</div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Store</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Owner</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Approval</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {sellers.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={5}>
                        No sellers found.
                      </td>
                    </tr>
                  ) : (
                    sellers.map((seller) => (
                      <tr className="border-t border-slate-100" key={seller._id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                              {seller.logo?.url ? (
                                <Image
                                  alt={getStoreName(seller)}
                                  className="h-full w-full object-cover"
                                  height={40}
                                  src={seller.logo.url}
                                  width={40}
                                />
                              ) : null}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">{getStoreName(seller)}</p>
                              <p className="text-xs text-slate-500">#{seller._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-700">{getOwnerName(seller)}</td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              seller.isApproved
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {seller.isApproved ? "Approved" : "Pending"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              seller.isActive
                                ? "bg-blue-50 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {seller.isActive ? "Active" : "Suspended"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {!seller.isApproved && (
                              <button
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                disabled={actionLoadingId === seller._id}
                                onClick={() => handleApprove(seller._id)}
                                type="button"
                              >
                                Approve
                              </button>
                            )}

                            {seller.isApproved && (
                              <button
                                className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                                disabled={actionLoadingId === seller._id}
                                onClick={() => handleReject(seller._id)}
                                type="button"
                              >
                                Reject
                              </button>
                            )}

                            <button
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              onClick={() => router.push(`/sellers/${seller._id}`)}
                              type="button"
                            >
                              Details
                            </button>

                            <button
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              disabled={actionLoadingId === seller._id}
                              onClick={() => handleToggleStatus(seller)}
                              type="button"
                            >
                              {seller.isActive ? "Suspend" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-500">{visibleCountLabel}</p>

            <div className="flex items-center gap-2">
              <button
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                type="button"
              >
                Previous
              </button>

              <span className="text-xs font-semibold text-slate-600">
                Page {pagination.currentPage} / {pagination.totalPages}
              </span>

              <button
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => setPage((prev) => prev + 1)}
                type="button"
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