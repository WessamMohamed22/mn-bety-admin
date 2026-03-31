// src/services/admin.service.ts
import api from "./api"; // Assuming this is your axios instance
import { StatsResponse } from "@/types/admin";

export const getPlatformStats = async (): Promise<StatsResponse> => {
  const response = await api.get("/admin/stats");
  return response.data;
};