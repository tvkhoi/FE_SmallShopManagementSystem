import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-sidebar-left',
  standalone: true,
  imports: [CommonModule, NzLayoutModule, RouterModule, NzIconModule, NzMenuModule],
  templateUrl: './sidebar-left.html',
  styleUrls: ['./sidebar-left.scss'],
})
export class SidebarLeft {
  @Input() menuItems: { label: string; icon: string; route: string }[] = [];
  @Input() isCollapsed: boolean = false;
  @Output() collapseChange = new EventEmitter<boolean>();

  onCollapse(collapsed: boolean): void {
    this.isCollapsed = collapsed;
    this.collapseChange.emit(collapsed);
  }
}
