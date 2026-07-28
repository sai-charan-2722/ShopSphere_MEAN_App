import type { Request, Response } from 'express';
import { Webhook } from 'svix';
import { User } from '../models/User.model';
import { getCurrentUser } from '../utils/currentUser';
import { ApiResponse } from '../utils/apiResponse';
import { env } from '../config/env';
import { HttpError, type Role } from '../types';

interface ClerkEmail {
  id: string;
  email_address: string;
}
interface ClerkUserData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string;
  email_addresses?: ClerkEmail[];
  primary_email_address_id?: string;
  public_metadata?: { role?: Role };
}
interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserData;
}

function primaryEmail(data: ClerkUserData): string {
  const primary = data.email_addresses?.find((e) => e.id === data.primary_email_address_id);
  return primary?.email_address ?? data.email_addresses?.[0]?.email_address ?? `${data.id}@placeholder.shopsphere`;
}

function fullName(data: ClerkUserData): string {
  return [data.first_name, data.last_name].filter(Boolean).join(' ') || 'ShopSphere User';
}

/** POST /api/auth/sync — ensure a MongoDB mirror exists for the Clerk user. */
export const syncUser = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  res.json(ApiResponse.ok(user, 'User synced'));
};

/** GET /api/auth/me — current user profile from MongoDB. */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUser(req);
  res.json(ApiResponse.ok(user));
};

/**
 * POST /api/auth/webhook — Clerk webhook (svix-verified).
 * Handles user.created / user.updated / user.deleted.
 * NOTE: this route uses express.raw() so req.body is a Buffer.
 */
export const clerkWebhook = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body as Buffer;
  const headers = {
    'svix-id': req.header('svix-id') ?? '',
    'svix-timestamp': req.header('svix-timestamp') ?? '',
    'svix-signature': req.header('svix-signature') ?? '',
  };

  let evt: ClerkWebhookEvent;
  try {
    const wh = new Webhook(env.clerk.webhookSecret);
    evt = wh.verify(payload.toString('utf8'), headers) as ClerkWebhookEvent;
  } catch {
    throw new HttpError(400, 'Invalid Clerk webhook signature');
  }

  const { type, data } = evt;

  switch (type) {
    case 'user.created':
      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          $setOnInsert: {
            clerkId: data.id,
            role: data.public_metadata?.role ?? 'buyer',
          },
          $set: {
            name: fullName(data),
            email: primaryEmail(data),
            avatar: data.image_url,
            isActive: true,
          },
        },
        { upsert: true, new: true },
      );
      break;

    case 'user.updated':
      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          $set: {
            name: fullName(data),
            email: primaryEmail(data),
            avatar: data.image_url,
            ...(data.public_metadata?.role ? { role: data.public_metadata.role } : {}),
          },
        },
      );
      break;

    case 'user.deleted':
      await User.findOneAndUpdate({ clerkId: data.id }, { $set: { isActive: false } });
      break;

    default:
      // ignore other events
      break;
  }

  res.json(ApiResponse.ok(null, `Processed ${type}`));
};
