import { Injectable, computed, signal } from '@angular/core';
import type { ClerkInstance, ClerkUserResource } from '../clerk.types';
import type { Role } from '../../shared/models';

/**
 * Wraps the Clerk browser SDK. Instead of bundling `@clerk/clerk-js` via npm
 * (which now pulls heavy Web3 wallet SDKs), we load Clerk's pre-bundled
 * `clerk.browser.js` from the account's Frontend API host — the officially
 * supported "script loading" approach. `initClerk()` runs once from an app
 * initializer and mirrors auth state into signals read by guards, the navbar
 * and the auth interceptor.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<ClerkUserResource | null>(null);
  readonly loaded = signal(false);

  readonly isSignedIn = computed(() => this.user() !== null);
  readonly role = computed<Role>(() => (this.user()?.publicMetadata?.role as Role | undefined) ?? 'buyer');

  private clerkReady: Promise<ClerkInstance> | null = null;

  /** Inject the Clerk CDN script and load it. Idempotent. Called from provideAppInitializer. */
  initClerk(publishableKey: string): Promise<ClerkInstance> {
    if (this.clerkReady) return this.clerkReady;

    this.clerkReady = new Promise<ClerkInstance>((resolve) => {
      const done = (clerk: ClerkInstance): void => {
        this.afterLoad(clerk);
        resolve(clerk);
      };

      // Already present (e.g. HMR or a prior bootstrap).
      if (window.Clerk?.loaded) return done(window.Clerk);

      if (!publishableKey || !publishableKey.startsWith('pk_')) {
        console.warn('[auth] No valid Clerk publishable key configured — auth features disabled.');
        return done(this.stubClerk());
      }

      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-clerk-publishable-key', publishableKey);
      script.src = this.scriptUrl(publishableKey);

      let settled = false;
      const finalize = async (): Promise<void> => {
        if (settled) return;
        settled = true;
        const clerk = window.Clerk;
        if (!clerk) return done(this.stubClerk());
        try {
          if (!clerk.loaded) await clerk.load();
        } catch (err) {
          console.warn('[auth] Clerk failed to load:', err);
        }
        done(clerk);
      };

      script.onload = () => void finalize();
      script.onerror = () => {
        console.warn('[auth] Clerk script failed to load.');
        void finalize();
      };
      document.head.appendChild(script);

      // Safety net so guards never hang if the network stalls.
      setTimeout(() => void finalize(), 12000);
    });

    return this.clerkReady;
  }

  /** Resolves once Clerk (or a stub) is ready. initClerk is always run first by the app initializer. */
  ready(): Promise<ClerkInstance> {
    return this.clerkReady ?? Promise.resolve(this.stubClerk());
  }

  private afterLoad(clerk: ClerkInstance): void {
    this.sync(clerk);
    try {
      clerk.addListener(() => this.sync(clerk));
    } catch {
      /* stub has no real listener */
    }
    this.loaded.set(true);
  }

  private sync(clerk: ClerkInstance): void {
    this.user.set(clerk.user ?? null);
  }

  /** Fresh session JWT for the Authorization header. */
  async getToken(): Promise<string | null> {
    const clerk = await this.ready();
    return (await clerk.session?.getToken()) ?? null;
  }

  async signOut(): Promise<void> {
    const clerk = await this.ready();
    await clerk.signOut();
    this.user.set(null);
  }

  openSignIn(): void {
    window.Clerk?.openSignIn();
  }

  /** Derive the Frontend API host from the publishable key and build the clerk.browser.js URL. */
  private scriptUrl(publishableKey: string): string {
    const encoded = publishableKey.replace(/^pk_(test|live)_/, '');
    let host = '';
    try {
      host = atob(encoded).replace(/\$+$/, '');
    } catch {
      host = '';
    }
    // clerk-js v5 browser build, served same-origin from the account's Frontend API.
    return `https://${host}/npm/@clerk/clerk-js@5/dist/clerk.browser.js`;
  }

  /** No-op Clerk stand-in used when no key is configured or the script can't load. */
  private stubClerk(): ClerkInstance {
    const noop = (): void => {};
    return {
      loaded: true,
      user: null,
      session: null,
      load: async () => {},
      addListener: () => () => {},
      openSignIn: noop,
      signOut: async () => {},
      mountSignIn: noop,
      mountSignUp: noop,
    } as ClerkInstance;
  }
}
