/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosResponse } from "axios";

/**
 * Extract server error message
 */
export function extractErrorMessage(err: unknown, fallback = "Request failed"): string {
  const anyErr = err as any;
  return anyErr?.response?.data?.error || anyErr?.message || fallback;
}

/**
 * Generic API Handler
 * Executes the apiCall, returns data, handles errors.
 */
export async function handleApiCall<T>(
  apiCall: () => Promise<T>, // The function execution that returns the data
  errorMessage: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (err) {
    throw new Error(extractErrorMessage(err, errorMessage));
  }
}

/**
 * Specialized Handler for Get-By-ID with List Fallback
 * Tries to fetch specific ID. If fails, fetches list and searches for ID.
 */
export async function handleGetWithFallback<T extends { id: string }>(
  fetchItemCall: () => Promise<AxiosResponse<T>>,
  fetchListCall: () => Promise<AxiosResponse<T[]>>,
  id: string,
  errorMessage: string
): Promise<T> {
  try {
    // 1. Try single endpoint
    const resp = await fetchItemCall();
    return resp.data;
  } catch (err) {
    // 2. Fallback: fetch list
    try {
      const listResp = await fetchListCall();
      const found = listResp.data.find((item) => item.id === id);
      if (found) return found;
    } catch {
      // Ignore fallback errors, throw original
    }
    throw new Error(extractErrorMessage(err, errorMessage));
  }
}