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
  seller?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "price" | "-price" | "createdAt" | "-createdAt" | "rating" | "-rating";
  featured?: boolean;
}

export interface ProductsListResult {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface ProductModerationStats {
  queueTotal: number;
  pendingApproval: number;
  activeProducts: number;
  averageRating: number;
}