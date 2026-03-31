"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { productService } from "@/services/product.service";
import { sellerService } from "@/services/seller.service";
import type { Product } from "@/types/product";
import type { Seller } from "@/types/seller";

const PRODUCTS_PAGE_SIZE = 8;

const getOwnerName = (seller: Seller): string => {
  if (typeof seller.userId === "string") return "Unknown";
  return seller.userId.fullName || seller.userId.email || "Unknown";
};

const getStoreName = (seller: Seller): string => {
  // Use owner name as store name since there's no explicit store name field
  return getOwnerName(seller);
};

const getOwnerEmail = (seller: Seller): string => {
  if (typeof seller.userId === "string" || !seller.userId) return "-";
  return seller.userId.email || "-";
};

export default function SellerDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadSellerDetails = async () => {
      try {
        setIsLoading(true);

        const sellerId = params.id;
        const [sellerData, productsResult] = await Promise.all([
          sellerService.getSellerById(sellerId),
          productService.getAllProducts({ seller: sellerId, page: 1, limit: PRODUCTS_PAGE_SIZE }),
        ]);

        setSeller(sellerData);
        setProducts(productsResult.products || []);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load seller details";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSellerDetails();
  }, [params.id]);

  const handleApprove = async () => {
    if (!seller) return;
    const confirmed = window.confirm("Approve this seller account?");
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await sellerService.approveSeller(seller._id);
      setSeller({ ...seller, isApproved: true });
      toast.success("Seller approved");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to approve seller";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!seller) return;
    const confirmed = window.confirm("Reject this seller account?");
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await sellerService.rejectSeller(seller._id);
      setSeller({ ...seller, isApproved: false });
      toast.success("Seller rejected");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to reject seller";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!seller) return;
    const confirmed = window.confirm(
      seller.isActive ? "Suspend this seller account?" : "Activate this seller account?"
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await sellerService.toggleSellerStatus(seller._id);
      setSeller({ ...seller, isActive: !seller.isActive });
      toast.success("Seller status updated");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update seller status";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const approvedProductsCount = useMemo(
    () => products.filter((product) => product.isApproved).length,
    [products]
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Loading seller details...
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Seller not found.</p>
        <button
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          onClick={() => router.push("/sellers")}
          type="button"
        >
          Back to Sellers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Seller Details</h1>
          <p className="mt-1 text-sm text-slate-500">Complete profile and products for this store.</p>
        </div>

        <button
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={() => router.push("/sellers")}
          type="button"
        >
          Back
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {seller.logo?.url ? (
                <Image
                  alt={getStoreName(seller)}
                  className="h-full w-full object-cover"
                  height={64}
                  src={seller.logo.url}
                  width={64}
                />
              ) : null}
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">{getStoreName(seller)}</h2>
              <p className="text-sm text-slate-600">Owner: {getOwnerName(seller)}</p>
              <p className="text-sm text-slate-600">Email: {getOwnerEmail(seller)}</p>
              <p className="text-sm text-slate-600">
                Approval: {seller.isApproved ? "Approved" : "Pending"} | Status: {seller.isActive ? "Active" : "Suspended"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Description</p>
              <p className="mt-1 text-sm text-slate-700">{seller.description || "-"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Location</p>
              <p className="mt-1 text-sm text-slate-700">
                {[seller.location?.country, seller.location?.city, seller.location?.address]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Rating</p>
              <p className="mt-1 text-sm text-slate-700">{seller.rating ?? 0}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Total Sales</p>
              <p className="mt-1 text-sm text-slate-700">{seller.totalSales ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Actions</h3>
            <div className="space-y-2">
              {!seller.isApproved && (
                <button
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  disabled={actionLoading}
                  onClick={handleApprove}
                  type="button"
                >
                  Approve Seller
                </button>
              )}

              {seller.isApproved && (
                <button
                  className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                  disabled={actionLoading}
                  onClick={handleReject}
                  type="button"
                >
                  Reject Seller
                </button>
              )}

              <button
                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                  seller.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={actionLoading}
                onClick={handleToggleStatus}
                type="button"
              >
                {seller.isActive ? "Suspend Seller" : "Activate Seller"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Bank Info</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>Bank: {seller.bankInfo?.bankName || "-"}</p>
              <p>Account Name: {seller.bankInfo?.accountName || "-"}</p>
              <p>Account Number: {seller.bankInfo?.accountNumber || "-"}</p>
              <p>IBAN: {seller.bankInfo?.iban || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Store Products</h3>
          <p className="text-xs font-semibold text-slate-500">
            {approvedProductsCount}/{products.length} approved
          </p>
        </div>

        {products.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No products found for this seller.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                className="rounded-xl border border-slate-200 p-3 transition-colors hover:border-orange-300"
                href={`/products/${product._id}`}
                key={product._id}
              >
                <div className="mb-2 h-28 overflow-hidden rounded-lg bg-slate-100">
                  {product.images?.[0]?.url ? (
                    <Image
                      alt={product.name}
                      className="h-full w-full object-cover"
                      height={112}
                      src={product.images[0].url}
                      width={220}
                    />
                  ) : null}
                </div>
                <p className="line-clamp-1 text-sm font-semibold text-slate-800">{product.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {product.isApproved ? "Approved" : "Pending"} | {product.isActive ? "Active" : "Inactive"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}