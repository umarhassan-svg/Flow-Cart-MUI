/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosResponse } from "axios";
import type { User } from "../../types/User";

/**
 * Extract error message helper
 */
export function extractErrorMessage(err: unknown, fallback = "Request failed"): string {
  const anyErr = err as any;
  return (
    anyErr?.response?.data?.error ||
    anyErr?.message ||
    fallback
  );
}

/**
 * Generic API Handler
 * Wraps an API promise in try/catch and returns data.
 */
export async function handleApiCall<T>(
  apiCall: () => Promise<AxiosResponse<T>>,
  errorMessage: string
): Promise<T> {
  try {
    const resp = await apiCall();
    return resp.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, errorMessage));
  }
}

/**
 * Specialized Handler for User Retrieval
 * Handles:
 * 1. Normal fetch
 * 2. Data unpacking (if wrapped in { user: ... })
 * 3. Fallback to list search if direct fetch fails
 */
export async function handleGetUserWithFallback(
  fetchUserCall: () => Promise<AxiosResponse<any>>,
  fetchListCall: () => Promise<AxiosResponse<any>>,
  userId: string
): Promise<User> {
  try {
    const resp = await fetchUserCall();
    const data = resp.data;

    // Handle data unwrapping logic
    if (data && typeof data === "object") {
      if (data.user) return data.user as User;
      if (data.id) return data as User;
    }
    return data as User;
  } catch (err) {
    // Fallback logic
    try {
      const listResp = await fetchListCall();
      const found = listResp.data.data.find((u: User) => u.id === userId);
      if (found) return found;
    } catch (e) {
      console.error("Fallback search failed", e);
    }
    throw new Error(extractErrorMessage(err, "Failed to fetch user"));
  }
}

/**
 * Specialized Handler for Employee Card URL
 * Handles the logic for validating and formatting the download URL
 */
export async function handleCardUrlResponse(
  apiCall: () => Promise<AxiosResponse<{ url?: string }>>,
  userId: string
): Promise<string | null> {
  try {
    const resp = await apiCall();
    const url = resp.data?.url ?? null;

    if (!url) return null;

    // Check for filesystem paths (Windows/File protocol)
    const looksLikeFileSystemPath = /^[A-Za-z]:\\/.test(url) || url.startsWith("file://");
    
    if (looksLikeFileSystemPath) {
      return `/api/users/${encodeURIComponent(userId)}/employee-card/download`;
    }

    return url;
  } catch (err) {
    console.warn("Failed to fetch employeeCardUrl:", err);
    return null;
  }
}