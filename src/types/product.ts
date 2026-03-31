export interface ProductImage {
  url: string;
  publicId: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug?: string;
}

export interface ProductSellerUser {
  _id?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface ProductSeller {
  _id: string;
  rating?: number;
  location?: string;
  userId?: ProductSellerUser;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: ProductImage[];
  seller: string | ProductSeller;
  category: string | ProductCategory;
  rating: number;
  numReviews: number;
  isApproved: boolean;
  isFeatured?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  categoryName?: string;
  seller?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: "approved" | "pending";
  isApproved?: boolean;
  isActive?: boolean;
  sort?: "price" | "-price" | "createdAt" | "-createdAt" | "rating" | "-rating";
  featured?: boolean;
}

export interface ProductPaginationMeta {
  currentPage?: number;
  pageNumber?: number;
  page?: number;
  totalPages?: number;
  pages?: number;
  limit?: number;
  safeLimit?: number;
  totalItems?: number;
  total?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface ProductsListResult {
  products: Product[];
  pagination: ProductPaginationMeta;
}

export interface ProductModerationStats {
  queueTotal: number;
  pendingApproval: number;
  activeProducts: number;
  averageRating: number;
}