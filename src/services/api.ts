import axios from "axios";
import {
  ACCESS_TOKEN_COOKIE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
  USER_ROLES_COOKIE_KEY,
  USER_STORAGE_KEY,
} from "@/constants/auth";
import { API_ENDPOINTS } from "@/constants/endpoints";
import type { Role } from "@/constants/roles";
import type { User, UsersListResult, UsersQuery } from "@/types/user";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const getCookie = (name: string) => {
  if (typeof window === "undefined") return null;

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const clearClientSession = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);

  document.cookie = `${ACCESS_TOKEN_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${USER_ROLES_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
};

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return getCookie(ACCESS_TOKEN_COOKIE_KEY) || localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const maybeError = err as { response?: { data?: { message?: string } } };
  return maybeError.response?.data?.message || fallback;
};

export const publicApi = axios.create({
  baseURL,
  withCredentials: true,
});

export const privateApi = axios.create({
  baseURL,
  withCredentials: true,
});

privateApi.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = getCookie(ACCESS_TOKEN_COOKIE_KEY) || localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (!token) return config;

  if (config.headers && typeof config.headers.set === "function") {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

privateApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      clearClientSession();

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

type UsersPayload = {
  users: User[];
  pagination: UsersListResult["pagination"];
};

export const getAdminUsers = async (query: UsersQuery = {}): Promise<UsersListResult> => {
  try {
    const response = await privateApi.get<ApiEnvelope<UsersPayload>>(API_ENDPOINTS.ADMIN.USERS, {
      params: query,
      headers: getAuthHeaders(),
    });

    const payload = response.data?.data;
    return {
      users: payload?.users || [],
      pagination: payload?.pagination || {},
    };
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Failed to fetch users"));
  }
};

export const toggleAdminUserStatus = async (userId: string): Promise<User> => {
  try {
    const response = await privateApi.patch<ApiEnvelope<{ user: User }>>(
      `${API_ENDPOINTS.ADMIN.USERS}/${userId}/status`,
      {},
      { headers: getAuthHeaders() }
    );

    const user = response.data?.data?.user;
    if (!user) {
      throw new Error("Invalid toggle status response");
    }

    return user;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Failed to update user status"));
  }
};

export const updateAdminUserRole = async (userId: string, role: Role): Promise<User> => {
  try {
    const response = await privateApi.patch<ApiEnvelope<{ user: User }>>(
      `${API_ENDPOINTS.ADMIN.USERS}/${userId}/role`,
      { role },
      { headers: getAuthHeaders() }
    );

    const user = response.data?.data?.user;
    if (!user) {
      throw new Error("Invalid update role response");
    }

    return user;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Failed to update user role"));
  }
};

export const softDeleteAdminUser = async (userId: string): Promise<void> => {
  try {
    await privateApi.delete(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`, {
      headers: getAuthHeaders(),
    });
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Failed to delete user"));
  }
};

export default privateApi;