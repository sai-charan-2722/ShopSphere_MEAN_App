import type { PaginationMeta } from '../types';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Parse `page` / `limit` query params into safe, bounded values.
 * Defaults to page 1, 12 items/page; hard cap at 48 items/page.
 */
export function parsePagination(query: { page?: unknown; limit?: unknown }): ParsedPagination {
  let page = parseInt(String(query.page ?? '1'), 10);
  let limit = parseInt(String(query.limit ?? DEFAULT_LIMIT), 10);

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return { page, limit, skip: (page - 1) * limit };
}

export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
