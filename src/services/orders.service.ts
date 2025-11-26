// src/services/orders.service.ts
import api from "./api/axios";
import type { Order } from "../types/Order";
import { 
  handleListResponse, 
  handleStandardRequest, 
  handleOptionalRequest, 
  handleDeleteRequest 
} from "../utils/ServicesHelpers/OrderHelpers";

const ORDERS_BASE_PATH = "/orders";

export const ordersService = {
  /**
   * READ ALL ORDERS
   */
  getAll: (): Promise<Order[]> => {
    return handleListResponse<Order>(
      () => api.get<{ total: number; data: Order[] }>(ORDERS_BASE_PATH),
      "Error fetching all orders"
    );
  },

  /**
   * READ SINGLE ORDER
   */
  getById: (id: string): Promise<Order | undefined> => {
    return handleOptionalRequest<Order>(
      () => api.get<Order>(`${ORDERS_BASE_PATH}/${id}`),
      `Error fetching order ${id}`
    );
  },

  /**
   * CREATE NEW ORDER
   */
  create: (partial: Partial<Order>): Promise<Order> => {
    return handleStandardRequest<Order>(
      () => api.post<Order>(ORDERS_BASE_PATH, partial),
      "Error creating new order"
    );
  },

  /**
   * UPDATE EXISTING ORDER
   */
  update: (id: string, patch: Partial<Order>): Promise<Order | undefined> => {
    return handleOptionalRequest<Order>(
      () => api.put<Order>(`${ORDERS_BASE_PATH}/${id}`, patch),
      `Error updating order ${id}`
    );
  },

  /**
   * DELETE ORDER
   */
  delete: (id: string): Promise<boolean> => {
    return handleDeleteRequest(
      () => api.delete(`${ORDERS_BASE_PATH}/${id}`),
      `Error deleting order ${id}`
    );
  },

  // --- Status Change Helpers ---

  /**
   * CANCELLATION
   */
  cancel: (id: string): Promise<Order | undefined> => {
    return ordersService.update(id, { status: "cancelled" });
  },

  /**
   * FULFILLMENT
   */
  fulfill: (id: string): Promise<Order | undefined> => {
    return ordersService.update(id, { status: "fulfilled" });
  },
};