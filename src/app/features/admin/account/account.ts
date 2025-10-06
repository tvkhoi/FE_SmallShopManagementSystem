import { Component } from '@angular/core';
import { PersonalInfo } from "../../../shared/components/admin/personal-info/personal-info";
import { CommonModule } from '@angular/common';
import { ChangePassword } from "../../../shared/components/admin/change-password/change-password";
import { Button } from "../../../shared/components/admin/button/button";

@Component({
  selector: 'app-account',
  imports: [
    CommonModule,
    PersonalInfo,
    ChangePassword,
    Button
],
  templateUrl: './account.html',
  styleUrls: ['./account.scss'],
  standalone: true
})
export class Account {
  selectedTab: string = 'personal-info';

  selectTab(tab: string) {
    this.selectedTab = tab;
  }
}
