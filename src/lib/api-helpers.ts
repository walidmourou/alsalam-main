import { NextResponse } from "next/server";
import type { ApiResponse, ApiError } from "@/types";

/**
 * Create a successful JSON response
 */
export function successResponse<T>(data: T, message?: string, status = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return NextResponse.json(response, { status });
}

/**
 * Create an error JSON response
 */
export function errorResponse(
  error: string,
  status = 500,
  details?: string,
  code?: string,
) {
  const response: ApiError = {
    error,
    ...(details && { details }),
    ...(code && { code }),
  };
  return NextResponse.json(response, { status });
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown, context?: string) {
  console.error(`API Error${context ? ` (${context})` : ""}:`, error);

  if (error instanceof Error) {
    return errorResponse(
      "An error occurred while processing your request",
      500,
      process.env.NODE_ENV === "development" ? error.message : undefined,
    );
  }

  return errorResponse("An unexpected error occurred", 500);
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, any>,
  requiredFields: string[],
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === "";
  });

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true };
}
