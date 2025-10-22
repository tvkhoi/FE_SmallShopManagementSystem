import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CategoryService } from '../../../../core/services/category.service';
import { Button } from '../../admin/button/button';
import { NzFormItemComponent } from 'ng-zorro-antd/form';
import { NzColDirective } from 'ng-zorro-antd/grid';
import { Observable } from 'rxjs';
import { Category } from '../../../../core/models/domain/category';
import { MoveProductsDto } from '../../../../core/models/request/category.dto';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzSelectModule,
    NzButtonModule,
    Button,
    NzFormItemComponent,
    NzColDirective,
  ],
  template: `
    <nz-modal
      [(nzVisible)]="visible"
      [nzTitle]="'Xóa danh mục'"
      [nzWidth]="500"
      (nzOnCancel)="cancel()"
      [nzFooter]="footerTemplate"
    >
      <div *nzModalContent>
        <form [formGroup]="form">
          <div *ngIf="loading">Đang tải dữ liệu...</div>

          <div *ngIf="!loading">
            <!-- Chọn danh mục cần xóa -->
            <nz-form-item>
              <nz-form-label>Chọn danh mục cần xóa</nz-form-label>
              <nz-form-control>
                <nz-select
                  formControlName="selectedCategoryId"
                  style="width: 100%;"
                  placeholder="Chọn danh mục"
                  (ngModelChange)="onCategoryChange($event)"
                >
                  <nz-option
                    *ngFor="let c of categories$ | async"
                    [nzLabel]="c.name"
                    [nzValue]="c.id"
                  ></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>

            <!-- Hiển thị cảnh báo và chuyển sản phẩm -->
            <div *ngIf="form.get('selectedCategoryId')?.value">
              <div *ngIf="needsMove">
                <p>
                  Danh mục <strong>{{ selectedCategoryName }}</strong> đang có
                  {{ productCount }} sản phẩm.
                </p>
                <p>Vui lòng chọn danh mục khác để chuyển sản phẩm trước khi xóa:</p>

                <nz-form-item>
                  <nz-form-label>Chọn danh mục chuyển sản phẩm</nz-form-label>
                  <nz-form-control>
                    <nz-select
                      formControlName="targetCategoryId"
                      style="width: 100%;"
                      placeholder="Chọn danh mục"
                    >
                      <nz-option
                        *ngFor="let c of categories$ | async"
                        [nzLabel]="c.name"
                        [nzValue]="c.id"
                        [nzDisabled]="c.id === (form.get('selectedCategoryId')?.value ?? 0)"
                      ></nz-option>
                    </nz-select>
                  </nz-form-control>
                </nz-form-item>
              </div>

              <div *ngIf="!needsMove">
                <p>
                  Bạn có chắc muốn xóa danh mục
                  <strong>{{ selectedCategoryName }}</strong> không?
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <ng-template #footerTemplate>
        <div class="modal-footer d-flex justify-content-end gap-2">
          <app-button type="cancel" size="medium" (click)="cancel()">Hủy</app-button>
          <app-button
            type="primary"
            size="medium"
            [disabled]="needsMove && !form.get('targetCategoryId')?.value"
            (click)="confirm()"
          >
            Xác nhận
          </app-button>
        </div>
      </ng-template>
    </nz-modal>
  `,
})
export class CategoryModalComponent implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() deleted = new EventEmitter<void>();

  form = new FormGroup({
    selectedCategoryId: new FormControl<number | null>(null),
    targetCategoryId: new FormControl<number | null>(null),
  });

  selectedCategoryName = '';
  needsMove = false;
  productCount = 0;
  loading = false;

  private readonly categoryService = inject(CategoryService);
  private readonly message = inject(NzMessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Observable categories từ service (BehaviorSubject)
  categories$: Observable<Category[]> = this.categoryService.categories$;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible) {
      this.form.reset();
      this.needsMove = false;
      this.selectedCategoryName = '';
      this.loading = false;
    }
  }

  /** Mở modal => reset form để tránh dữ liệu cũ */
  openModal() {
    this.form.reset();
    this.visible = true;
    this.visibleChange.emit(this.visible);
    this.needsMove = false;
  }

  cancel() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  onCategoryChange(categoryId: number) {
    this.selectedCategoryName =
      this.categoryService.categoriesSubject.value.find((c) => c.id === categoryId)?.name || '';

    if (!categoryId) return;

    this.loading = true;
    this.categoryService.checkCategoryProducts(categoryId).subscribe({
      next: (res) => {
        // tránh ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.needsMove = res.data.hasProducts;
          this.productCount = res.data.productCount;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.loading = false;
      },
    });

    this.form.get('targetCategoryId')?.reset();
  }

  confirm() {
    const selectedCategoryId = this.form.get('selectedCategoryId')?.value;
    if (!selectedCategoryId) return;

    if (this.needsMove) {
      const targetCategoryId = this.form.get('targetCategoryId')?.value;
      if (!targetCategoryId) return;

      const dto: MoveProductsDto = {
        fromCategoryId: selectedCategoryId,
        toCategoryId: targetCategoryId,
      };

      this.categoryService.moveProducts(dto).subscribe({
        next: () => this.deleteCategory(selectedCategoryId),
        error: () => this.message.error('Chuyển sản phẩm thất bại.'),
      });
    } else {
      this.deleteCategory(selectedCategoryId);
    }
  }

  private deleteCategory(categoryId: number) {
    this.categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.message.success('Xóa danh mục thành công!');
        this.cancel(); // đóng modal + reset form
        this.cdr.detectChanges();
        this.form.reset();
        this.deleted.emit(); // trigger parent reload danh sách
      },
      error: (err) => {
        const msg = err?.error?.message || 'Xóa danh mục thất bại!';
        this.message.error(msg);
      },
    });
  }
}
