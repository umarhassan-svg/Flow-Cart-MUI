// src/utils/productHelper.ts
import type { AxiosResponse } from "axios";
import type { Product, ProductData, Review } from "../../types/Product";
type ApiResponse = {
  limit: number;
  page: number;
  total: number;
  data: Product[];
  status: number;
};


/**
 * 1. Normalization Logic
 * Transforms raw API data into the strict Product interface
 */
export function normalizeProduct(p: ProductData): Product {
  return {
    id: String(p.id ?? p._id ?? `${Math.random()}`),
    title: p.title ?? "Untitled product",
    description: p.description ?? "",
    price: Number(p.price ?? 0),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : undefined,
    currency: p.currency ?? "USD",
    images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
    rating: typeof p.rating === "number" ? p.rating : 0,
    reviewsCount: Number(p.reviewsCount ?? 0),
    featured: Boolean(p.featured),
    category: p.category ?? "default",
    stock: typeof p.stock === "number" ? p.stock : undefined,
  };
}

/**
 * 2. Parameter Builder
 * Converts the options object into a clean query parameter object
 */
export function buildProductParams(opts?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
}): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (opts?.page) params.page = opts.page;
  if (opts?.limit) params.limit = opts.limit;
  if (opts?.search) params.search = opts.search;
  if (opts?.category) params.category = opts.category;
  if (opts?.featured !== undefined) params.featured = opts.featured ? 'true' : 'false';
  if (opts?.tags && opts.tags.length) params.tags = opts.tags.join(',');
  return params;
}

/**
 * 3. List Handler
 * Handles the "List" endpoint which might return an Array OR a Paginated Object.
 * Also includes the specific fallback (returns empty list instead of throwing).
 */
export async function handleListCall(
  apiCall: () => Promise<AxiosResponse<ApiResponse>>,
  queryLimit: number = 20
): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
  try {
    const resp = await apiCall();
    const body = resp.data;

    // Case A: API returns simple array
    if (Array.isArray(body)) {
      return { 
        data: body.map(normalizeProduct), 
        total: body.length, 
        page: 1, 
        limit: body.length 
      };
    }

    // Case B: API returns paginated object
    return {
      data: (body.data ?? []).map(normalizeProduct),
      total: Number(body.total ?? (body.data ?? []).length),
      page: Number(body.page ?? 1),
      limit: Number(body.limit ?? queryLimit),
    };
  } catch (err) {
    console.error("productsService.list error", err);
    // Specific requirement: Return empty object on error, don't throw
    return { data: [], total: 0, page: 1, limit: queryLimit };
  }
}

/**
 * 4. Single Item Handler
 * Wraps simple GETs and normalizes the result
 */
export async function handleGetProduct(
  apiCall: () => Promise<AxiosResponse<Product>>
): Promise<Product> {
  try {
    const resp = await apiCall();
    return normalizeProduct(resp.data);
  } catch (err: unknown) {
      if (err instanceof Error) throw new Error((err)?.message || "Failed to fetch product");
      throw new Error("Failed to fetch product");
  }
}

/**
 * 5. Search/Filter Handler
 * Returns the raw data structure from the advanced search endpoint
 */
export async function handleSearchCall(
  apiCall: () => Promise<AxiosResponse<{ data: Product[]; total: number; page: number; limit: number }>>
) {
  try {
    const resp = await apiCall();
    return resp.data;
  } catch (err) {
    if (err instanceof Error) throw new Error((err)?.message || "Failed to search product");
      throw new Error("Failed to search product");
  }
}

/**
 * 6. Similar Products Logic
 * Encapsulates the logic of fetching by category, then by tags, and filtering duplicates.
 */
export async function handleSimilarLogic(
  product: Product,
  limit: number,
  fetchFn: (opts: { category?: string; tags?: string[]; limit?: number }) => Promise<{ data: Product[] }>
): Promise<Product[]> {
  try {
    if (!product) return [];

    // 1. Try Category
    const byCategory = await fetchFn({ category: product.category, limit });
    const hits = byCategory.data.filter((p) => p.id !== product.id);
    
    if (hits.length >= limit) return hits.slice(0, limit);

    // 2. Fallback to Tags
    const tags = product.tags ?? [];
    if (tags.length === 0) return hits;

    const byTags = await fetchFn({ tags, limit: limit * 2 });
    const unique = byTags.data.filter((p) => p.id !== product.id && !hits.find(h => h.id === p.id));
    
    return [...hits, ...unique].slice(0, limit);
  } catch (err) {
    console.warn("Error fetching similar products", err);
    return []; 
  }
}

/**
 * 7. Mock Reviews Logic
 */
export function generateMockReviews(productId: string, page: number, limit: number): Promise<{ data: Review[]; total: number }> {
  const sample: Review[] = [
    { id: "r1", productId, user: { id: "u1", name: "Sara M." }, rating: 5, title: "Fantastic build", body: "Exceeded expectations.", createdAt: new Date().toISOString(), helpful: 12 },
    { id: "r2", productId, user: { id: "u2", name: "David H." }, rating: 4, title: "Good but pricey", body: "Satisfied overall.", createdAt: new Date().toISOString(), helpful: 3 },
    { id: "r3", productId, user: { id: "u3", name: "Priya K." }, rating: 3, title: "OK", body: "Average experience.", createdAt: new Date().toISOString(), helpful: 1 },
    { id: "r4", productId, user: { id: "u4", name: "Marcus L." }, rating: 5, title: "Love it!", body: "Comfortable.", createdAt: new Date().toISOString(), helpful: 22 },
    { id: "r5", productId, user: { id: "u5", name: "Ellen R." }, rating: 4, title: "Great", body: "Arrived quickly.", createdAt: new Date().toISOString(), helpful: 6 },
  ];

  const start = (page - 1) * limit;
  const pageSlice = sample.slice(start, start + limit);
  return Promise.resolve({ data: pageSlice, total: sample.length });
}