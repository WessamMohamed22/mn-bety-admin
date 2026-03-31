"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Mail } from "lucide-react";
import toast from "react-hot-toast";
import {
  authService,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  hasAdminRole,
} from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    const currentUser = getStoredUser();

    if (token && hasAdminRole(currentUser)) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("من فضلك ادخل البريد الإلكتروني وكلمة المرور");
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await authService.login({ email: email.trim(), password });

      if (!hasAdminRole(user)) {
        clearAuthSession();
        toast.error("هذا الحساب ليس لديه صلاحية دخول لوحة الأدمن");
        return;
      }

      toast.success("تم تسجيل الدخول بنجاح");
      router.replace("/");
    } catch (error: unknown) {
      const maybeError = error as {
        code?: string;
        message?: string;
        response?: { data?: { message?: string } };
      };

      const backendUnavailable =
        !maybeError.response &&
        (maybeError.code === "ECONNREFUSED" ||
          maybeError.message?.toLowerCase().includes("network") ||
          maybeError.message?.toLowerCase().includes("econnrefused"));

      toast.error(
        backendUnavailable
          ? "الخادم غير متاح حالياً. تأكد أن الباك إند شغال وأن BACKEND_ORIGIN مضبوط صح"
          : maybeError.response?.data?.message || "فشل تسجيل الدخول"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-linear-to-br from-orange-50 via-amber-50 to-white px-4 py-8"
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-8 left-8 h-36 w-36 rounded-full bg-orange-200/35 blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-10 h-44 w-44 rounded-full bg-amber-300/30 blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/4 h-24 w-24 rounded-full bg-orange-300/25 blur-xl animate-pulse" />
      </div>

      <div className="mx-auto flex min-h-[90vh] w-full max-w-md items-center justify-center">
        <section className="relative w-full rounded-2xl border border-orange-100 bg-white/95 p-7 shadow-xl shadow-orange-200/30 backdrop-blur-sm md:p-8">
          <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-orange-300/25 blur-xl animate-pulse" />
          <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-amber-300/25 blur-xl animate-pulse" />

          <div className="mb-6 text-right">
            <h1 className="mb-2 text-2xl font-bold text-slate-800">تسجيل دخول الأدمن</h1>
            <p className="text-sm text-slate-500">ادخل بياناتك للوصول إلى لوحة التحكم</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-orange-200 bg-orange-50/40 px-4 py-3 pl-11 text-left text-slate-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  dir="ltr"
                />
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-orange-200 bg-orange-50/40 px-4 py-3 pl-11 text-left text-slate-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-orange-500"
                  aria-label={showPassword ? "اخفاء كلمة المرور" : "اظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-300/40 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <span>جاري تسجيل الدخول...</span>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">Admin Access Only</p>
        </section>
      </div>
    </main>
  );
}