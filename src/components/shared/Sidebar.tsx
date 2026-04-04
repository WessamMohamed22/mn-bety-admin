"use client";
import {
  X, LayoutDashboard, Package,
  Store, Users, Tags, LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingOrdersCount?: number;
}

const navItems = [
  { label: "الرئيسية",   href: "/",           icon: LayoutDashboard },
  { label: "المنتجات",   href: "/products",    icon: Package },
  // { label: "الطلبات",    href: "/orders",      icon: ShoppingBag },
  { label: "الفئات",     href: "/categories",  icon: Tags },
  { label: "المستخدمين", href: "/users",        icon: Users },
  { label: "المتاجر",    href: "/sellers",      icon: Store },
];

export function Sidebar({ isOpen, onClose, pendingOrdersCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await authService.logout();
      toast.success("تم تسجيل الخروج");
      onClose();
      router.replace("/login");
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <button
          aria-label="close sidebar"
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
          type="button"
        />
      )}

      <aside
        className={[
          "fixed top-0 right-0 z-50 h-screen w-72",
          "bg-white border-l border-slate-200",
          "flex flex-col transition-transform duration-300",
          "shadow-2xl md:shadow-none",
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Image
              src="/logo02.png"
              alt="من بيتي"
              width={150}
              height={40}
              className="object-contain h-auto w-auto"
              priority
            />
            <div>
       
            </div>
          </div>

          {/* Mobile close button */}
          <button
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Nav ──────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-orange">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={[
                  "flex items-center justify-between px-4 py-3 rounded-xl",
                  "font-bold text-sm transition-all duration-200",
                  isActive
                    ? "bg-orange-50 text-orange-600 ring-1 ring-orange-200 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={[
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                      isActive
                        ? "bg-orange-100 text-orange-600"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
                    ].join(" ")}
                  >
                    <Icon size={16} />
                  </span>
                  {label}
                </span>

                {/* Badge */}
                {href === "/orders" && pendingOrdersCount > 0 && (
                  <span className="rounded-full bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 leading-none">
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="mx-4 h-px bg-slate-100" />

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="px-3 py-4 space-y-1">
          {/* <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
              <Settings size={16} />
            </span>
            الإعدادات
          </Link> */}

          <button
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
            type="button"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50">
              <LogOut size={16} />
            </span>
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}