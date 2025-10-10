import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Button } from '../button/button';
import { ProfileDropdown } from "../profile-dropdown/profile-dropdown";

@Component({
  selector: 'app-sidebar-right',
  standalone: true,
  imports: [NzLayoutModule, CommonModule, NzDropDownModule, NzIconModule, RouterModule, ProfileDropdown],
  templateUrl: './sidebar-right.html',
  styleUrls: ['./sidebar-right.scss'],
})
export class SidebarRight {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(NzMessageService);

  @Input() isProfileCardOpen: boolean = false;
  @Input() menuItems: Array<{ label: string; icon: string; route: string }> = [];
  @Output() toggleProfileCard = new EventEmitter<boolean>();


  onToggleProfileCard(toggle: boolean) {
    this.isProfileCardOpen = toggle;
    this.toggleProfileCard.emit(this.isProfileCardOpen);
  }

}
