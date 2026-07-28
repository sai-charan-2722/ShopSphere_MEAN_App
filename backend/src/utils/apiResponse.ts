import type { PaginationMeta } from '../types';

/**
 * Standard API response wrapper.
 * EVERY endpoint returns this shape for frontend consistency.
 */
export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public message: string,
    public data?: T,
    public meta?: PaginationMeta,
  ) {}

  static ok<T>(data?: T, message = 'OK', meta?: PaginationMeta): ApiResponse<T> {
    return new ApiResponse(true, message, data, meta);
  }

  static fail(message: string): ApiResponse<never> {
    return new ApiResponse<never>(false, message);
  }
}
