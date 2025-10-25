import { PERMISSIONS } from './../../../core/constants/permission.constant';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalService, NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PaginationComponent } from '../../../shared/components/admin/pagination-component/pagination-component';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/domain/order';
import { Button } from '../../../shared/components/admin/button/button';
import { take } from 'rxjs/operators';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { ConfirmDialog } from "../../../shared/components/admin/confirm-dialog/confirm-dialog";
import { AuthService } from '../../../auth/auth.service';
import e from 'express';

@Component({
  selector: 'app-seller-order-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzPaginationModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzModalModule,
    NzTagModule,
    NzDatePickerModule,
    NzIconModule,
    NzTooltipModule,
    NzDropDownModule,
    PaginationComponent,
    Button,
    ConfirmDialog
],
  templateUrl: './seller-order-management.html',
  styleUrls: ['./seller-order-management.scss'],
})
export class SellerOrderManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly message = inject(NzMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly auth = inject(AuthService);

  filterForm!: FormGroup;
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = signal(false);
  PERMISSIONS = PERMISSIONS;

  totalItems = 0;
  pageSize = 10;
  pageIndex = 1;

  selectedOrder: Order | null = null;
  isDetailVisible = false;
  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmType: 'primary' | 'danger' | 'cancel' = 'primary';
  confirmAction?: () => void;

  statusOptions = [
    { label: 'Mới', value: 'Pending' },
    { label: 'Đang xử lý', value: 'Processing' },
    { label: 'Hoàn tất', value: 'Completed' },
    { label: 'Đã hủy', value: 'Cancelled' },
  ];

  ngOnInit(): void {
    this.initForm();

    // Đăng ký lắng nghe orders từ BehaviorSubject
    this.orderService.orders$.subscribe((orders) => {
      this.allOrders = orders;
      this.applyFilters(false);
      this.cdr.detectChanges();
    });

    if(this.auth.hasPermission(PERMISSIONS.ORDERS_VIEW)) {
      this.fetchOrders();
    }
    else {
      console.log('Bạn không có quyền truy cập trang này.');
    }
  }

  private initForm() {
    this.filterForm = this.fb.group({
      q: [''],
      status: [null],
      fromDate: [null],
      toDate: [null],
    });
  }

  fetchOrders() {
    this.loading.set(true);
    this.orderService
      .getOrders()
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.applyFilters();
        },
        error: (error) => {
          console.error('API Error:', error);
          this.loading.set(false);
        },
      });
  }

  applyFilters(restartPage: boolean = true) {
    if (restartPage) this.pageIndex = 1;
    const { q, status, fromDate, toDate } = this.filterForm.value;
    let result = [...this.allOrders];

    if (q?.trim()) {
      const lower = q.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toString().includes(lower) ||
          o.userName.toLowerCase().includes(lower) ||
          o.items.some((it) => it.productName.toLowerCase().includes(lower))
      );
    }

    if (status) result = result.filter((o) => o.status === status);
    if (fromDate) result = result.filter((o) => new Date(o.orderDate) >= new Date(fromDate));
    if (toDate) result = result.filter((o) => new Date(o.orderDate) <= new Date(toDate));

    this.totalItems = result.length;
    const start = (this.pageIndex - 1) * this.pageSize;
    this.filteredOrders = result.slice(start, start + this.pageSize);
  }

  resetFilters() {
    this.filterForm.reset({ q: '', status: null, fromDate: null, toDate: null });
    this.applyFilters();
  }

  onPageIndexChange(page: number) {
    this.pageIndex = page;
    this.applyFilters(false);
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageIndex = 1;
    this.applyFilters(false);
  }

  showDetail(order: Order) {
    this.selectedOrder = order;
    this.isDetailVisible = true;
  }

  closeDetail() {
    this.selectedOrder = null;
    this.isDetailVisible = false;
  }

  nextStatusOptions(current: OrderStatus) {
    const flow: Record<OrderStatus, string[]> = {
      Pending: ['Processing', 'Cancelled'],
      Processing: ['Completed', 'Cancelled'],
      Completed: [],
      Cancelled: [],
    };
    return this.statusOptions.filter((s) => flow[current].includes(s.value));
  }

  confirmChangeStatus(order: Order, newStatus: string) {
    const label = this.statusOptions.find((s) => s.value === newStatus)?.label || newStatus;

    this.confirmTitle = 'Xác nhận thay đổi trạng thái';
    this.confirmMessage = `Bạn có chắc muốn chuyển đơn hàng #${order.id} sang "${label}" không?`;
    this.confirmType = newStatus === 'Cancelled' ? 'danger' : 'primary';
    this.confirmVisible = true;

    // Gán callback để khi nhấn xác nhận thì gọi
    this.confirmAction = () => this.changeStatus(order, newStatus);
  }

  changeStatus(order: Order, newStatus: string) {
    this.loading.set(true);
    this.orderService
      .updateStatus(order.id, newStatus)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (res.success) {
            // Cập nhật ngay trong danh sách local + BehaviorSubject
            order.status = newStatus as OrderStatus;
            this.orderService.getOrders().pipe(take(1)).subscribe(); // refresh
            this.message.success(`Đơn hàng #${order.id} → "${newStatus}"`);
          } else this.message.error('Không thể cập nhật trạng thái.');
          this.loading.set(false);
        },
        error: () => {
          this.message.error('Cập nhật thất bại!');
          this.loading.set(false);
        },
      });
  }

  exportCsv() {
    if (!this.filteredOrders || this.filteredOrders.length === 0) {
      this.message.warning('Không có đơn hàng nào để xuất.');
      return;
    }
    const headers = ['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Ngày tạo'];
    const rows = this.filteredOrders.map((o) => [
      o.id,
      o.userName,
      o.totalAmount,
      o.status,
      new Date(o.orderDate).toLocaleString(),
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  printOrders() {
    if (!this.filteredOrders || this.filteredOrders.length === 0) {
      this.message.warning('Không có đơn hàng nào để in.');
      return;
    }

    // Lọc ra các đơn không bị hủy
    const ordersToPrint = this.filteredOrders.filter((o) => o.status !== 'Cancelled' && o.status !== 'Completed' && o.items.length > 0);

    if (ordersToPrint.length === 0) {
      this.message.warning('Không có đơn hàng hợp lệ để in.');
      return;
    }

    const printContent = ordersToPrint
      .map(
        (order) => `
      <div style="font-family: Arial, sans-serif; margin-bottom: 20px; page-break-after: always;">
        <h2 style="text-align: center;">HÓA ĐƠN #${order.id}</h2>
        <p><strong>Khách hàng:</strong> ${order.userName}</p>
        <p><strong>Ngày đặt:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
        <p><strong>Tổng tiền:</strong> ${order.totalAmount.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        })}</p>

        <table style="width: 100%; border-collapse: collapse;" border="1">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (it) => `
              <tr>
                <td>${it.productName}</td>
                <td>${it.quantity}</td>
                <td>${it.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                <td>${(it.price * it.quantity).toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                })}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
      )
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.writeln(`
    <html>
      <head>
        <title>In đơn hàng</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000; padding: 5px; text-align: left; }
          div { page-break-after: always; }
          h2 { margin: 0 0 10px 0; }
          p { margin: 2px 0; }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}
