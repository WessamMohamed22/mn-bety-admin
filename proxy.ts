import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_KEY,
  USER_ROLES_COOKIE_KEY,
} from "./src/constants/auth";
import { ROLES } from "./src/constants/roles";

// ================= PUBLIC ROUTES =================
const PUBLIC_ROUTES = ["/login"];

// ================= PROTECTED ROUTES =================
const PROTECTED_PREFIXES = [
  "/products",
  "/orders",
  "/categories",
  "/users",
  "/sellers",
  "/settings",
];

// ================= TOKEN CHECK =================
const isTokenActive = (token: string | undefined) => {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1] || "")) as {
      exp?: number;
    };

    if (!payload.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
};

// ================= PROTECTED PATH CHECK =================
const isProtectedPath = (pathname: string) => {
  return PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
};

// ================= ROLE CHECK =================
const hasAdminRole = (rolesValue: string | undefined) => {
  if (!rolesValue) return false;

  const roles = decodeURIComponent(rolesValue)
    .split("|")
    .map((r) => r.trim())
    .filter(Boolean);

  return (
    roles.includes(ROLES.ADMIN) ||
    roles.includes(ROLES.SUPER_ADMIN)
  );
};

// ================= MAIN MIDDLEWARE =================
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value;
  const roles = request.cookies.get(USER_ROLES_COOKIE_KEY)?.value;

  const isLoggedIn = isTokenActive(token);
  const isAdmin = hasAdminRole(roles);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isProtected = isProtectedPath(pathname);

  // ================= 1. LOGIN PAGE =================
  if (isPublicRoute) {
    if (isLoggedIn && isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ================= 2. HOME PAGE "/" =================
  if (pathname === "/") {
    if (!isLoggedIn || !isAdmin) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete(ACCESS_TOKEN_COOKIE_KEY);
      res.cookies.delete(USER_ROLES_COOKIE_KEY);
      return res;
    }
    return NextResponse.next();
  }

  // ================= 3. PROTECTED ROUTES =================
  if (isProtected) {
    if (!isLoggedIn || !isAdmin) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete(ACCESS_TOKEN_COOKIE_KEY);
      res.cookies.delete(USER_ROLES_COOKIE_KEY);
      return res;
    }
  }

  // ================= 4. DEFAULT =================
  return NextResponse.next();
}

// ================= MATCHER =================
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};