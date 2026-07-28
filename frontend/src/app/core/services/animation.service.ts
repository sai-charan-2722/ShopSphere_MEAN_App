import { Injectable } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/**
 * Centralised GSAP helpers. Call these in `ngAfterViewInit` — never `ngOnInit`
 * (the DOM is not ready yet).
 */
@Injectable({ providedIn: 'root' })
export class AnimationService {
  /** Page entrance fade + rise. */
  pageEnter(element: HTMLElement): void {
    gsap.fromTo(element, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
  }

  /** Staggered product-card reveal on scroll. */
  staggerCards(selector: string, container?: HTMLElement): void {
    const targets = container ? container.querySelectorAll(selector) : selector;
    gsap.from(targets, {
      opacity: 0,
      y: 32,
      scale: 0.97,
      stagger: 0.07,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: container ?? (selector as unknown as HTMLElement), start: 'top 85%' },
    });
  }

  /** Fly a cloned product image to the cart icon. */
  flyToCart(productImageEl: HTMLElement, cartIconEl: HTMLElement): void {
    const clone = productImageEl.cloneNode(true) as HTMLElement;
    const fromRect = productImageEl.getBoundingClientRect();
    const toRect = cartIconEl.getBoundingClientRect();
    clone.style.cssText = `
      position:fixed; top:${fromRect.top}px; left:${fromRect.left}px;
      width:${fromRect.width}px; height:${fromRect.height}px;
      border-radius:8px; z-index:9999; pointer-events:none; object-fit:cover;
    `;
    document.body.appendChild(clone);
    gsap.to(clone, {
      top: toRect.top,
      left: toRect.left,
      width: 24,
      height: 24,
      opacity: 0,
      duration: 0.65,
      ease: 'power2.in',
      onComplete: () => clone.remove(),
    });
  }

  /** Animated counter for dashboards. */
  animateCounter(element: HTMLElement, target: number, prefix = '', suffix = ''): void {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.6,
      ease: 'power1.out',
      onUpdate: () => {
        element.textContent = prefix + Math.round(obj.val).toLocaleString('en-IN') + suffix;
      },
    });
  }

  /** Navbar hide-on-scroll-down / show-on-scroll-up. Returns a teardown fn. */
  navbarAutoHide(nav: HTMLElement): () => void {
    let lastY = window.scrollY;
    const onScroll = (): void => {
      const y = window.scrollY;
      if (y > lastY && y > 120) {
        gsap.to(nav, { y: '-100%', duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.to(nav, { y: '0%', duration: 0.3, ease: 'power2.out' });
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }

  /** Fade an element out (skeleton hand-off). */
  fadeOut(element: HTMLElement, onComplete?: () => void): void {
    gsap.to(element, { opacity: 0, duration: 0.3, onComplete });
  }
}
