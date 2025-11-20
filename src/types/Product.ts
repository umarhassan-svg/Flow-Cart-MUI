export type Product = {
  id: string;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  currency?: string;
  images?: string[]; // first image is primary
  tags?: string[];
  rating?: number; // 0-5
  reviewsCount?: number;
  featured?: boolean;
  category?: string;
  stock?: number;
};

export type Review = {
  id: string;
  productId: string;
  user: { id: string; name: string; avatar?: string };
  rating: number; // 1-5
  title?: string;
  body: string;
  createdAt: string; // ISO
  helpful?: number;
};

export type ProductQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
};
export interface ProductData {
  id?: string;
  title?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  currency?: string;
  images?: string[];
  tags?: string[];
  rating?: number;
    reviewsCount?: number;
  featured?: boolean;
  category?: string;
    stock?: number;
    _id?: string
    image?: string
}
