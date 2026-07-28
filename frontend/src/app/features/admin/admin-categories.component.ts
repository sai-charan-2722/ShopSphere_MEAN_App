import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import type { ICategory } from '../../shared/models';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="page container">
      <h1 class="section-title">Categories</h1>

      <div class="layout">
        <form class="card form" (submit)="save($event)">
          <h3>{{ editing() ? 'Edit Category' : 'New Category' }}</h3>
          <label>Name<input [(ngModel)]="name" name="name" required /></label>
          <label>Image URL<input [(ngModel)]="image" name="image" placeholder="https://…" /></label>
          <div class="actions">
            <button class="btn btn-primary" [disabled]="!name.trim()">{{ editing() ? 'Update' : 'Create' }}</button>
            @if (editing()) {
              <button type="button" class="btn btn-outline" (click)="cancelEdit()">Cancel</button>
            }
          </div>
        </form>

        <div class="card list">
          @for (cat of categories(); track cat._id) {
            <div class="row">
              @if (cat.image) {
                <img [src]="cat.image" [alt]="cat.name" />
              } @else {
                <span class="ph">🗂️</span>
              }
              <span class="name">{{ cat.name }}</span>
              <span class="slug muted">/{{ cat.slug }}</span>
              <div class="row-actions">
                <button (click)="startEdit(cat)">Edit</button>
                <button class="del" (click)="remove(cat)">Delete</button>
              </div>
            </div>
          } @empty {
            <p class="muted">No categories yet.</p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .layout {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 20px;
        align-items: start;
      }
      .form {
        padding: 20px;
      }
      .form h3 {
        margin: 0 0 14px;
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
      }
      .actions {
        display: flex;
        gap: 10px;
      }
      .list {
        padding: 8px 16px;
      }
      .row {
        display: grid;
        grid-template-columns: 40px 1fr auto auto;
        gap: 12px;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f1f1f4;
      }
      .row img,
      .ph {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        object-fit: cover;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f3f4f6;
      }
      .name {
        font-weight: 600;
      }
      .row-actions {
        display: flex;
        gap: 10px;
      }
      .row-actions button {
        border: none;
        background: none;
        cursor: pointer;
        color: #6c63ff;
        font-weight: 600;
      }
      .row-actions .del {
        color: #dc2626;
      }
      @media (max-width: 760px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminCategoriesComponent {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);

  protected categories = signal<ICategory[]>([]);
  protected editing = signal<ICategory | null>(null);
  protected name = '';
  protected image = '';

  constructor() {
    this.load();
  }

  load(): void {
    this.categoryService.list().subscribe((cats) => this.categories.set(this.flatten(cats)));
  }

  private flatten(cats: ICategory[]): ICategory[] {
    const out: ICategory[] = [];
    for (const c of cats) {
      out.push(c);
      if (c.children?.length) out.push(...c.children);
    }
    return out;
  }

  save(event: Event): void {
    event.preventDefault();
    const body = { name: this.name, image: this.image || undefined };
    const editing = this.editing();
    const req = editing ? this.categoryService.update(editing._id, body) : this.categoryService.create(body);
    req.subscribe(() => {
      this.toast.success(editing ? 'Category updated' : 'Category created');
      this.cancelEdit();
      this.load();
    });
  }

  startEdit(cat: ICategory): void {
    this.editing.set(cat);
    this.name = cat.name;
    this.image = cat.image ?? '';
  }

  cancelEdit(): void {
    this.editing.set(null);
    this.name = '';
    this.image = '';
  }

  async remove(cat: ICategory): Promise<void> {
    const data: ConfirmDialogData = {
      title: 'Delete category',
      message: `Delete "${cat.name}"? Categories with active products cannot be deleted.`,
      confirmText: 'Delete',
      danger: true,
    };
    const confirmed = await firstValueFrom(this.dialog.open(ConfirmDialogComponent, { data }).afterClosed());
    if (!confirmed) return;
    this.categoryService.remove(cat._id).subscribe({
      next: () => {
        this.toast.success('Category deleted');
        this.load();
      },
    });
  }
}
