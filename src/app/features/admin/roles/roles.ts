import { Component, OnInit, OnDestroy, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, Subject, switchMap, takeUntil } from 'rxjs';

// Ant Design Modules
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';

// Services
import { PermissionService } from '../../../core/services/permission.service';
import { RoleService } from '../../../core/services/role.service';

// Components
import { AssignPermissionModalComponent } from '../../../shared/components/assign-permission-modal/assign-permission-modal';
import { PaginationComponent } from '../../../shared/components/pagination-component/pagination-component';

// Models
import { Role } from '../../../core/models/role';
import { Permission } from '../../../core/models/permission';
import { TreeNode } from '../../../core/models/tree-node';
import { RolePermissionsResponse } from './role-permission-respose.model';
import { ApiResponse } from '../../../core/models/ApiResponse';

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
    NzSelectModule,
    NzModalModule,
    NzFormModule,
    NzDropDownModule,
    NzIconModule,
    AssignPermissionModalComponent,
    PaginationComponent,
  ],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss'],
})
export class RolesComponent implements OnInit, OnDestroy {
  // Data
  roles: Role[] = [];
  treeData: TreeNode[] = [];
  originalPermissions: { id: number; granted: boolean }[] = [];
  groupedPermissions: { module: string; permissions: Permission[] }[] = [];
  selectedModule: string | null = null;

  // Modal state
  isCreateVisible = false;
  isAssignVisible = false;

  // Loading
  isConfirmLoading = false;

  // Form state
  roleName = '';
  roleNameExists = false;
  selectedRoleId: number | null = null;
  selectedRole: Role | null = null;

  // Pagination & search
  totalItems = 0;
  pageSize = 7;
  currentPage = 1;
  searchQuery = '';

  // RxJS destroy
  private destroy$ = new Subject<void>();

  // Inject services
  private permissionService = inject(PermissionService);
  private roleService = inject(RoleService);
  private zone = inject(NgZone);
  private msg = inject(NzMessageService);
  private modal: NzModalService = inject(NzModalService);

  ngOnInit(): void {
    this.loadPermissions();
    this.loadPagedRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================== Load dữ liệu ==================
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

            if (modules.length > 0) {
              this.selectedModule = modules[0];
            }

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
          });
        },
        error: (error) => {
          console.error('Lỗi khi load permissions:', error);
          this.msg.error('Không thể tải danh sách quyền');
        },
      });
  }

  private loadPagedRoles(): void {
    this.roleService
      .getPagedRoles(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<{ items: Role[]; totalItems: number }>) => {
          if (res.success && res.data) {
            this.zone.run(() => {
              this.roles = res.data.items;
              this.totalItems = res.data.totalItems;
            });
          }
        },
        error: (error) => {
          console.error('Lỗi khi load roles:', error);
          this.msg.error('Không thể tải danh sách vai trò');
        },
      });
  }

  // ================== Modal tạo role ==================
  showCreateModal(): void {
    this.isCreateVisible = true;
    this.roleName = '';
    this.roleNameExists = false;
  }

  handleCreateOk(): void {
    if (!this.roleName) return;

    this.isConfirmLoading = true;

    const save$ = this.selectedRoleId
      ? this.roleService.updateRole(this.selectedRoleId, { name: this.roleName })
      : this.roleService.createRole({ name: this.roleName });

    save$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isConfirmLoading = false))
      )
      .subscribe({
        next: (res: ApiResponse<{ id: number; name: string }>) => {
          if (res.success) {
            const message = this.selectedRoleId
              ? 'Cập nhật vai trò thành công'
              : 'Tạo vai trò thành công';
            this.afterSaveSuccess(message, 'create');
          }
        },
        error: (err) => this.afterSaveError(err),
      });
  }

  handleCreateCancel(): void {
    this.isCreateVisible = false;
    this.roleName = '';
    this.roleNameExists = false;
  }

  // ================== Modal gán quyền ==================
  showAssignModal(role: Role): void {
    this.isAssignVisible = true;
    this.selectedRoleId = role.id;
    this.selectedRole = role;

    this.roleService
      .getPermissionsByRole(role.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          if (res.success && res.data) {
            // Cast dữ liệu chính xác
            const resp: RolePermissionsResponse = {
              roleId: res.data.roleId,
              permissions: res.data.permissions,
            };

            this.originalPermissions = resp.permissions.map((p) => ({
              id: p.id,
              granted: p.granted ?? false,
            }));

            const originalMap = new Map<number, boolean>();
            this.originalPermissions.forEach((p) => originalMap.set(p.id, p.granted));

            this.zone.run(() => {
              this.groupedPermissions = this.groupedPermissions.map((group) => ({
                ...group,
                permissions: group.permissions.map((perm) => ({
                  ...perm,
                  granted: originalMap.get(perm.id) ?? false,
                })),
              }));
            });
          }
        },
        error: (error) => console.error('Lỗi khi tải quyền:', error),
      });
  }

  handleAssignOk(payload: Permission[]): void {
    if (!this.selectedRoleId) return;
    this.isConfirmLoading = true;

    const assignPayload = payload.map((p) => ({
      id: p.id,
      granted: !!p.granted,
    }));

    this.roleService
      .assignPermissionsToRole(this.selectedRoleId, assignPayload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isConfirmLoading = false))
      )
      .subscribe({
        next: (res: ApiResponse<RolePermissionsResponse>) => {
          if (res.success && res.data) {
            const updatedMap = new Map<number, boolean>();
            res.data.permissions.forEach((p) => updatedMap.set(p.id, p.granted ?? false));

            this.zone.run(() => {
              this.groupedPermissions = this.groupedPermissions.map((group) => ({
                ...group,
                permissions: group.permissions.map((perm) => ({
                  ...perm,
                  granted: updatedMap.get(perm.id) ?? false,
                })),
              }));
              this.afterSaveSuccess('Gán quyền thành công', 'assign');
            });
          }
        },
        error: (err) => this.afterSaveError(err),
      });
  }

  handleAssignCancel(): void {
    this.isAssignVisible = false;
    this.selectedRoleId = null;
  }

  // ================== Xử lý sau khi lưu ==================
  private afterSaveSuccess(message: string, type: 'create' | 'assign'): void {
    this.zone.run(() => {
      this.isConfirmLoading = false;
      if (type === 'create') this.isCreateVisible = false;
      if (type === 'assign') this.isAssignVisible = false;

      this.loadPagedRoles();
      this.msg.success(message);
    });
  }

  private afterSaveError(error: any): void {
    this.zone.run(() => {
      this.isConfirmLoading = false;
      console.error('Lỗi khi lưu:', error);

      if (error?.error?.errorCode === 'ROLE_DUPLICATE') {
        this.msg.warning('Tên vai trò đã tồn tại, vui lòng nhập tên khác');
        this.roleNameExists = true;
        setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>('#roleName');
          input?.focus();
        });
      } else {
        this.roleNameExists = false;
        this.msg.error('Có lỗi xảy ra, vui lòng thử lại');
      }
    });
  }

  // ================== Tree ==================
  onCheck(event: NzFormatEmitEvent): void {
    // Cập nhật checked state đúng
    const updateChecked = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children) updateChecked(node.children);
      });
    };
    updateChecked(this.treeData);
    this.treeData = [...this.treeData];
  }

  // ================== Xóa role ==================
  deleteRole(role: Role): void {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc muốn xóa vai trò này?',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.roleService
          .deleteRole(role.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res: ApiResponse<{ roleId: number }>) => {
              if (res.success) {
                this.msg.success('Xóa vai trò thành công');
                this.loadPagedRoles();
              }
            },
            error: (err) => {
              console.error('Lỗi khi xóa vai trò:', err);
              this.msg.error('Xóa vai trò thất bại');
            },
          });
      },
      nzCancelText: 'Hủy',
      nzOnCancel: () => this.msg.info('Hủy xóa vai trò'),
    });
  }

  // ================== Sửa role ==================
  editRole(role: Role): void {
    this.roleName = role.name;
    this.selectedRoleId = role.id;
    this.isCreateVisible = true;
    this.roleNameExists = false;
  }

  // ================== Helper ==================
  get selectedPermissions(): Permission[] {
    const selected: Permission[] = [];
    const traverse = (nodes: TreeNode[], parentModule?: string) => {
      nodes.forEach((node) => {
        if (node.checked && node.isLeaf) {
          selected.push({
            id: node.id!,
            name: node.title!,
            module: parentModule || '',
            description: node.title!,
          });
        }
        if (node.children) traverse(node.children, node.key);
      });
    };
    traverse(this.treeData);
    return selected;
  }

  get pagedRoles(): Role[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.roles.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPagedRoles();
  }

    filterRoles(): void {
    if (!this.searchQuery) {
      this.loadPagedRoles();
      return;
    }

    this.roleService
      .searchRoles(this.searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: ApiResponse<Role[]>) => {
          if (res.success && res.data) {
            this.zone.run(() => {
              this.roles = res.data;
              this.totalItems = res.data.length;
            });
          }
        },
        (err: any) => {
          console.error('Lỗi khi tìm kiếm vai trò:', err);
          this.msg.error('Tìm kiếm vai trò thất bại');
        }
      );
  }

  onRoleNameChange(value: string): void {
    if (this.roleNameExists) {
      this.roleNameExists = false;
    }
  }
}
