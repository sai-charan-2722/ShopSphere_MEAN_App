/** Application role type shared across the backend. */
export type Role = 'buyer' | 'seller' | 'admin';

/**
 * Minimal structural shape of a Clerk user we rely on.
 * Declared locally to avoid dual-package type conflicts between
 * `@clerk/backend` and `@clerk/express`'s nested copy.
 */
export interface ClerkUserLike {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
  primaryEmailAddressId?: string | null;
  emailAddresses?: { id: string; emailAddress: string }[];
  publicMetadata?: Record<string, unknown>;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Express Request augmentation.
 * `auth.middleware.ts` attaches the authenticated identity to every protected request.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string; // Clerk userId
      role?: Role;
      clerkUser?: ClerkUserLike;
      /** Mongo _id of the mirrored User document (resolved lazily where needed). */
      mongoUserId?: string;
    }
  }
}

/** Standard pagination query shape used by list endpoints. */
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

/** Standard pagination metadata returned in ApiResponse.meta. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** An HTTP error carrying an explicit status code. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
