import type { Request } from 'express';
import { User, type IUser } from '../models/User.model';
import { HttpError } from '../types';

/**
 * Resolve the MongoDB User document for the currently authenticated Clerk user.
 * If no mirror document exists yet (webhook not received), lazily create one
 * from the Clerk profile so the app never breaks on first login.
 */
export async function getCurrentUser(req: Request): Promise<IUser> {
  if (!req.userId) throw new HttpError(401, 'Unauthorized');

  let user = await User.findOne({ clerkId: req.userId });
  if (user) return user;

  // Lazy mirror creation as a fallback for the Clerk webhook.
  const clerk = req.clerkUser;
  const email =
    clerk?.emailAddresses?.find((e) => e.id === clerk.primaryEmailAddressId)?.emailAddress ??
    clerk?.emailAddresses?.[0]?.emailAddress ??
    `${req.userId}@placeholder.shopsphere`;
  const name = [clerk?.firstName, clerk?.lastName].filter(Boolean).join(' ') || 'ShopSphere User';

  user = await User.create({
    clerkId: req.userId,
    name,
    email,
    avatar: clerk?.imageUrl,
    role: req.role ?? 'buyer',
  });

  return user;
}
