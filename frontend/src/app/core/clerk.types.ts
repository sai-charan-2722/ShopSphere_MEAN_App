import type { Role } from '../shared/models';

/** Minimal typed surface of the Clerk JS instance we rely on. */
export interface ClerkUserResource {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  imageUrl?: string;
  primaryEmailAddress?: { emailAddress: string } | null;
  publicMetadata: { role?: Role } & Record<string, unknown>;
}

export interface ClerkSessionResource {
  id: string;
  getToken(options?: { template?: string }): Promise<string | null>;
}

export interface ClerkInstance {
  loaded: boolean;
  user?: ClerkUserResource | null;
  session?: ClerkSessionResource | null;
  load(options?: Record<string, unknown>): Promise<void>;
  addListener(callback: (payload: { user?: ClerkUserResource | null; session?: ClerkSessionResource | null }) => void): () => void;
  openSignIn(options?: Record<string, unknown>): void;
  signOut(callback?: () => void): Promise<void>;
  mountSignIn(node: HTMLElement, options?: Record<string, unknown>): void;
  mountSignUp(node: HTMLElement, options?: Record<string, unknown>): void;
  unmountSignIn?(node: HTMLElement): void;
  unmountSignUp?(node: HTMLElement): void;
}

declare global {
  interface Window {
    Clerk?: ClerkInstance;
  }
}
