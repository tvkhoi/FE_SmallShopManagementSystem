import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzDatePickerModule,
    NzButtonModule,
    NzIconModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {
  dateRange: Date[] | null = null;

  // Gom stats thành mảng -> dễ thêm bớt
  stats = [
    { title: 'Tổng doanh thu', value: '₫125,000,000', colorClass: 'text-blue' },
    { title: 'Tổng đơn hàng', value: '342', colorClass: 'text-green' },
    { title: 'Người dùng mới', value: '57', colorClass: 'text-orange' }
  ];

  revenueChartLabels: string[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  revenueChartData: ChartData<'line'> = {
    labels: this.revenueChartLabels,
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: [12, 18, 9, 15, 22, 30, 17].map(x => x * 1000000),
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24,144,255,0.3)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  productChartLabels: string[] = ['Sản phẩm A', 'Sản phẩm B', 'Sản phẩm C', 'Sản phẩm D'];
  productChartData: ChartData<'bar'> = {
    labels: this.productChartLabels,
    datasets: [
      {
        label: 'Số lượng bán',
        data: [120, 90, 150, 80],
        backgroundColor: ['#52c41a', '#faad14', '#f5222d', '#1890ff']
      }
    ]
  };

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // responsive chiều cao
    plugins: {
      legend: { position: 'top' }
    }
  };

  filterStats() {
    console.log('Lọc thống kê theo khoảng ngày:', this.dateRange);
  }
}
