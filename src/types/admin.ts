// src/types/admin.ts
export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  deletedUsers: number;
  newThisMonth: number;
  byRole: {
    ADMIN?: number;
    SUPER_ADMIN?: number;
    USER?: number;
    SELLER?: number;
    CUSTOMER?: number;
  };
}

export interface StatsResponse {
  success: boolean;
  message: string;
  data: {
    stats: AdminStats;
  };
}