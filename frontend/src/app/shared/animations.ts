import { trigger, transition, style, animate, state } from '@angular/animations';

export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
  transition(':leave', [animate('250ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))]),
]);

export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(16px)' }),
    animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

export const expandCollapse = trigger('expandCollapse', [
  state('open', style({ height: '*', opacity: 1 })),
  state('closed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
  transition('open <=> closed', animate('300ms ease-in-out')),
]);

export const toastAnimation = trigger('toast', [
  transition(':enter', [
    style({ transform: 'translateY(100%)', opacity: 0 }),
    animate('300ms cubic-bezier(0.34,1.56,0.64,1)', style({ transform: 'translateY(0)', opacity: 1 })),
  ]),
  transition(':leave', [animate('200ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))]),
]);
