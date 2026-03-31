"use client";

import { useMemo, useState } from "react";
import { Bell, Home, LogOut, Menu, Search, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await authService.logout();
      toast.success("تم تسجيل الخروج");
      router.replace("/login");
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const quickLinks = useMemo(
    () => [
      { label: "الرئيسية", href: "/" },
      { label: "المنتجات", href: "/products" },
      { label: "الطلبات", href: "/orders" },
      { label: "الفئات", href: "/categories" },
      { label: "المستخدمين", href: "/users" },
      { label: "المتاجر", href: "/sellers" },
    ],
    []
  );

  const filteredLinks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return quickLinks.slice(0, 4);
    }

    return quickLinks.filter((link) => link.label.includes(term) || link.href.includes(term));
  }, [quickLinks, searchTerm]);

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-6">
      <div className="h-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <button
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            onClick={onMenuClick}
            type="button"
          >
            <Menu size={20} />
          </button>

          <div className="relative w-full max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-10 pl-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="ابحث داخل لوحة الادمن"
              type="text"
              value={searchTerm}
            />

            {searchTerm.trim().length > 0 && (
              <div className="absolute top-[110%] right-0 left-0 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                {filteredLinks.length > 0 ? (
                  filteredLinks.map((link) => (
                    <Link
                      className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                      href={link.href}
                      key={link.href}
                    >
                      <p className="font-semibold text-slate-800">{link.label}</p>
                      <p className="text-[11px] text-slate-500" dir="ltr">{link.href}</p>
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-slate-500">لا توجد نتائج مطابقة</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            href="/"
          >
            <Home size={17} />
          </Link>

          <button className="relative h-10 w-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" type="button">
            <Bell className="mx-auto" size={17} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" type="button">
            <Settings className="mx-auto" size={17} />
          </button>

          <div className="hidden sm:flex items-center gap-2 px-2">
            <div className="h-9 w-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div className="hidden lg:block leading-tight">
              <p className="text-sm font-bold text-slate-800">Admin User</p>
              <p className="text-xs text-slate-500">System Manager</p>
            </div>
          </div>

          <button
            className="h-10 w-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
            disabled={isLoggingOut}
            onClick={handleLogout}
            title="تسجيل الخروج"
            type="button"
          >
            <LogOut className="mx-auto" size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}