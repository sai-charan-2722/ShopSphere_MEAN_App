import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import type { IUser, Role } from '../../shared/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PaginationComponent],
  template: `
    <div class="page container">
      <h1 class="section-title">Users</h1>

      <div class="search">
        <input [(ngModel)]="search" (keyup.enter)="load(1)" placeholder="Search by name or email…" />
        <button class="btn btn-primary" (click)="load(1)">Search</button>
      </div>

      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u._id) {
              <tr>
                <td class="user">
                  @if (u.avatar) {
                    <img [src]="u.avatar" [alt]="u.name" />
                  } @else {
                    <span class="ph">{{ u.name.charAt(0) }}</span>
                  }
                  {{ u.name }}
                </td>
                <td>{{ u.email }}</td>
                <td>
                  <select [ngModel]="u.role" (ngModelChange)="changeRole(u, $event)">
                    <option value="buyer">buyer</option>
                    <option value="seller">seller</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <span class="pill" [class.on]="u.isActive">{{ u.isActive ? 'Active' : 'Inactive' }}</span>
                </td>
                <td>
                  <button class="link-btn" (click)="toggleStatus(u)">{{ u.isActive ? 'Deactivate' : 'Activate' }}</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-pagination [currentPage]="page()" [totalPages]="pages()" (pageChange)="load($event)" />
    </div>
  `,
  styles: [
    `
      .search {
        display: flex;
        gap: 10px;
        margin-bottom: 18px;
        max-width: 480px;
      }
      .search input {
        flex: 1;
        padding: 10px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      .table-wrap {
        overflow-x: auto;
        padding: 4px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        text-align: left;
        padding: 12px 14px;
        border-bottom: 1px solid #f1f1f4;
        font-size: 14px;
      }
      th {
        color: #6b7280;
        font-size: 12px;
        text-transform: uppercase;
      }
      .user {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .user img,
      .ph {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        object-fit: cover;
      }
      .ph {
        background: #6c63ff;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }
      select {
        padding: 6px 8px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      .pill {
        font-size: 12px;
        padding: 3px 10px;
        border-radius: 999px;
        background: #fee2e2;
        color: #dc2626;
      }
      .pill.on {
        background: #dcfce7;
        color: #16a34a;
      }
      .link-btn {
        border: none;
        background: none;
        color: #6c63ff;
        cursor: pointer;
        font-weight: 600;
      }
    `,
  ],
})
export class AdminUsersComponent {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  protected users = signal<IUser[]>([]);
  protected page = signal(1);
  protected pages = signal(1);
  protected search = '';

  constructor() {
    this.load(1);
  }

  load(page: number): void {
    this.adminService.users(page, 12, this.search).subscribe((res) => {
      this.users.set(res.users);
      this.page.set(res.meta.page);
      this.pages.set(res.meta.totalPages);
    });
  }

  changeRole(user: IUser, role: Role): void {
    this.adminService.changeRole(user._id, role).subscribe(() => this.toast.success(`${user.name} is now ${role}`));
  }

  toggleStatus(user: IUser): void {
    this.adminService.changeStatus(user._id, !user.isActive).subscribe((updated) => {
      this.toast.success(`${user.name} ${updated.isActive ? 'activated' : 'deactivated'}`);
      this.load(this.page());
    });
  }
}
