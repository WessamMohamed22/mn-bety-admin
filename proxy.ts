import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE_KEY, USER_ROLES_COOKIE_KEY } from "./src/constants/auth";
import { ROLES } from "./src/constants/roles";

const PUBLIC_ROUTES = ["/login"];
const PROTECTED_PREFIXES = ["/", "/products", "/orders", "/categories", "/users", "/sellers", "/settings"];

const isProtectedPath = (pathname: string) => {
  if (pathname === "/") return true;
  return PROTECTED_PREFIXES.some((prefix) => prefix !== "/" && pathname.startsWith(prefix));
};

const hasAdminRole = (rolesValue: string | undefined) => {
  if (!rolesValue) return false;

  const roles = decodeURIComponent(rolesValue)
    .split("|")
    .map((role) => role.trim())
    .filter(Boolean);

  return roles.includes(ROLES.ADMIN) || roles.includes(ROLES.SUPER_ADMIN);
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value;
  const roles = request.cookies.get(USER_ROLES_COOKIE_KEY)?.value;

  const isLoggedIn = Boolean(token);
  const isAdmin = hasAdminRole(roles);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute && isLoggedIn && isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtectedPath(pathname) && (!isLoggedIn || !isAdmin)) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(ACCESS_TOKEN_COOKIE_KEY);
    response.cookies.delete(USER_ROLES_COOKIE_KEY);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
