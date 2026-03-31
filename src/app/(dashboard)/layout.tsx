import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { ACCESS_TOKEN_COOKIE_KEY, USER_ROLES_COOKIE_KEY } from "@/constants/auth";
import { ROLES } from "@/constants/roles";

const tokenIsActive = (token: string | undefined) => {
  if (!token) return false;

  try {
    const payloadBase64 = token.split(".")[1] || "";
    const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson) as { exp?: number };

    if (!payload.exp) return true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowInSeconds;
  } catch {
    return false;
  }
};

const hasAdminRole = (rolesValue: string | undefined) => {
  if (!rolesValue) return false;

  const roles = decodeURIComponent(rolesValue)
    .split("|")
    .map((role) => role.trim())
    .filter(Boolean);

  return roles.includes(ROLES.ADMIN) || roles.includes(ROLES.SUPER_ADMIN);
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE_KEY)?.value;
  const roles = cookieStore.get(USER_ROLES_COOKIE_KEY)?.value;

  const canAccess = tokenIsActive(token) && hasAdminRole(roles);
  if (!canAccess) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}