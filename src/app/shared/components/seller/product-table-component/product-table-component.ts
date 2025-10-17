import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzImageModule } from 'ng-zorro-antd/image';
import { ActionDropdown } from '../../admin/action-dropdown/action-dropdown';
import { Product } from '../../../../core/models/domain/product';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzTagModule, NzImageModule, ActionDropdown],
  template: `
    <div class="table-scroll-wrapper">
      <nz-table
        [nzData]="products"
        [nzLoading]="loading"
        nzBordered
        nzSize="middle"
        nzShowPagination="false"
        class="product-table nowrap-table"
        style="overflow-x: auto;"
      >
        <thead>
          <tr>
            <th scope="col" nzWidth="80px">Ảnh</th>
            <th scope="col" nzWidth="200px">Tên sản phẩm</th>
            <th scope="col" nzWidth="150px">Danh mục</th>
            <th scope="col" nzWidth="150px">Giá</th>
            <th scope="col" nzWidth="120px">Tồn kho</th>
            <th scope="col" nzWidth="120px">Trạng thái</th>
            <th scope="col" nzWidth="150px" class="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of products">
            <td>
              <img
                nz-image
                [nzSrc]="p.imageUrls[0] || 'assets/images/no-image.png'"
                width="50"
                height="50"
                class="rounded border"
                style="object-fit: cover;"
              />
            </td>
            <td class="fw-semibold">{{ p.name }}</td>
            <td>{{ p.categoryName }}</td>
            <td>{{ p.price | currency : 'VND' : 'symbol' : '1.0-0' }}</td>
            <td>{{ p.stock }}</td>
            <td>
              <nz-tag [nzColor]="p.isActive ? 'green' : 'red'">{{
                p.isActive ? 'Đang bán' : 'Ngừng bán'
              }}</nz-tag>
            </td>
            <td class="text-center">
              <app-action-dropdown
                [data]="p"
                [actions]="getActions(p)"
                (action)="action.emit($event)"
              ></app-action-dropdown>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </div>
  `,
})
export class ProductTableComponent {
  @Input() products: Product[] = [];
  @Input() loading = false;
  @Output() action = new EventEmitter<{ action: string; data: Product }>();

  getActions(p: Product) {
    return [
      { label: 'Sửa', icon: 'edit', type: 'primary' as const, emitName: 'edit' },
      {
        label: p.isActive ? 'Ngừng bán' : 'Kích hoạt',
        icon: p.isActive ? 'stop' : 'play-circle',
        type: p.isActive ? ('default' as const) : ('success' as const),
        emitName: 'toggle',
      },
    ];
  }
}
