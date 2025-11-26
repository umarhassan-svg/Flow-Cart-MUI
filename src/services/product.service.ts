// src/services/products.service.ts
import api from "./api/axios";
import type { Product, Review, ProductQuery } from "../types/Product";
import { 
  handleListCall, 
  handleGetProduct, 
  handleSearchCall, 
  handleSimilarLogic, 
  generateMockReviews, 
  buildProductParams 
} from "../utils/ServicesHelpers/ProductHelpers";

const productsService = {
  // 1. List
  list(q: ProductQuery = {}) {
    return handleListCall(
      () => api.get("/products", { params: q }),
      q.limit
    );
  },

  // 2. Get Single
  get(id: string): Promise<Product> {
    return handleGetProduct(
      () => api.get(`/products/${id}`)
    );
  },

  // 3. Get Products (Search/Filter)
  getProducts(opts?: {
    page?: number; limit?: number; search?: string; category?: string; tags?: string[]; featured?: boolean;
  }): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    return handleSearchCall(
      () => api.get('/products', { params: buildProductParams(opts) })
    );
  },

  // 4. Featured (Wrapper around list)
  featured(limit = 6) {
    return this.list({ page: 1, limit });
  },

  // 5. Similar Products
  // Note: We pass 'this.getProducts' as a callback so the helper can execute the search logic
  getSimilarProducts(product: Product, limit = 6): Promise<Product[]> {
    return handleSimilarLogic(
      product, 
      limit, 
      (opts) => this.getProducts(opts)
    );
  },

  // 6. Reviews (Mock)
  getReviews(productId: string, page = 1, limit = 6): Promise<{ data: Review[]; total: number }> {
    return generateMockReviews(productId, page, limit);
  },
};

export default productsService;