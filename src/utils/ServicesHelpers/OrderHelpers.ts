// src/utils/orderHelper.ts
import type { AxiosResponse } from "axios";

/**
 * Extract error message helper
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any;
  return anyErr?.response?.data?.error || anyErr?.message || fallback;
}

/**
 * Checks if an error is a 404 Not Found
 */
function isNotFound(err: unknown): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any;
  return (
    anyErr?.response?.status === 404 || 
    anyErr?.message === "Request failed with status code 404"
  );
}

/**
 * Handler for List calls
 * Extracts { total, data } -> returns data[]
 */
export async function handleListResponse<T>(
  apiCall: () => Promise<AxiosResponse<{ data: T[] }>>,
  errorMessage: string
): Promise<T[]> {
  try {
    const response = await apiCall();
    return response.data.data;
  } catch (err) {
    console.error(errorMessage, err);
    throw new Error(extractErrorMessage(err, errorMessage));
  }
}

/**
 * Handler for Standard calls (Create)
 * Returns direct data
 */
export async function handleStandardRequest<T>(
  apiCall: () => Promise<AxiosResponse<T>>,
  errorMessage: string
): Promise<T> {
  try {
    const response = await apiCall();
    return response.data;
  } catch (err) {
    console.error(errorMessage, err);
    throw new Error(extractErrorMessage(err, errorMessage));
  }
}

/**
 * Handler for Get/Update calls
 * Returns T if successful, undefined if 404
 */
export async function handleOptionalRequest<T>(
  apiCall: () => Promise<AxiosResponse<T>>,
  errorMessage: string
): Promise<T | undefined> {
  try {
    const response = await apiCall();
    return response.data;
  } catch (err) {
    if (isNotFound(err)) {
      return undefined;
    }
    console.error(errorMessage, err);
    throw new Error(extractErrorMessage(err, errorMessage));
  }
}

/**
 * Handler for Delete calls
 * Returns true if success, false if 404
 */
export async function handleDeleteRequest(
  apiCall: () => Promise<AxiosResponse<void>>,
  errorMessage: string
): Promise<boolean> {
  try {
    await apiCall();
    return true;
  } catch (err) {
    if (isNotFound(err)) {
      return false;
    }
    console.error(errorMessage, err);
    throw new Error(extractErrorMessage(err, errorMessage));
  }
}