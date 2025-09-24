import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, NzSpinModule],
  template: `
    <div class="loading-container">
      <nz-spin nzSize="large"></nz-spin>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      width: 100%;
      background: #f0f2f5;
    }
  `]
})
export class LoadingComponent {}
