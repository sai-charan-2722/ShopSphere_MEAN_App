import { Injectable, computed, signal } from "@angular/core";
import type { ClerkInstance, ClerkUserResource } from "../clerk.types";
import type { Role } from "../../shared/models";

declare global {
  interface Window {
    Clerk?: ClerkInstance;
    __internal_ClerkUICtor?: unknown;
  }
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  readonly user = signal<ClerkUserResource | null>(null);
  readonly loaded = signal(false);

  readonly isSignedIn = computed(() => this.user() !== null);

  readonly role = computed<Role>(
    () => (this.user()?.publicMetadata?.role as Role | undefined) ?? "buyer",
  );

  private clerkReady: Promise<ClerkInstance> | null = null;

  /**
   * Initializes Clerk that has already been loaded through
   * the CDN script tags in index.html.
   *
   * This should be called once from provideAppInitializer().
   */
  initClerk(): Promise<ClerkInstance> {
    if (this.clerkReady) {
      return this.clerkReady;
    }

    this.clerkReady = this.initializeClerk();

    return this.clerkReady;
  }

  /**
   * Wait until the Clerk CDN scripts have loaded and initialize Clerk.
   */
  private async initializeClerk(): Promise<ClerkInstance> {
    const clerk = await this.waitForClerk();

    if (!clerk) {
      throw new Error(
        "[auth] ClerkJS was not loaded. Check the Clerk CDN scripts in index.html.",
      );
    }

    if (!window.__internal_ClerkUICtor) {
      throw new Error(
        "[auth] Clerk UI bundle was not loaded. " +
          "Make sure @clerk/ui is loaded before clerk-js in index.html.",
      );
    }

    try {
      if (!clerk.loaded) {
        await clerk.load({
          ui: {
            ClerkUI: window.__internal_ClerkUICtor,
          },
        });
      } else {
        // Clerk may already have been loaded by the CDN bootstrap.
        // Still make sure the UI bundle is available.
        console.log("[auth] Clerk was already loaded");
      }
    } catch (error) {
      console.error("[auth] Clerk initialization failed:", error);
      throw error;
    }

    this.afterLoad(clerk);

    return clerk;
  }

  /**
   * Waits for the Clerk CDN script to create window.Clerk.
   *
   * Since the script is loaded with `defer`, Angular can start
   * before the global becomes available in some startup scenarios.
   */
  private waitForClerk(timeoutMs = 10000): Promise<ClerkInstance | null> {
    if (window.Clerk) {
      return Promise.resolve(window.Clerk);
    }

    return new Promise((resolve) => {
      const start = Date.now();

      const check = () => {
        if (window.Clerk) {
          resolve(window.Clerk);
          return;
        }

        if (Date.now() - start >= timeoutMs) {
          resolve(null);
          return;
        }

        setTimeout(check, 50);
      };

      check();
    });
  }

  /**
   * Allows components/guards/interceptors to wait for Clerk.
   */
  ready(): Promise<ClerkInstance> {
    if (!this.clerkReady) {
      return Promise.reject(
        new Error(
          "[auth] Clerk has not been initialized. " +
            "Make sure initClerk() is called from provideAppInitializer().",
        ),
      );
    }

    return this.clerkReady;
  }

  /**
   * Synchronize Clerk state into Angular signals.
   */
  private afterLoad(clerk: ClerkInstance): void {
    this.sync(clerk);
    try {
      clerk.addListener(() => {
        this.sync(clerk);
      });
    } catch (error) {
      console.warn("[auth] Could not register Clerk listener:", error);
    }
    this.loaded.set(true);
  }

  private sync(clerk: ClerkInstance): void {
    this.user.set(clerk.user ?? null);
  }

  /**
   * Get a fresh Clerk session JWT for the Authorization header.
   */
  async getToken(): Promise<string | null> {
    const clerk = await this.ready();
    return (await clerk.session?.getToken()) ?? null;
  }

  /**
   * Sign the current user out.
   */
  async signOut(): Promise<void> {
    const clerk = await this.ready();
    await clerk.signOut();
    this.user.set(null);
  }

  /**
   * Open Clerk's Sign In overlay.
   */
  openSignIn(): void {
    window.Clerk?.openSignIn();
  }
}