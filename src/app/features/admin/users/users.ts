import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeModule, NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { AdminUserService, AdminUserDto } from '../../../core/services/admin-user.service';
import { PermissionService } from '../../../core/services/permission.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzButtonModule,
    NzTableModule,
    NzPaginationModule,
    NzModalModule,
    NzFormModule,
    NzIconModule,
    NzDropDownModule,
    NzTreeModule,
    NzCheckboxModule
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent implements OnInit {
  private adminUserService = inject(AdminUserService);
  private permissionService = inject(PermissionService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private msg = inject(NzMessageService);

  searchQuery: string = '';
  users: AdminUserDto[] = [];

  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  // Modal state
  isVisible = false;
  isConfirmLoading = false;
  submitted = false;

  // Assign permissions to existing user
  userId: number | null = null;

  // Permissions tree
  treeData: { key: string; title: string; children?: any[]; isLeaf?: boolean; checked?: boolean; expanded?: boolean; id?: number }[] = [];
  allChecked = false;

  ngOnInit(): void {
    this.loadUsers();
    this.loadPermissions();
  }

  private loadUsers(): void {
    this.adminUserService.getAllUsers().subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.users = data;
          this.totalItems = data.length;
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Lỗi tải users:', err)
    });
  }

  private loadPermissions(): void {
    this.permissionService.getPermissions().subscribe({
      next: () => {
        this.permissionService.userData$.pipe(take(1)).subscribe({
          next: (data: any[]) => {
            this.zone.run(() => {
              const modules = [...new Set(data.map(p => p.module))];
              this.treeData = modules.map(module => ({
                key: module,
                title: module,
                expanded: true,
                children: data.filter(p => p.module === module).map(perm => ({
                  key: `${module}-${perm.id}`,
                  title: perm.description,
                  isLeaf: true,
                  checked: false,
                  id: perm.id
                }))
              }));
              this.cdr.detectChanges();
            });
          },
          error: (e) => console.error('Lỗi khi subscribe permissions:', e)
        });
      },
      error: (e) => console.error('Lỗi khi gọi API permissions:', e)
    });
  }

  onCheck(event: NzFormatEmitEvent): void {
    const checkedKeys = event.keys as string[];
    this.treeData = this.treeData.map(node => {
      if (checkedKeys.includes(node.key)) {
        const children = node.children?.map(c => ({ ...c, checked: true }));
        return { ...node, checked: true, children };
      } else {
        const children = node.children?.map(c => ({ ...c, checked: checkedKeys.includes(c.key) }));
        return { ...node, checked: false, children };
      }
    });
    this.updateAllCheckedState();
  }

  get selectedPermissions(): { id: number; name: string; module: string; description: string }[] {
    const selected: { id: number; name: string; module: string; description: string }[] = [];
    this.treeData.forEach(moduleNode => {
      moduleNode.children?.forEach((permNode: any) => {
        if (permNode.checked) {
          selected.push({
            id: permNode.id!,
            name: permNode.title!,
            module: moduleNode.key,
            description: permNode.title!
          });
        }
      });
    });
    return selected;
  }

  toggleAllPermissions(checked: boolean): void {
    this.allChecked = checked;
    this.treeData = this.treeData.map(moduleNode => ({
      ...moduleNode,
      checked,
      children: moduleNode.children?.map((c: any) => ({ ...c, checked }))
    }));
    this.cdr.detectChanges();
  }

  updateAllCheckedState(): void {
    const leaves: any[] = [];
    this.treeData.forEach(m => m.children?.forEach(c => leaves.push(c)));
    this.allChecked = leaves.length > 0 && leaves.every(l => !!l.checked);
  }

  // Module-level toggles
  isModuleAllChecked(moduleKey: string): boolean {
    const moduleNode = this.treeData.find(m => m.key === moduleKey);
    if (!moduleNode || !moduleNode.children || moduleNode.children.length === 0) return false;
    return moduleNode.children.every((c: any) => !!c.checked);
  }

  toggleModulePermissions(moduleKey: string, checked: boolean): void {
    this.treeData = this.treeData.map(m => {
      if (m.key !== moduleKey) return m;
      return {
        ...m,
        checked,
        children: m.children?.map((c: any) => ({ ...c, checked }))
      };
    });
    this.updateAllCheckedState();
    this.cdr.detectChanges();
  }

  // UI actions
  filterUsers() {
    const term = (this.searchQuery || '').trim();
    if (!term) {
      this.loadUsers();
      return;
    }
    this.adminUserService.searchUsers(term).subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.users = data;
          this.totalItems = data.length;
          this.currentPage = 1;
          this.cdr.detectChanges();
        });
      },
      error: (e) => console.error('Lỗi search users:', e)
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.cdr.detectChanges();
  }

  showModal() {
    this.isVisible = true;
    this.submitted = false;
    this.userId = null;
    // reset checks
    this.treeData = this.treeData.map(m => ({
      ...m,
      checked: false,
      children: m.children?.map((c: any) => ({ ...c, checked: false }))
    }));
  }

  handleCancel() {
    this.isVisible = false;
    this.submitted = false;
  }

  handleOk() {
    this.submitted = true;
    if (!this.userId || this.selectedPermissions.length === 0) {
      return;
    }
    this.isConfirmLoading = true;
    this.cdr.detectChanges();

    const payload = this.selectedPermissions.map(p => ({ id: p.id, granted: true }));
    this.adminUserService.assignPermissionsToUser(this.userId, payload).subscribe({
      next: () => {
        this.zone.run(() => {
          this.isConfirmLoading = false;
          this.isVisible = false;
          this.loadUsers();
          this.msg.success('Gán quyền cho người dùng thành công');
          this.cdr.detectChanges();
        });
      },
      error: (e) => {
        this.zone.run(() => {
          this.isConfirmLoading = false;
          this.cdr.detectChanges();
          console.error('Lỗi khi gán quyền cho user:', e);
        });
      }
    });
  }

  editUser(user: AdminUserDto) {
    console.log('Sửa user:', user.username);
  }

  deleteUser(user: AdminUserDto) {
    this.adminUserService.deleteUser(user.id).subscribe({
      next: () => {
        this.msg.success('Đã xóa user');
        this.loadUsers();
      },
      error: (e) => console.error('Lỗi khi xóa user:', e)
    });
  }
}