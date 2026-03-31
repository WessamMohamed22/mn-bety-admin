export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent?: Category | string | null;
  image?: {
    url: string;
    publicId: string;
  };
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  parent?: string;
  order?: number;
  isActive?: boolean;
  image?: File;
}

export type UpdateCategoryPayload = CreateCategoryPayload;