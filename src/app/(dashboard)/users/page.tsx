"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search, ShieldAlert, Trash2, Users, ShieldCheck,
  UserCheck, UserX, ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { ROLES, type Role } from "@/constants/roles";
import {
  getAdminUsers, softDeleteAdminUser,
  toggleAdminUserStatus, updateAdminUserRole,
} from "@/services/api";
import type { PaginationMeta, User } from "@/types/user";

// ─── Types ────────────────────────────────────────────────────────────────────
type StatusFilter       = "all" | "active" | "inactive";
type VerificationFilter = "all" | "verified" | "unverified";
type ManageableRole     = typeof ROLES.ADMIN | typeof ROLES.SELLER | typeof ROLES.CUSTOMER;
type ConfirmModalState =
  | { type: "delete"; user: User }
  | { type: "role";   user: User; role: ManageableRole }
  | null;

const PAGE_SIZE = 10;
const MANAGEABLE_ROLES: ManageableRole[] = [ROLES.ADMIN, ROLES.SELLER, ROLES.CUSTOMER];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getUserId   = (u: User): string   => u._id || u.id || "";
const getUserRoles = (roles: string[]): string[] =>
  !roles || roles.length === 0 ? [ROLES.CUSTOMER] : [...new Set(roles)];

const isSensitiveRoleChange = (user: User, nextRole: ManageableRole) => {
  const roles = user.roles || [];
  return roles.includes(ROLES.ADMIN) || roles.includes(ROLES.SUPER_ADMIN) || nextRole === ROLES.ADMIN;
};

const getRoleStyle = (role: string) => {
  if (role === ROLES.SUPER_ADMIN) return "bg-purple-100 text-purple-700 border-purple-200";
  if (role === ROLES.ADMIN)       return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (role === ROLES.SELLER)      return "bg-amber-100  text-amber-700  border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const getRoleLabel = (role: string) => {
  if (role === ROLES.SUPER_ADMIN) return "سوبر أدمن";
  if (role === ROLES.ADMIN)       return "أدمن";
  if (role === ROLES.SELLER)      return "بائع";
  return "مشتري";
};

const getInitials = (name: string) =>
  name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "U";

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-orange-100 text-orange-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
  ];
  const idx = name?.charCodeAt(0) % colors.length || 0;
  return colors[idx];
};

const normalizePagination = (meta: PaginationMeta, fallback: number) => {
  const currentPage = meta.currentPage || meta.pageNumber || meta.page || fallback;
  const limit       = meta.limit || meta.safeLimit || PAGE_SIZE;
  const totalItems  = meta.totalItems || meta.total || 0;
  const totalPages  = meta.totalPages || Math.max(1, Math.ceil(totalItems / limit));
  return {
    currentPage, limit, totalItems, totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, colorClass,
}: { label: string; value: number; icon: React.ElementType; colorClass: string }) {
  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 leading-tight">{value}</p>
      </div>
    </article>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({
  modal, onConfirm, onCancel,
}: {
  modal: { type: "delete"; user: User } | { type: "role"; user: User; role: ManageableRole };
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
            <ShieldAlert className="text-amber-600" size={18} />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">تأكيد الإجراء</h3>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            {modal.type === "delete"
              ? `هل تريد حذف حساب "${modal.user.fullName}"؟ سيتم إلغاء تفعيل الحساب نهائياً.`
              : `هل تريد منح صلاحية "${getRoleLabel(modal.role)}" للمستخدم "${modal.user.fullName}"؟`}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            type="button"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className={[
              "px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors",
              modal.type === "delete"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-indigo-600 hover:bg-indigo-700",
            ].join(" ")}
            type="button"
          >
            {modal.type === "delete" ? "نعم، احذف" : "نعم، أضف الصلاحية"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users,               setUsers]               = useState<User[]>([]);
  const [isLoading,           setIsLoading]           = useState(true);
  const [loadingActionKey,    setLoadingActionKey]    = useState<string | null>(null);
  const [searchTerm,          setSearchTerm]          = useState("");
  const [page,                setPage]                = useState(1);
  const [roleFilter,          setRoleFilter]          = useState<"all" | ManageableRole>("all");
  const [statusFilter,        setStatusFilter]        = useState<StatusFilter>("all");
  const [verificationFilter,  setVerificationFilter]  = useState<VerificationFilter>("all");
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(null);
  const [pagination, setPagination] = useState(() => normalizePagination({} as PaginationMeta, 1));

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [roleFilter, statusFilter, verificationFilter]);

  // Fetch users
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const result = await getAdminUsers({
          page,
          limit: PAGE_SIZE,
          roles:         roleFilter         === "all" ? undefined : roleFilter,
          isActive:      statusFilter       === "all" ? undefined : statusFilter === "active",
          emailVerified: verificationFilter === "all" ? undefined : verificationFilter === "verified",
        });
        setUsers(result.users || []);
        setPagination(normalizePagination(result.pagination || {} as PaginationMeta, page));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load users";
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [page, roleFilter, statusFilter, verificationFilter]);

  // Local search filter
  const visibleUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) =>
      u.fullName?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // Stats derived from current page
  const stats = useMemo(() => ({
    total:    pagination.totalItems,
    active:   users.filter((u) => u.isActive).length,
    verified: users.filter((u) => u.emailVerified).length,
    inactive: users.filter((u) => !u.isActive).length,
  }), [users, pagination.totalItems]);

  // ── Action handlers ─────────────────────────────────────────────────────────
  const handleToggleStatus = async (user: User) => {
    const id = getUserId(user);
    try {
      setLoadingActionKey(`status-${id}`);
      const updated = await toggleAdminUserStatus(id);
      setUsers((prev) => prev.map((u) => getUserId(u) === id ? { ...u, ...updated } : u));
      toast.success("تم تحديث حالة المستخدم");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل التحديث");
    } finally {
      setLoadingActionKey(null);
    }
  };

  const performUpdateRole = async (user: User, role: ManageableRole) => {
    const id = getUserId(user);
    if ((user.roles || []).includes(role)) { toast("المستخدم لديه هذه الصلاحية"); return; }
    try {
      setLoadingActionKey(`role-${id}`);
      const updated = await updateAdminUserRole(id, role as Role);
      setUsers((prev) => prev.map((u) => getUserId(u) === id ? { ...u, ...updated } : u));
      toast.success("تم تحديث الصلاحيات");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل التحديث");
    } finally {
      setLoadingActionKey(null);
    }
  };

  const handleSoftDelete = async (user: User) => {
    const id = getUserId(user);
    try {
      setLoadingActionKey(`delete-${id}`);
      await softDeleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => getUserId(u) !== id));
      setPagination((prev) => ({ ...prev, totalItems: Math.max(0, prev.totalItems - 1) }));
      toast.success("تم حذف المستخدم");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل الحذف");
    } finally {
      setLoadingActionKey(null);
    }
  };

  const onConfirm = async () => {
    if (!confirmModal) return;
    if (confirmModal.type === "delete") await handleSoftDelete(confirmModal.user);
    if (confirmModal.type === "role")   await performUpdateRole(confirmModal.user, confirmModal.role);
    setConfirmModal(null);
  };

  const rangeLabel = useMemo(() => {
    if (pagination.totalItems === 0) return "لا يوجد مستخدمون";
    const start = (pagination.currentPage - 1) * pagination.limit + 1;
    const end   = Math.min(start + users.length - 1, pagination.totalItems);
    return `عرض ${start}–${end} من ${pagination.totalItems} مستخدم`;
  }, [pagination, users.length]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">إدارة المستخدمين</h1>
        <p className="text-sm text-slate-500 mt-1">
          إدارة الحسابات والصلاحيات والحالات بشكل آمن من لوحة التحكم.
        </p>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="إجمالي المستخدمين" value={pagination.totalItems} icon={Users}      colorClass="bg-orange-100 text-orange-600" />
        <StatCard label="نشطون"              value={stats.active}          icon={UserCheck}  colorClass="bg-emerald-100 text-emerald-600" />
        <StatCard label="موقوفون"            value={stats.inactive}        icon={UserX}      colorClass="bg-rose-100 text-rose-600" />
        <StatCard label="بريد مُفعَّل"       value={stats.verified}        icon={ShieldCheck} colorClass="bg-blue-100 text-blue-600" />
      </section>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={15} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">تصفية النتائج</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-9 pl-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all placeholder:text-slate-400"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم أو الإيميل..."
              value={searchTerm}
            />
          </div>

          {/* Role */}
          <select
            className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all text-slate-700"
            onChange={(e) => setRoleFilter(e.target.value as "all" | ManageableRole)}
            value={roleFilter}
          >
            <option value="all">كل الصلاحيات</option>
            <option value={ROLES.ADMIN}>أدمن</option>
            <option value={ROLES.SELLER}>بائع</option>
            <option value={ROLES.CUSTOMER}>مشتري</option>
          </select>

          {/* Status */}
          <select
            className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all text-slate-700"
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            value={statusFilter}
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">موقوف</option>
          </select>

          {/* Email verification */}
          <select
            className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all text-slate-700"
            onChange={(e) => setVerificationFilter(e.target.value as VerificationFilter)}
            value={verificationFilter}
          >
            <option value="all">كل الإيميلات</option>
            <option value="verified">مُفعَّل</option>
            <option value="unverified">غير مُفعَّل</option>
          </select>
        </div>
      </section>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      {isLoading ? (
        /* Skeleton */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-32" />
                <div className="h-2.5 bg-slate-100 rounded w-48" />
              </div>
              <div className="h-6 bg-slate-100 rounded-full w-16" />
              <div className="h-7 bg-slate-100 rounded-lg w-20" />
            </div>
          ))}
        </div>
      ) : visibleUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-slate-400" />
          </div>
          <p className="font-bold text-slate-700">لا توجد نتائج</p>
          <p className="text-sm text-slate-400 mt-1">حاول تغيير معايير البحث أو التصفية</p>
        </div>
      ) : (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-right">المستخدم</th>
                  <th className="px-5 py-3.5 text-right">الإيميل</th>
                  <th className="px-5 py-3.5 text-right">الصلاحيات</th>
                  <th className="px-5 py-3.5 text-right">الحالة</th>
                  <th className="px-5 py-3.5 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleUsers.map((user) => {
                  const id              = getUserId(user);
                  const roles           = getUserRoles(user.roles || []);
                  const isProtected     = (user.roles || []).includes(ROLES.SUPER_ADMIN);
                  const isStatusLoading = loadingActionKey === `status-${id}`;
                  const isRoleLoading   = loadingActionKey === `role-${id}`;
                  const isDeleteLoading = loadingActionKey === `delete-${id}`;

                  return (
                    <tr key={id || user.email} className="hover:bg-slate-50/50 transition-colors group">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(user.fullName || "")}`}>
                            {getInitials(user.fullName || "")}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.fullName}</p>
                            <p className="text-xs text-slate-400">
                              {user.emailVerified ? (
                                <span className="text-emerald-600">✓ بريد مُفعَّل</span>
                              ) : (
                                <span className="text-amber-500">⚠ غير مُفعَّل</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-slate-600 text-xs" dir="ltr">
                        {user.email}
                      </td>

                      {/* Roles */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {roles.map((role) => (
                            <span
                              key={role}
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getRoleStyle(role)}`}
                            >
                              {getRoleLabel(role)}
                            </span>
                          ))}
                          {!isProtected && (
                            <select
                              className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 outline-none focus:ring-1 focus:ring-orange-300 cursor-pointer disabled:opacity-40"
                              disabled={isRoleLoading}
                              onChange={(e) => {
                                const r = e.target.value as ManageableRole;
                                if (!r) return;
                                isSensitiveRoleChange(user, r)
                                  ? setConfirmModal({ type: "role", user, role: r })
                                  : void performUpdateRole(user, r);
                                e.target.value = "";
                              }}
                              value=""
                            >
                              <option value="">+ إضافة</option>
                              {MANAGEABLE_ROLES.map((r) => (
                                <option key={r} value={r}>{getRoleLabel(r)}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={[
                          "rounded-full border px-2.5 py-1 text-xs font-bold",
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-600 border-rose-200",
                        ].join(" ")}>
                          {user.isActive ? "نشط" : "موقوف"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={isStatusLoading || isProtected}
                            onClick={() => void handleToggleStatus(user)}
                            className={[
                              "px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors disabled:opacity-40",
                              user.isActive
                                ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
                            ].join(" ")}
                            type="button"
                          >
                            {isStatusLoading ? "..." : user.isActive ? "إيقاف" : "تفعيل"}
                          </button>

                          <button
                            disabled={isDeleteLoading || isProtected}
                            onClick={() => setConfirmModal({ type: "delete", user })}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40"
                            type="button"
                          >
                            {isDeleteLoading ? "..." : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {visibleUsers.map((user) => {
              const id          = getUserId(user);
              const roles       = getUserRoles(user.roles || []);
              const isProtected = (user.roles || []).includes(ROLES.SUPER_ADMIN);

              return (
                <div key={id} className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(user.fullName || "")}`}>
                        {getInitials(user.fullName || "")}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{user.fullName}</p>
                        <p className="text-xs text-slate-400" dir="ltr">{user.email}</p>
                      </div>
                    </div>
                    <span className={[
                      "rounded-full border px-2.5 py-1 text-xs font-bold shrink-0",
                      user.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-600 border-rose-200",
                    ].join(" ")}>
                      {user.isActive ? "نشط" : "موقوف"}
                    </span>
                  </div>

                  {/* Roles */}
                  <div className="flex flex-wrap gap-1.5">
                    {roles.map((role) => (
                      <span key={role} className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getRoleStyle(role)}`}>
                        {getRoleLabel(role)}
                      </span>
                    ))}
                  </div>

                  {/* Email verified */}
                  <p className="text-xs">
                    {user.emailVerified
                      ? <span className="text-emerald-600 font-semibold">✓ بريد إلكتروني مُفعَّل</span>
                      : <span className="text-amber-500 font-semibold">⚠ البريد غير مُفعَّل</span>}
                  </p>

                  {/* Actions */}
                  {!isProtected && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => void handleToggleStatus(user)}
                        className={[
                          "flex-1 py-2 rounded-xl border text-xs font-bold transition-colors",
                          user.isActive
                            ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
                        ].join(" ")}
                        type="button"
                      >
                        {user.isActive ? "إيقاف الحساب" : "تفعيل الحساب"}
                      </button>
                      <button
                        onClick={() => setConfirmModal({ type: "delete", user })}
                        className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600"
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Pagination ─────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200 px-5 py-3 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">{rangeLabel}</p>

            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                type="button"
              >
                <ChevronRight size={14} />
                السابق
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={[
                        "w-8 h-8 rounded-xl text-xs font-bold transition-colors",
                        p === pagination.currentPage
                          ? "bg-orange-500 text-white shadow-sm"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-100",
                      ].join(" ")}
                      type="button"
                    >
                      {p}
                    </button>
                  );
                })}
                {pagination.totalPages > 5 && (
                  <span className="text-xs text-slate-400 px-1">...</span>
                )}
              </div>

              <button
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                type="button"
              >
                التالي
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Confirm Modal ─────────────────────────────────────────────────────── */}
      {confirmModal && (
        <ConfirmModal
          modal={confirmModal}
          onConfirm={() => void onConfirm()}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}