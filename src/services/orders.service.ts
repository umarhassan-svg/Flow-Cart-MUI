// orders.service.ts
// Uses the backend API endpoints for full CRUD operations.

import type { Order } from "../types/Order";
// The following types are generally not needed for the service layer
// when dealing directly with the Order type from the API response:
// import type { Product } from "../types/Product"; 
// import type { CartItem } from "../types/Cart";

// Import the configured axios instance
import api from "./api/axios"; 

// Base URL path for the orders resource
const ORDERS_BASE_PATH = "/orders";

// The ordersService object now uses asynchronous API calls (fetch/axios)

export const ordersService = {
    /**
     * READ ALL ORDERS (GET /orders)
     */
    getAll: async (): Promise<Order[]> => {
        try {
            // The API returns { total: number, data: Order[] }
            const response = await api.get<{ total: number; data: Order[] }>(ORDERS_BASE_PATH);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching all orders:", error);
            throw error;
        }
    },

    /**
     * READ SINGLE ORDER (GET /orders/:id)
     */
    getById: async (id: string): Promise<Order | undefined> => {
        try {
            const response = await api.get<Order>(`${ORDERS_BASE_PATH}/${id}`);
            return response.data;
        } catch (error: unknown) {
          // Handle 404 specifically if needed, otherwise re-throw
          if (error instanceof Error && error.message === "Request failed with status code 404") {
            return undefined;
          }
          console.error(`Error fetching order ${id}:`, error);
          throw error;
        }
    },

    /**
     * CREATE NEW ORDER (POST /orders)
     * NOTE: The backend handles generating ID, date, and orderNumber.
     */
    create: async (partial: Partial<Order>): Promise<Order> => {
        try {
            const response = await api.post<Order>(ORDERS_BASE_PATH, partial);
            return response.data;
        } catch (error) {
            console.error("Error creating new order:", error);
            throw error;
        }
    },

    /**
     * UPDATE EXISTING ORDER (PUT /orders/:id)
     * We use PUT for general update, aligning with the backend implementation.
     */
    update: async (id: string, patch: Partial<Order>): Promise<Order | undefined> => {
        try {
            const response = await api.put<Order>(`${ORDERS_BASE_PATH}/${id}`, patch);
            return response.data;
        } catch (error: unknown) {
          if(error instanceof Error){
            if(error.message === "Request failed with status code 404"){
              return undefined;
            }

          }
          console.error(`Error updating order ${id}:`, error);
          throw error;
        }
    },

    /**
     * DELETE ORDER (DELETE /orders/:id)
     */
    delete: async (id: string): Promise<boolean> => {
        try {
            // The API returns 204 No Content on success
            await api.delete(`${ORDERS_BASE_PATH}/${id}`);
            return true;
        } catch (error: unknown) {
          if (error instanceof Error){
            if (error.message === "Request failed with status code 404") {
              return false;
            }
            }
            console.error(`Error deleting order ${id}:`, error);
            throw error;
        }
    },

    // --- Status Change Helpers ---
    
    /**
     * CANCELLATION (Uses update to change status)
     */
    cancel: async (id: string): Promise<Order | undefined> => {
        // Sends a patch to the backend to set the status
        return ordersService.update(id, { status: "cancelled" });
    },

    /**
     * FULFILLMENT (Uses update to change status)
     */
    fulfill: async (id: string): Promise<Order | undefined> => {
        // Sends a patch to the backend to set the status
        return ordersService.update(id, { status: "fulfilled" });
    },

    /**
     * Test helper removed as it's no longer necessary with an API connection.
     */
};