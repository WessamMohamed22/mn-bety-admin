import { publicApi } from "./api";
import { API_ENDPOINTS } from "@/constants/endpoints";
import {
	ACCESS_TOKEN_COOKIE_KEY,
	ACCESS_TOKEN_STORAGE_KEY,
	USER_ROLES_COOKIE_KEY,
	USER_STORAGE_KEY,
} from "@/constants/auth";
import { ADMIN_ROLES } from "@/constants/roles";
import type { User } from "@/types";

type ApiEnvelope<T> = {
	data?: T;
	message?: string;
};

type LoginPayload = {
	user: User;
	accessToken: string;
};

type LoginInput = {
	email: string;
	password: string;
};

const isBrowser = () => typeof window !== "undefined";

const setCookie = (name: string, value: string, maxAgeInSeconds: number) => {
	if (!isBrowser()) return;
	document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeInSeconds}; SameSite=Lax`;
};

const getCookie = (name: string) => {
	if (!isBrowser()) return null;

	const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
};

const clearCookie = (name: string) => {
	if (!isBrowser()) return;
	document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
};

const getTokenExpiryInSeconds = (token: string) => {
	try {
		const payload = JSON.parse(atob(token.split(".")[1] || "")) as { exp?: number };
		if (!payload.exp) return 60 * 60 * 24;

		const nowInSeconds = Math.floor(Date.now() / 1000);
		return Math.max(payload.exp - nowInSeconds, 1);
	} catch {
		return 60 * 60 * 24;
	}
};

export const saveAuthSession = (accessToken: string, user: User) => {
	if (!isBrowser()) return;

	const maxAgeInSeconds = getTokenExpiryInSeconds(accessToken);

	setCookie(ACCESS_TOKEN_COOKIE_KEY, accessToken, maxAgeInSeconds);
	setCookie(USER_ROLES_COOKIE_KEY, (user.roles || []).join("|"), maxAgeInSeconds);

	localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
	localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const getStoredToken = () => {
	if (!isBrowser()) return null;
	return getCookie(ACCESS_TOKEN_COOKIE_KEY) || localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const getStoredUser = (): User | null => {
	if (!isBrowser()) return null;

	const rawUser = localStorage.getItem(USER_STORAGE_KEY);
	if (!rawUser) return null;

	try {
		return JSON.parse(rawUser) as User;
	} catch {
		localStorage.removeItem(USER_STORAGE_KEY);
		return null;
	}
};

export const clearAuthSession = () => {
	if (!isBrowser()) return;

	clearCookie(ACCESS_TOKEN_COOKIE_KEY);
	clearCookie(USER_ROLES_COOKIE_KEY);

	localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
	localStorage.removeItem(USER_STORAGE_KEY);
};

export const getStoredRoles = () => {
	const rolesCookie = getCookie(USER_ROLES_COOKIE_KEY);
	if (!rolesCookie) return [];

	return rolesCookie
		.split("|")
		.map((role) => role.trim())
		.filter(Boolean);
};

export const hasAdminRole = (user: Pick<User, "roles"> | null) => {
	if (!user?.roles?.length) return false;
	return user.roles.some((role) => ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]));
};

export const authService = {
	login: async ({ email, password }: LoginInput): Promise<LoginPayload> => {
		const response = await publicApi.post<ApiEnvelope<LoginPayload>>(API_ENDPOINTS.AUTH.LOGIN, {
			email,
			password,
		});

		const payload = response.data?.data;
		if (!payload?.accessToken || !payload?.user) {
			throw new Error("Invalid login response from server");
		}

		saveAuthSession(payload.accessToken, payload.user);
		return payload;
	},

	logout: async () => {
		try {
			await publicApi.post(API_ENDPOINTS.AUTH.LOGOUT);
		} finally {
			clearAuthSession();
		}
	},
};