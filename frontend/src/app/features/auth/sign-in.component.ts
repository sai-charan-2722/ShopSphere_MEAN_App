import { Component, inject, AfterViewInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page container auth-page">
      <div #clerkMount class="clerk-mount"></div>
    </div>
  `,
  styles: [
    `
      .auth-page {
        display: flex;
        justify-content: center;
        padding-top: 48px;
      }
    `,
  ],
})
export class SignInComponent implements AfterViewInit {
  @ViewChild('clerkMount') mount!: ElementRef<HTMLElement>;
  private auth = inject(AuthService);

  async ngAfterViewInit(): Promise<void> {
    const clerk = await this.auth.ready();
    clerk.mountSignIn(this.mount.nativeElement, {
      routing: 'path',
      path: '/sign-in',
      signUpUrl: '/sign-up',
      afterSignInUrl: '/',
    });
  }
}
