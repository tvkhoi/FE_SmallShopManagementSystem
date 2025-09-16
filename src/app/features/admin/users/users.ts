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
import { NzTagModule } from 'ng-zorro-antd/tag';
import { of, Subject } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { PaginationComponent } from '../../../shared/components/pagination-component/pagination-component';
import { AssignPermissionModalComponent } from '../../../shared/components/assign-permission-modal/assign-permission-modal';
import { PermissionService } from '../../../core/services/permission.service';
import { UserService } from '../../../core/services/user.service';

import { Permission } from '../../../core/models/permission';
import { TreeNode } from '../../../core/models/tree-node';
import { User } from '../../../core/models/user';
import { UserPermissionsResponse } from './user-permission-respose.model';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { Role } from '../../../core/models/role';
import { RoleService } from '../../../core/services/role.service';
import { UserDTO } from './user.dto';

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
    NzCheckboxModule,
    NzTagModule,
    PaginationComponent,
    AssignPermissionModalComponent,
    NzTabsModule,
    NzSwitchModule,
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class UsersComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private msg = inject(NzMessageService);

  searchQuery = '';
  users: User[] = [];

  newUser: UserDTO = {
    id: 0,
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    password: '',
    isActive: true,
    isDeleted: false,
    RoleName: [],
  };

  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  // Modal states
  isVisible = false;
  isConfirmLoading = false;
  isAssignVisible = false;
  isViewDetailsVisible = false;
  submitted = false;
  passwordVisible: boolean = false;

  userId: number | null = null;
  selectedUserId: number | null = null;
  selectedUser: User | null = null;

  // Permissions
  groupedPermissions: { module: string; permissions: Permission[] }[] = [];
  treeData: TreeNode[] = [];
  allChecked = false;

  // Role
  roles: Role[] = [];
  selectedNames: string[] = [];

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadUsers();
    this.loadPermissions();
    this.loadRoles();
  }

  /** Load danh sách user */
  private loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.users = data;
          this.totalItems = data.length;
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Lỗi tải users:', err),
    });
  }

  /** Load toàn bộ quyền */
  private loadPermissions(): void {
    this.permissionService
      .getPermissions()
      .pipe(
        switchMap(() => this.permissionService.userData$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: Permission[]) => {
          this.zone.run(() => {
            const modules = [...new Set(data.map((p) => p.module))];
            this.groupedPermissions = modules.map((module) => ({
              module,
              permissions: data.filter((p) => p.module === module),
            }));

            this.treeData = modules.map((module) => ({
              key: module,
              title: module,
              expanded: true,
              children: data
                .filter((p) => p.module === module)
                .map((perm) => ({
                  key: `${module}-${perm.id}`,
                  title: perm.description,
                  isLeaf: true,
                  checked: false,
                  id: perm.id,
                })),
            }));
            this.cdr.detectChanges();
          });
        },
        error: (err) => console.error('Lỗi khi load permissions:', err),
      });
  }

  /** Load toàn bộ role */
  private loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (data: Role[]) => {
        this.zone.run(() => {
          // map thêm thuộc tính checked
          this.roles = data.map((role) => ({
            ...role,
            checked: false,
          }));
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Lỗi khi load roles:', err),
    });
  }

  onChangeRoleSelection(): void {
    this.selectedNames = this.roles.filter((r) => r.checked).map((r) => r.name);
    this.cdr.detectChanges();
  }

  /** Xử lý tìm kiếm user */
  filterUsers(): void {
    const term = this.searchQuery.trim();
    if (!term) {
      this.loadUsers();
      return;
    }
    this.userService.searchUsers(term).subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.users = data;
          this.totalItems = data.length;
          this.currentPage = 1;
          this.cdr.detectChanges();
        });
      },
      error: (e) => console.error('Lỗi search users:', e),
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.cdr.detectChanges();
  }

  /** Modal: tạo user + gán quyền */
  showModal(): void {
    this.isVisible = true;
    this.submitted = false;
    this.userId = null;

    // Reset form user
    this.newUser = {
      id: 0,
      username: '',
      email: '',
      fullName: '',
      phoneNumber: '',
      password: '',
      isActive: true,
      isDeleted: false,
      RoleName: [],
    };

    // Reset role selection
    this.roles = this.roles.map((r) => ({ ...r, checked: false }));
    this.selectedNames = [];
    // reset check tree
    // this.treeData = this.treeData.map((m) => ({
    //   ...m,
    //   checked: false,
    //   children: m.children?.map((c: any) => ({ ...c, checked: false })),
    // }));
  }

  handleCancel(): void {
    this.isVisible = false;
    this.submitted = false;
  }

  handleOk(): void {
    this.submitted = true;
    this.isConfirmLoading = true;

    // Gán danh sách RoleName từ selection
    this.newUser.RoleName = this.selectedNames ?? [];

    this.userService
      .createUser(this.newUser)
      .pipe(
        finalize(() => {
          this.isConfirmLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp) => {
          this.msg.success('Tạo user và gán role thành công');
          this.isVisible = false;
          this.loadUsers();
        },
        error: (err) => {
          console.error('Lỗi khi tạo user:', err);
          if (err.error && typeof err.error === 'string') {
            this.msg.error(err.error);
          } else if (err.error?.errors) {
            this.msg.error(Object.values(err.error.errors).flat().join(', '));
          } else {
            this.msg.error('Không thể tạo user');
          }
        },
      });
  }

  /** Modal: gán quyền cho user đã tồn tại */
  showAssignModal(user: User): void {
    this.isAssignVisible = true;
    this.selectedUserId = user.id;
    this.selectedUser = user;

    this.userService.getUserPermissions(user.id).subscribe((resp: UserPermissionsResponse) => {
      const originalMap = new Map<number, boolean>();
      resp.permissions.forEach((p) => originalMap.set(p.id, p.granted ?? false));

      this.groupedPermissions = this.groupedPermissions.map((group) => ({
        ...group,
        permissions: group.permissions.map((perm) => ({
          ...perm,
          granted: originalMap.get(perm.id) ?? false,
        })),
      }));
      this.cdr.detectChanges();
    });
  }

  handleAssignOk(payload: Permission[]): void {
    if (!this.selectedUserId) return;
    this.isConfirmLoading = true;

    const assignPayload = payload.map((p) => ({ id: p.id, granted: !!p.granted }));
    this.userService
      .assignPermissions(this.selectedUserId, assignPayload)
      .pipe(finalize(() => (this.isConfirmLoading = false)))
      .subscribe({
        next: (resp) => {
          const updatedMap = new Map<number, boolean>();
          resp.permissions.forEach((p: any) => updatedMap.set(p.id, p.granted));

          this.groupedPermissions = this.groupedPermissions.map((group) => ({
            ...group,
            permissions: group.permissions.map((perm) => ({
              ...perm,
              granted: updatedMap.get(perm.id) ?? false,
            })),
          }));
          this.afterSaveSuccess('Gán quyền thành công');
        },
        error: (err) => this.afterSaveError(err),
      });
  }

  handleAssignCancel(): void {
    this.isAssignVisible = false;
    this.selectedUserId = null;
  }

  private afterSaveSuccess(message: string): void {
    this.zone.run(() => {
      this.isConfirmLoading = false;
      this.isAssignVisible = false;
      this.msg.success(message);
      this.cdr.detectChanges();
    });
  }

  private afterSaveError(error: any): void {
    this.zone.run(() => {
      this.isConfirmLoading = false;
      console.error('Lỗi khi lưu:', error);
      this.cdr.detectChanges();
    });
  }
  handleViewDetailsCancel(): void {
    this.isViewDetailsVisible = false;
  }

  /** Xử lý user */
  editUser(user: User): void {
    console.log('Sửa user:', user.username);
  }

  deleteUser(user: User): void {
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.msg.success('Đã xóa user');
        this.loadUsers();
      },
      error: (e) => console.error('Lỗi khi xóa user:', e),
    });
  }

  viewDetails(user: User): void {
    this.isViewDetailsVisible = true;
    this.selectedUser = user;
  }

  /** Tree helpers */
  get selectedPermissions(): { id: number; name: string; module: string; description: string }[] {
    const selected: any[] = [];
    this.treeData.forEach((moduleNode) => {
      moduleNode.children?.forEach((permNode: any) => {
        if (permNode.checked) {
          selected.push({
            id: permNode.id!,
            name: permNode.title!,
            module: moduleNode.key,
            description: permNode.title!,
          });
        }
      });
    });
    return selected;
  }

  onCheck(event: NzFormatEmitEvent): void {
    const checkedKeys = event.keys as string[];
    this.treeData = this.treeData.map((node) => ({
      ...node,
      checked: checkedKeys.includes(node.key),
      children: node.children?.map((c) => ({
        ...c,
        checked: checkedKeys.includes(c.key),
      })),
    }));
    this.updateAllCheckedState();
  }

  toggleAllPermissions(checked: boolean): void {
    this.allChecked = checked;
    this.treeData = this.treeData.map((moduleNode) => ({
      ...moduleNode,
      checked,
      children: moduleNode.children?.map((c: any) => ({ ...c, checked })),
    }));
    this.cdr.detectChanges();
  }

  updateAllCheckedState(): void {
    const leaves: any[] = [];
    this.treeData.forEach((m) => m.children?.forEach((c) => leaves.push(c)));
    this.allChecked = leaves.length > 0 && leaves.every((l) => !!l.checked);
  }
}
