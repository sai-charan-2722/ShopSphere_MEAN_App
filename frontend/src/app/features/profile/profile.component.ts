import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import type { Address } from '../../shared/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="page container narrow">
      <h1 class="section-title">My Profile</h1>
      <form class="card form" (submit)="save($event)">
        <div class="avatar-row">
          @if (avatar()) {
            <img [src]="avatar()" alt="Avatar" class="avatar" />
          } @else {
            <div class="avatar placeholder">{{ (name() || 'U').charAt(0) }}</div>
          }
          <label class="avatar-url">
            Avatar URL
            <input [(ngModel)]="avatarInput" name="avatar" placeholder="https://…" />
          </label>
        </div>

        <label>Name<input [(ngModel)]="name" name="name" required /></label>
        <label>Email<input [value]="email()" name="email" disabled /></label>

        <h3 class="mt-4">Address</h3>
        <label>Street<input [(ngModel)]="address.street" name="street" /></label>
        <div class="grid2">
          <label>City<input [(ngModel)]="address.city" name="city" /></label>
          <label>State<input [(ngModel)]="address.state" name="state" /></label>
        </div>
        <div class="grid2">
          <label>ZIP<input [(ngModel)]="address.zip" name="zip" /></label>
          <label>Country<input [(ngModel)]="address.country" name="country" /></label>
        </div>

        <button class="btn btn-primary mt-4" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save Changes' }}</button>
      </form>
    </div>
  `,
  styles: [
    `
      .narrow {
        max-width: 640px;
      }
      .form {
        padding: 24px;
      }
      .avatar-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 18px;
      }
      .avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        object-fit: cover;
      }
      .placeholder {
        background: #6c63ff;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        font-weight: 700;
      }
      .avatar-url {
        flex: 1;
      }
      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 12px;
      }
      input {
        display: block;
        width: 100%;
        margin-top: 5px;
        padding: 10px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
      }
      input:disabled {
        background: #f3f4f6;
      }
      .grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
    `,
  ],
})
export class ProfileComponent {
  private userService = inject(UserService);
  private toast = inject(ToastService);

  protected name = signal('');
  protected email = signal('');
  protected avatar = signal<string | undefined>(undefined);
  protected avatarInput = '';
  protected address: Address = { street: '', city: '', state: '', zip: '', country: '' };
  protected saving = signal(false);

  constructor() {
    this.userService.getProfile().subscribe((u) => {
      this.name.set(u.name);
      this.email.set(u.email);
      this.avatar.set(u.avatar);
      this.avatarInput = u.avatar ?? '';
      if (u.address) this.address = { ...this.address, ...u.address };
    });
  }

  save(event: Event): void {
    event.preventDefault();
    this.saving.set(true);
    this.userService
      .updateProfile({ name: this.name(), avatar: this.avatarInput || undefined, address: this.address })
      .subscribe({
        next: (u) => {
          this.avatar.set(u.avatar);
          this.toast.success('Profile updated');
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
  }
}
