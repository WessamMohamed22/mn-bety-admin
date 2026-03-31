export interface User {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  roles: string[];
  isActive?: boolean;
  isDeleted?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  roles?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  emailVerified?: boolean;
}

export interface PaginationMeta {
  pageNumber?: number;
  page?: number;
  currentPage?: number;
  safeLimit?: number;
  limit?: number;
  total?: number;
  totalItems?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface UsersListResult {
  users: User[];
  pagination: PaginationMeta;
}