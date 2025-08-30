import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from "ng-zorro-antd/form";

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzTableModule,
    NzPaginationModule,
    NzButtonModule,
    NzSelectModule,
    NzModalModule,
    NzCheckboxModule,
    NzFormModule
],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss']
})
export class RolesComponent {
  roles: any[] = [
    { name: 'Admin', userCount: 5 },
    { name: 'User', userCount: 10 },
    { name: 'Guest', userCount: 2 }
  ];
  isVisible = false;
  isConfirmLoading = false;

  totalItems = this.roles.length;
  pageSize = 10;
  currentPage = 1;

  showModal(): void {
    this.isVisible = true;
  }
  handleOk(): void {
    this.isConfirmLoading = true;
    setTimeout(() => {
      this.isVisible = false;
      this.isConfirmLoading = false;
    }, 1000);
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  editRole(role: any): void {
    console.log('Editing role:', role.name);
    // Logic to edit the role
  }

  deleteRole(role: any): void {
    console.log('Deleting role:', role.name);
    // Logic to delete the role
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    console.log('Page changed to:', page);
  }
  searchQuery: string = '';

  filterRoles(): void {
    
  }
}