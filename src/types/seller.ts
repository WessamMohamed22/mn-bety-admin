export interface SellerUser {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface SellerLogo {
  url: string;
  publicId: string;
}

export interface SellerLocation {
  country?: string;
  city?: string;
  address?: string;
}

export interface SellerBankInfo {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  iban?: string;
}

export interface Seller {
  _id: string;
  userId: string | SellerUser;
  description?: string;
  logo?: SellerLogo;
  isApproved: boolean;
  isActive: boolean;
  rating?: number;
  totalSales?: number;
  location?: SellerLocation;
  bankInfo?: SellerBankInfo;
  storeName?: string;
  shopName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SellersQuery {
  page?: number;
  limit?: number;
  search?: string;
  isApproved?: boolean;
}

export interface SellersPaginationMeta {
  pageNumber?: number;
  page?: number;
  currentPage?: number;
  safeLimit?: number;
  limit?: number;
  total?: number;
  totalItems?: number;
  totalPages?: number;
  pages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface SellersListResult {
  sellers: Seller[];
  pagination: SellersPaginationMeta;
}