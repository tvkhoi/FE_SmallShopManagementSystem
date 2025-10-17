import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { Button } from "../../admin/button/button";

@Component({
  selector: 'app-product-tabs',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule, Button],
  template: `
    <div class="mb-3 d-flex align-items-center">
      <app-button  [type]="activeTab === 'active' ? 'primary' : 'default'" (click)="switch('active')">
        <i nz-icon nzType="shopping" class="me-1"></i> Đang bán
      </app-button>
      <app-button  [type]="activeTab === 'locked' ? 'primary' : 'default'" (click)="switch('locked')">
        <i nz-icon nzType="stop" class="me-1"></i> Ngừng bán
      </app-button>
    </div>
  `
})
export class ProductTabsComponent {
  @Input() activeTab: 'active' | 'locked' = 'active';
  @Output() tabChange = new EventEmitter<'active' | 'locked'>();

  switch(tab: 'active' | 'locked') {
    this.tabChange.emit(tab);
  }
}
