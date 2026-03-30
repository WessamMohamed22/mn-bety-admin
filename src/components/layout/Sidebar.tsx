"use client";

import { X, LayoutDashboard, Package, ShoppingBag, Store, Users, Tags, RefreshCw, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingOrdersCount?: number;
}

const navItems = [
  { label: "الرئيسية", href: "/", icon: LayoutDashboard },
  { label: "المنتجات", href: "/products", icon: Package },
  { label: "الطلبات", href: "/orders", icon: ShoppingBag },
  { label: "الفئات", href: "/categories", icon: Tags },
  { label: "المستخدمين", href: "/users", icon: Users },
  { label: "المتاجر", href: "/sellers", icon: Store },
];

export function Sidebar({ isOpen, onClose, pendingOrdersCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <button
          aria-label="close sidebar overlay"
          className="fixed inset-0 bg-black/35 backdrop-blur-[1px] z-40 md:hidden"
          onClick={onClose}
          type="button"
        />
      )}

      <aside
        className={[
          "fixed top-0 right-0 z-50 h-screen w-72 bg-[#f7f8f8] border-l border-slate-200/80",
          "flex flex-col transition-transform duration-300 shadow-xl md:shadow-none",
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-200/80">
          <div>
            <p className="text-lg font-extrabold text-slate-900 leading-tight">Mn Bety Admin</p>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider">CONTROL PANEL</p>
          </div>
          <button
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all",
                  isActive
                    ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
                onClick={onClose}
              >
                <span className="flex items-center gap-3">
                  <Icon size={19} />
                  <span>{item.label}</span>
                </span>
                {item.href === "/orders" && pendingOrdersCount > 0 && (
                  <span className="rounded-full bg-red-500 text-white text-[11px] px-2 py-0.5 leading-none">
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/80 space-y-2">
          <Link
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-orange-700 hover:bg-orange-50 transition-colors"
            href="/"
            onClick={onClose}
          >
            <RefreshCw size={18} />
            <span>تحديث لوحة التحكم</span>
          </Link>

          <Link
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
            href="/login"
            onClick={onClose}
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
