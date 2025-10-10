import { Component, OnInit, OnDestroy, NgZone, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Ant Design Modules
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';

// Services
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';

// Components
import { AssignPermissionModalComponent } from '../../../shared/components/admin/assign-permission-modal/assign-permission-modal';
import { PaginationComponent } from '../../../shared/components/admin/pagination-component/pagination-component';

// Models
import { Role } from '../../../core/models/domain/role';
import { Permission } from '../../../core/models/domain/permission';
import { TreeNode } from '../../../core/models/ui/tree-node';
import { Button } from '../../../shared/components/admin/button/button';
import { ActionDropdown } from '../../../shared/components/admin/action-dropdown/action-dropdown';
import { ConfirmDialog } from '../../../shared/components/admin/confirm-dialog/confirm-dialog';
import { PERMISSIONS } from '../../../core/constants/permission.constant';
import { AuthService } from '../../../auth/auth.service';
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
    NzModalModule,
    NzFormModule,
    NzDropDownModule,
    NzIconModule,
    AssignPermissionModalComponent,
    PaginationComponent,
    Button,
    ActionDropdown,
    ConfirmDialog,
  ],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss'],
})
export class RolesComponent implements OnInit, OnDestroy {
  roles: Role[] = [];
  groupedPermissions: { module: string; permissions: Permission[] }[] = [];
  treeData: TreeNode[] = [];
  readonly PERMISSIONS = PERMISSIONS;

  // Modal state
  isCreateVisible = false;
  isAssignVisible = false;
  isConfirmLoading = false;
  isDeleteModalVisible = false;

  // Form state
  roleName = '';
  roleNameExists = false;
  selectedRole: Role | null = null;

  // Pagination & search
  totalItems = 0;
  pageSize = 5;
  currentPage = 1;
  searchQuery = '';

  private readonly destroy$ = new Subject<void>();
  // Inject services
  private readonly roleService = inject(RoleService);
  private readonly auth = inject(AuthService)
  private readonly permissionService = inject(PermissionService);
  private readonly zone = inject(NgZone);
  private readonly msg = inject(NzMessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    if (this.auth.hasPermission(PERMISSIONS.PERMISSIONS_VIEW)) {
      this.loadPermissions();
    } else {
      console.warn('Không có quyền xem quyền hạn (PERMISSIONS_VIEW)');
    }

    if (this.auth.hasPermission(PERMISSIONS.ROLES_VIEW)) {
      this.loadRoles();
    } else {
      console.warn('Không có quyền xem vai trò (ROLES_VIEW)');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Helper to group permissions by module */
  private groupPermissionsByModule(
    data: Permission[]
  ): { module: string; permissions: Permission[] }[] {
    const modules = [...new Set(data.map((p) => p.module))];
    return modules.map((module) => ({
      module,
      permissions: data.filter((p) => p.module === module),
    }));
  }

  /** Helper to build tree data */
  private buildTreeData(data: Permission[]): TreeNode[] {
    const modules = [...new Set(data.map((p) => p.module))];
    return modules.map((module) => ({
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
  }

  /** Load toàn bộ permissions và build tree */
  private loadPermissions(): void {
    this.permissionService
      .getPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Permission[]) => {
          this.zone.run(() => {
            this.groupedPermissions = this.groupPermissionsByModule(data);
            this.treeData = this.buildTreeData(data);
            this.cdr.detectChanges();
          });
        },
        error: () => console.log('Không thể tải danh sách quyền'),
      });
  }

  /** Load roles phân trang và search */
  private loadRoles(): void {
    if (this.searchQuery) {
      this.roleService
        .searchRoles(this.searchQuery, this.currentPage, this.pageSize)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: { items: Role[]; totalItems: number }) => {
            this.zone.run(() => {
              this.roles = res.items;
              this.totalItems = res.totalItems;
              this.cdr.detectChanges();
            });
          },
        });
    } else {
      this.roleService
        .getPagedRoles(this.currentPage, this.pageSize)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: { items: Role[]; totalItems: number }) => {
            this.zone.run(() => {
              this.roles = res.items;
              this.totalItems = res.totalItems;
              this.cdr.detectChanges();
            });
          },
        });
    }
  }

  /** Hiển thị modal tạo role */
  showCreateModal(): void {
    this.isCreateVisible = true;
    this.roleName = '';
    this.roleNameExists = false;
    this.selectedRole = null;
    this.cdr.detectChanges();
  }

  handleCreateOk(): void {
    if (!this.roleName) return;
    this.isConfirmLoading = true;

    const save$ = this.selectedRole
      ? this.roleService.updateRole(this.selectedRole.id, { name: this.roleName })
      : this.roleService.createRole({ name: this.roleName });

    save$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () =>
        this.afterSaveSuccess(
          this.selectedRole ? 'Cập nhật vai trò thành công' : 'Tạo vai trò thành công',
          'create'
        ),
      error: (err) => this.afterSaveError(err),
    });
  }

  handleCreateCancel(): void {
    this.isCreateVisible = false;
    this.roleName = '';
    this.roleNameExists = false;
    this.selectedRole = null;
    this.cdr.detectChanges();
  }

  /** Helper to build tree data for assign modal */
  private buildAssignTreeData(allPerms: Permission[], grantedIds: Set<number>): TreeNode[] {
    const modules = [...new Set(allPerms.map((p) => p.module))];
    return modules.map((module) => ({
      key: module,
      title: module,
      expanded: true,
      children: allPerms
        .filter((p) => p.module === module)
        .map((p) => ({
          key: `${module}-${p.id}`,
          title: p.description,
          isLeaf: true,
          id: p.id,
          checked: grantedIds.has(p.id),
        })),
    }));
  }

  /** Helper to group permissions for assign modal */
  private buildAssignGroupedPermissions(allPerms: Permission[], grantedIds: Set<number>) {
    const modules = [...new Set(allPerms.map((p) => p.module))];
    return modules.map((module) => ({
      module,
      permissions: allPerms
        .filter((p) => p.module === module)
        .map((p) => ({ ...p, granted: grantedIds.has(p.id) })),
    }));
  }

  /** Hiển thị modal gán quyền */
  showAssignModal(role: Role): void {
    this.isAssignVisible = true;
    this.selectedRole = role;

    this.permissionService.getPermissions().subscribe((allPerms) => {
      this.roleService
        .getPermissionsByRole(role.id)
        .subscribe((res: { roleId: number; permissions: Permission[] }) => {
          const grantedIds = new Set(res.permissions.filter((p) => p.granted).map((p) => p.id));

          this.treeData = this.buildAssignTreeData(allPerms, grantedIds);
          this.groupedPermissions = this.buildAssignGroupedPermissions(allPerms, grantedIds);

          this.cdr.detectChanges();
        });
    });
  }

  handleAssignOk(permissions: Permission[]): void {
    if (!this.selectedRole) return;
    this.isConfirmLoading = true;

    const payload = permissions.map((p) => ({ id: p.id, granted: !!p.granted }));
    this.roleService
      .assignPermissionsToRole(this.selectedRole.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.afterSaveSuccess('Gán quyền thành công', 'assign'),
        error: (err) => this.afterSaveError(err),
      });
  }

  handleAssignCancel(): void {
    this.isAssignVisible = false;
    this.selectedRole = null;
    this.cdr.detectChanges();
  }

  /** Sau khi thao tác thành công */
  private afterSaveSuccess(message: string, type: 'create' | 'assign'): void {
    this.zone.run(() => {
      this.isConfirmLoading = false;

      if (type === 'create') this.isCreateVisible = false;
      if (type === 'assign') this.isAssignVisible = false;

      this.roleName = '';
      this.selectedRole = null;

      this.msg.success(message);
      this.cdr.detectChanges();

      // Cập nhật table roles ngay
      setTimeout(() => this.loadRoles(), 0);
    });
  }

  private afterSaveError(error: any): void {
    this.zone.run(() => {
      this.isConfirmLoading = false;

      if (error?.error?.message?.includes('tồn tại')) {
        this.roleNameExists = true;
        this.msg.warning('Tên vai trò đã tồn tại, vui lòng nhập tên khác');
      } else {
        this.msg.error('Có lỗi xảy ra, vui lòng thử lại');
      }

      this.cdr.detectChanges();
    });
  }

  deleteRole(role: Role): void {
    this.selectedRole = role;
    this.isDeleteModalVisible = true;
  }

  handleConfirmDelete(): void {
    if (!this.selectedRole) return;

    this.roleService
      .deleteRole(this.selectedRole.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.msg.success('Xóa vai trò thành công');
          this.loadRoles();
        },
        error: () => console.log('Xóa vai trò thất bại'),
      });

    this.isDeleteModalVisible = false;
  }

  handleCancelDelete(): void {
    this.msg.info('Hủy xóa vai trò');
    this.isDeleteModalVisible = false;
  }

  editRole(role: Role): void {
    this.roleName = role.name;
    this.selectedRole = role;
    this.isCreateVisible = true;
    this.roleNameExists = false;
    this.cdr.detectChanges();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRoles();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadRoles();
  }

  filterRoles(): void {
    this.loadRoles();
  }

  get selectedPermissions(): Permission[] {
    const selected: Permission[] = [];
    const traverse = (nodes: TreeNode[], parentModule?: string) => {
      nodes.forEach((node) => {
        if (node.checked && node.isLeaf) {
          selected.push({
            id: node.id!,
            name: node.title,
            module: parentModule || '',
            description: node.title,
          });
        }
        if (node.children) traverse(node.children, node.key);
      });
    };
    traverse(this.treeData);
    return selected;
  }

  onRoleNameChange(value: string): void {
    this.roleNameExists = this.roles.some(
      (r) => r.name.toLowerCase() === value.toLowerCase() && r !== this.selectedRole
    );
  }

  sortByName = (a: Role, b: Role): number => {
    return a.name.localeCompare(b.name);
  };

  sortByUserCount = (a: Role, b: Role): number => {
    return a.userCount - b.userCount;
  };
  onDropdownAction(event: { action: string; data: any }) {
    const { action, data } = event;
    switch (action) {
      case 'assign':
        this.showAssignModal(data);
        break;
      case 'edit':
        this.editRole(data);
        break;
      case 'delete':
        this.deleteRole(data);
        break;
    }
  }
}
