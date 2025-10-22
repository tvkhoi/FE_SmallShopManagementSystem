import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { getGreetingByTime } from '../../../core/utils';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  greeting = signal('');
  summaryCards: any[] = [];
  topProducts: any[] = [];
  orderSummary: any[] = [];
  completedCount = 0;
  processingCount = 0;
  cancelledCount = 0;

  private overviewChart?: Chart;
  private revenueCostChart?: Chart;

  ngOnInit(): void {
    this.greeting.set(getGreetingByTime());
    this.dashboardService.refreshAll();
    this.loadSummary();
    this.loadTopProducts();
    this.loadOrderSummary();
    this.loadCharts();
  }

  get userName(): string | null {
    return this.authService.getName();
  }

  private loadSummary(): void {
    this.dashboardService.summary$.subscribe((res: any) => {
      if (!res) return;
      const format = (n: any) => (typeof n === 'number' ? n.toLocaleString('vi-VN') : '0');
      this.summaryCards = [
        {
          title: 'Tổng doanh thu',
          value: `${format(res.totalRevenue)} ₫`,
          icon: '💰',
          color: 'success',
        },
        { title: 'Tổng đơn hàng', value: format(res.totalOrders), icon: '🧾', color: 'primary' },
        { title: 'Khách hàng', value: format(res.totalCustomers), icon: '👥', color: 'info' },
        { title: 'Sản phẩm', value: format(res.totalProducts), icon: '📦', color: 'warning' },
      ];
      this.cdr.detectChanges();
    });
  }

  private loadTopProducts(): void {
    this.dashboardService.topProducts$.subscribe((res) => {
      console.log('📦 Received top products:', res);
      // Đảm bảo luôn là array
      this.topProducts = Array.isArray(res) ? res : [];
      this.cdr.detectChanges();
    });
  }

  private loadOrderSummary(): void {
    this.dashboardService.orderSummary$.subscribe((res) => {
      if (!Array.isArray(res)) return;
      this.orderSummary = res;
      // Lấy theo trạng thái
      const getCount = (status: string) =>
        res.find((x) => x.status?.toLowerCase() === status.toLowerCase())?.count || 0;

      this.completedCount = getCount('Completed');
      this.processingCount = getCount('Processing');
      this.cancelledCount = getCount('Cancelled');
    });
  }

  onRangeChange(e: Event): void {
    const range = (e.target as HTMLSelectElement).value;
    this.dashboardService.refreshAll(range);
  }

  trackByProduct(index: number, product: any): any {
    return product?.id || index;
  }

  private loadCharts(): void {
    this.dashboardService.overview$.subscribe((res: any) => {
      if (!res?.labels) return;
      const ctx = document.getElementById('chart-overview') as HTMLCanvasElement;
      if (!ctx) return;
      if (this.overviewChart) this.overviewChart.destroy();

      this.overviewChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: res.labels,
          datasets: [
            { label: 'Đơn hàng', data: res.orders, borderColor: '#0d6efd', fill: true },
            { label: 'Doanh thu', data: res.revenue, borderColor: '#198754', fill: true },
          ],
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
      });
    });

    this.dashboardService.revenueVsCost$.subscribe((res: any) => {
      if (!res?.labels) return;
      const ctx = document.getElementById('chart-revenue-cost') as HTMLCanvasElement;
      if (!ctx) return;
      if (this.revenueCostChart) this.revenueCostChart.destroy();

      this.revenueCostChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: res.labels,
          datasets: [
            { label: 'Doanh thu', data: res.revenue, backgroundColor: '#198754' },
            { label: 'Chi phí', data: res.cost, backgroundColor: '#dc3545' },
          ],
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
      });
    });
  }
}
