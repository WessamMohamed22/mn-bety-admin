"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Home, LogOut, Menu, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authService, getStoredUser } from "@/services/auth.service";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [adminName, setAdminName] = useState("Admin User");
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const adminInitial = useMemo(() => {
    const trimmed = adminName.trim();
    return trimmed ? trimmed[0].toUpperCase() : "A";
  }, [adminName]);

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
    if (!term) return quickLinks;

    return quickLinks.filter((link) => link.label.includes(term) || link.href.includes(term));
  }, [quickLinks, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser?.fullName) {
      setAdminName(storedUser.fullName);
    }
  }, []);

  const handleRouteSelect = (href: string) => {
    setSearchTerm("");
    setIsSearchOpen(false);
    router.push(href);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && filteredLinks.length > 0) {
      handleRouteSelect(filteredLinks[0].href);
    }
  };

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

          <div className="relative w-full max-w-md" ref={searchRef}>
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-10 pl-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="ابحث داخل لوحة الادمن"
              type="text"
              value={searchTerm}
            />

            {isSearchOpen && (
              <div className="absolute top-[110%] right-0 left-0 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-40 max-h-72 overflow-y-auto scrollbar-orange">
                {filteredLinks.length > 0 ? (
                  filteredLinks.map((link) => (
                    <button
                      className="block w-full text-right px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors"
                      key={link.href}
                      onClick={() => handleRouteSelect(link.href)}
                      type="button"
                    >
                      <p className="font-bold text-black">{link.label}</p>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm font-medium text-black">لا توجد نتائج مطابقة</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-black hover:bg-slate-200"
            href="/"
          >
            <Home size={17} />
          </Link>

          {/* <button className="relative h-10 w-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" type="button">
            <Bell className="mx-auto" size={17} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
          </button> */}

          {/* <button className="h-10 w-10 rounded-xl bg-slate-100 text-black hover:bg-slate-200" type="button">
            <Settings className="mx-auto" size={17} />
          </button> */}

          <div className="hidden sm:flex items-center gap-2 px-2">
            <div className="h-9 w-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
              {adminInitial}
            </div>
            <div className="hidden lg:block leading-tight">
              <p className="text-sm font-bold text-black">{adminName}</p>
              <p className="text-xs text-slate-700">System Manager</p>
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