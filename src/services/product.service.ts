// src/services/products.service.ts
import api from "./api/axios"; // adapt path if needed
import type { Product,Review, ProductData, ProductQuery } from "../types/product";


const normalize = (p: ProductData): Product => ({
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
});

const productsService = {
  async list(q: ProductQuery = {}) {
    // adapt this to your API
    try {
      const resp = await api.get("/products", { params: q });
      const body = resp.data;
      // expecting { data: Product[], total, page, limit } or simple array
      if (Array.isArray(body)) {
        return { data: body.map(normalize), total: body.length, page: 1, limit: body.length };
      }
      return {
        data: (body.data ?? []).map(normalize),
        total: Number(body.total ?? (body.data ?? []).length),
        page: Number(body.page ?? 1),
        limit: Number(body.limit ?? q.limit ?? 20),
      };
    } catch (err) {
      // fallback: empty
      console.error("productsService.list error", err);
      return { data: [], total: 0, page: 1, limit: q.limit ?? 20 };
    }
    },
    async get(id: string): Promise<Product> {
      const resp = await api.get(`/products/${id}`);
      return normalize(resp.data);
    },

   async getProducts(opts?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    tags?: string[];
    featured?: boolean;
  }): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const params: Record<string, string | number> = {};
    if (opts?.page) params.page = opts.page;
    if (opts?.limit) params.limit = opts.limit;
    if (opts?.search) params.search = opts.search;
    if (opts?.category) params.category = opts.category;
    if (opts?.featured !== undefined) params.featured = opts.featured ? 'true' : 'false';
    if (opts?.tags && opts.tags.length) params.tags = opts.tags.join(',');
    const resp = await api.get('/products', { params });
    return resp.data;
  },


  // lightweight mock for featured
  async featured(limit = 6) {
    const res = await productsService.list({ page: 1, limit });
    return res;
    },
  /** Get similar products by category then tags. limit default 6 */
  async getSimilarProducts(product: Product, limit = 6): Promise<Product[]> {
    if (!product) return [];
    // prefer category match
    const byCategory = await this.getProducts({ category: product.category, limit });
    const hits = byCategory.data.filter((p) => p.id !== product.id);
    if (hits.length >= limit) return hits.slice(0, limit);

    // fall back to tag-based (combine tags)
    const tags = product.tags ?? [];
    if (tags.length === 0) return hits;

    const byTags = await this.getProducts({ tags, limit: limit * 2 });
    const unique = byTags.data.filter((p) => p.id !== product.id && !hits.find(h => h.id === p.id));
    return [...hits, ...unique].slice(0, limit);
  },
  /**
   * Reviews — for demo we return dummy reviews (could be a real endpoint later)
   * In production you would have GET /products/:id/reviews
   */
  async getReviews(productId: string, page = 1, limit = 6): Promise<{ data: Review[]; total: number }> {
    // dummy static reviews (could be keyed by productId). Enough variation for UI.
    const sample: Review[] = [
      {
        id: "r1",
        productId,
        user: { id: "u1", name: "Sara M.", avatar: undefined },
        rating: 5,
        title: "Fantastic build & sound",
        body: "Exceeded expectations — great battery, comfortable fit and excellent noise cancelling.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        helpful: 12,
      },
      {
        id: "r2",
        productId,
        user: { id: "u2", name: "David H.", avatar: undefined },
        rating: 4,
        title: "Very good but pricey",
        body: "A small learning curve with controls but overall very satisfied.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        helpful: 3,
      },
      {
        id: "r3",
        productId,
        user: { id: "u3", name: "Priya K.", avatar: undefined },
        rating: 3,
        title: "OK for the price",
        body: "Sound is good; ANC could be better. Good battery though.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
        helpful: 1,
      },
      {
        id: "r4",
        productId,
        user: { id: "u4", name: "Marcus L.", avatar: undefined },
        rating: 5,
        title: "Love it!",
        body: "Comfortable for long sessions and the app is useful.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
        helpful: 22,
      },
      {
        id: "r5",
        productId,
        user: { id: "u5", name: "Ellen R.", avatar: undefined },
        rating: 4,
        title: "Great pickup",
        body: "Solid product, arrived quickly. Packaging impressive.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        helpful: 6,
      },
    ];

    const start = (page - 1) * limit;
    const pageSlice = sample.slice(start, start + limit);
    return Promise.resolve({ data: pageSlice, total: sample.length });
  },
};

export default productsService;
