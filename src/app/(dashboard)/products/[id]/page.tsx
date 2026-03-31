"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowRight, Package, Star, Tag, User,
  Calendar, DollarSign, Layers, Hash,
  CheckCircle2, Clock3, Power, ChevronLeft, ChevronRight,
} from "lucide-react";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";
import { formatCurrency, formatDate } from "@/utils/formatters";

const PLACEHOLDER = "https://placehold.co/900x700/png";

const getCategoryName = (p: Product) =>
  typeof p.category === "string" ? p.category : p.category?.name || "Unknown";

const getSellerName = (p: Product) =>
  typeof p.seller === "string" ? p.seller : p.seller.userId?.fullName || "Unknown Seller";

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-5 w-32 bg-slate-200 rounded-lg" />
      <div className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="aspect-4/3 rounded-2xl bg-slate-200" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-7 w-3/4 bg-slate-200 rounded-lg" />
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-5/6 bg-slate-100 rounded" />
          <div className="grid grid-cols-2 gap-3 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon, label, value, colorClass = "bg-slate-50 text-slate-500",
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  colorClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const [product,            setProduct]            = useState<Product | null>(null);
  const [isLoading,          setIsLoading]          = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    const load = async () => {
      try {
        setIsLoading(true);
        setProduct(await productService.getProductById(id));
        setSelectedImageIndex(0);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [params?.id]);

  if (isLoading) return <LoadingSkeleton />;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Package size={28} className="text-slate-400" />
        </div>
        <p className="font-bold text-slate-700 text-lg">Product not found</p>
        <p className="text-sm text-slate-400 mt-1 mb-6">This product may have been deleted.</p>
        <Link
          href="/products"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors"
        >
          <ArrowRight size={15} />
          Back to Products
        </Link>
      </div>
    );
  }

  const images    = product.images?.length ? product.images : [{ url: PLACEHOLDER, publicId: "ph" }];
  const safeIdx   = Math.min(selectedImageIndex, images.length - 1);
  const activeImg = images[safeIdx]?.url || PLACEHOLDER;

  const prevImage = () => setSelectedImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setSelectedImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-6">

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-slate-500 hover:text-orange-600 font-semibold transition-colors"
        >
          <ArrowRight size={14} />
          Products
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* ── Main Card ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — Images ──────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          {/* Main image */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-100 aspect-4/3 group">
            <Image
              alt={product.name}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              fill
              src={activeImg}
              unoptimized
            />

            {/* Status badges overlay */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <span className={[
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm",
                product.isApproved
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-500 text-white",
              ].join(" ")}>
                {product.isApproved
                  ? <><CheckCircle2 size={11} /> Approved</>
                  : <><Clock3 size={11} /> Pending</>}
              </span>
              <span className={[
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm",
                product.isActive
                  ? "bg-blue-500 text-white"
                  : "bg-slate-500 text-white",
              ].join(" ")}>
                <Power size={11} />
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  type="button"
                >
                  <ChevronRight size={16} className="text-slate-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  type="button"
                >
                  <ChevronLeft size={16} className="text-slate-700" />
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur">
                {safeIdx + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={img.publicId || img.url || i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={[
                    "relative overflow-hidden rounded-xl border-2 aspect-square transition-all",
                    safeIdx === i
                      ? "border-orange-400 ring-2 ring-orange-100 scale-95"
                      : "border-slate-200 hover:border-slate-300",
                  ].join(" ")}
                  type="button"
                >
                  <Image
                    alt={`${product.name} ${i + 1}`}
                    className="object-cover"
                    fill
                    src={img.url || PLACEHOLDER}
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Right — Details ────────────────────────────────────────────────── */}
        <section className="space-y-5">

          {/* Product name + description */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">
                {product.name}
              </h1>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                #{product._id.slice(-6).toUpperCase()}
              </span>
            </div>

            {product.description && (
              <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {product.description}
              </p>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoCard
              icon={DollarSign}
              label="Price"
              value={formatCurrency(product.price)}
              colorClass="bg-orange-100 text-orange-600"
            />
            {product.discountPrice ? (
              <InfoCard
                icon={DollarSign}
                label="Discount Price"
                value={formatCurrency(product.discountPrice)}
                colorClass="bg-rose-100 text-rose-600"
              />
            ) : (
              <InfoCard
                icon={Layers}
                label="Stock"
                value={`${product.stock} units`}
                colorClass="bg-blue-100 text-blue-600"
              />
            )}
            <InfoCard
              icon={Tag}
              label="Category"
              value={getCategoryName(product)}
              colorClass="bg-purple-100 text-purple-600"
            />
            <InfoCard
              icon={User}
              label="Seller"
              value={getSellerName(product)}
              colorClass="bg-teal-100 text-teal-600"
            />
            <InfoCard
              icon={Star}
              label="Rating"
              value={`${product.rating?.toFixed(1) || "0.0"} (${product.numReviews || 0} reviews)`}
              colorClass="bg-amber-100 text-amber-600"
            />
            <InfoCard
              icon={Calendar}
              label="Created At"
              value={formatDate(product.createdAt)}
              colorClass="bg-slate-100 text-slate-500"
            />
            {product.slug && (
              <InfoCard
                icon={Hash}
                label="Slug"
                value={product.slug}
                colorClass="bg-indigo-100 text-indigo-600"
              />
            )}
            {product.discountPrice && (
              <InfoCard
                icon={Layers}
                label="Stock"
                value={`${product.stock} units`}
                colorClass="bg-blue-100 text-blue-600"
              />
            )}
          </div>

          {/* Status pills */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Status</p>
            <div className="flex flex-wrap gap-2">
              <span className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border",
                product.isApproved
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200",
              ].join(" ")}>
                {product.isApproved ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                {product.isApproved ? "Approved" : "Pending Approval"}
              </span>

              <span className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border",
                product.isActive
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-100 text-slate-600 border-slate-200",
              ].join(" ")}>
                <Power size={13} />
                {product.isActive ? "Active" : "Inactive"}
              </span>

              {product.isFeatured && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-purple-50 text-purple-700 border-purple-200">
                  <Star size={13} />
                  Featured
                </span>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}