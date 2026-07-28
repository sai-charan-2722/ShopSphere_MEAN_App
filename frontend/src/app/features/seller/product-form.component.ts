import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import type { ICategory } from '../../shared/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="page container narrow">
      <h1 class="section-title">{{ editId ? 'Edit Product' : 'New Product' }}</h1>
      <form class="card form" (submit)="submit($event)">
        <label>Title<input [(ngModel)]="model.title" name="title" required /></label>
        <label>Description<textarea [(ngModel)]="model.description" name="description" rows="4" required></textarea></label>

        <div class="grid2">
          <label>Price (₹)<input type="number" [(ngModel)]="priceRupees" name="price" required /></label>
          <label>Discount price (₹, optional)<input type="number" [(ngModel)]="discountRupees" name="discount" /></label>
        </div>
        <div class="grid2">
          <label>Stock<input type="number" [(ngModel)]="model.stock" name="stock" required /></label>
          <label>SKU<input [(ngModel)]="model.sku" name="sku" /></label>
        </div>

        <label>Category
          <select [(ngModel)]="model.category" name="category" required>
            <option value="" disabled>Select…</option>
            @for (cat of categories(); track cat._id) {
              <option [value]="cat._id">{{ cat.name }}</option>
            }
          </select>
        </label>

        <label>Tags (comma-separated)<input [(ngModel)]="model.tags" name="tags" placeholder="electronics, gaming" /></label>

        <label class="checkbox"><input type="checkbox" [(ngModel)]="model.isFeatured" name="featured" /> Feature this product</label>

        @if (!editId) {
          <label>Images (up to 5)
            <input #fileInput type="file" (change)="onFiles($event)" multiple accept="image/*" />
          </label>
          <p class="muted">{{ files.length }} file(s) selected</p>
        }

        <button class="btn btn-primary mt-4" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save Product' }}</button>
      </form>
    </div>
  `,
  styles: [
    `
      .narrow {
        max-width: 680px;
      }
      .form {
        padding: 24px;
      }
      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 14px;
      }
      input,
      textarea,
      select {
        display: block;
        width: 100%;
        margin-top: 5px;
        padding: 10px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
      }
      .grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .checkbox input {
        width: auto;
        margin: 0;
      }
    `,
  ],
})
export class ProductFormComponent {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected categories = signal<ICategory[]>([]);
  protected saving = signal(false);
  protected editId = this.route.snapshot.paramMap.get('id');

  protected model = {
    title: '',
    description: '',
    stock: 0,
    sku: '',
    category: '',
    tags: '',
    isFeatured: false,
  };
  protected priceRupees = 0;
  protected discountRupees?: number;
  protected files: File[] = [];

  constructor() {
    this.categoryService.list().subscribe((c) => this.categories.set(this.flatten(c)));
    if (this.editId) {
      this.productService.getById(this.editId).subscribe((p) => {
        this.model.title = p.title;
        this.model.description = p.description;
        this.model.stock = p.stock;
        this.model.sku = p.sku ?? '';
        this.model.category = typeof p.category === 'object' ? p.category._id : p.category;
        this.model.tags = p.tags.join(', ');
        this.model.isFeatured = p.isFeatured;
        this.priceRupees = p.price / 100;
        this.discountRupees = p.discountPrice ? p.discountPrice / 100 : undefined;
      });
    }
  }

  private flatten(cats: ICategory[]): ICategory[] {
    const out: ICategory[] = [];
    for (const c of cats) {
      out.push(c);
      if (c.children?.length) out.push(...c.children);
    }
    return out;
  }

  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.files = input.files ? Array.from(input.files).slice(0, 5) : [];
  }

  submit(event: Event): void {
    event.preventDefault();
    this.saving.set(true);

    if (this.editId) {
      const body = {
        title: this.model.title,
        description: this.model.description,
        stock: this.model.stock,
        sku: this.model.sku,
        category: this.model.category,
        tags: this.model.tags.split(',').map((t) => t.trim()).filter(Boolean),
        isFeatured: this.model.isFeatured,
        price: Math.round(this.priceRupees * 100),
        discountPrice: this.discountRupees ? Math.round(this.discountRupees * 100) : undefined,
      };
      this.productService.update(this.editId, body).subscribe({
        next: () => this.done('Product updated'),
        error: () => this.saving.set(false),
      });
    } else {
      if (this.files.length === 0) {
        this.toast.error('Please add at least one image');
        this.saving.set(false);
        return;
      }
      const form = new FormData();
      form.append('title', this.model.title);
      form.append('description', this.model.description);
      form.append('price', String(Math.round(this.priceRupees * 100)));
      if (this.discountRupees) form.append('discountPrice', String(Math.round(this.discountRupees * 100)));
      form.append('stock', String(this.model.stock));
      form.append('category', this.model.category);
      if (this.model.sku) form.append('sku', this.model.sku);
      form.append('tags', this.model.tags);
      form.append('isFeatured', String(this.model.isFeatured));
      this.files.forEach((f) => form.append('images', f));

      this.productService.create(form).subscribe({
        next: () => this.done('Product created'),
        error: () => this.saving.set(false),
      });
    }
  }

  private done(msg: string): void {
    this.toast.success(msg);
    void this.router.navigate(['/seller/products']);
  }
}
