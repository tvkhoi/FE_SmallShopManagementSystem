import { NzMessageService } from 'ng-zorro-antd/message';
import { Component, inject, ChangeDetectorRef, NgZone, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, switchMap, takeUntil } from 'rxjs';

// Ant Design Modules
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormatEmitEvent, NzTreeModule } from 'ng-zorro-antd/tree';

// Services
import { PermissionService } from '../../../core/services/permission.service';
import { RoleService } from '../../../core/services/role.service';

// ================== Interfaces ==================
interface Role {
  id: number;
  name: string;
  userCount: number;
}

interface Permission {
  id: number;
  name: string;
  module: string;
  description: string;
  granted?: boolean;
}

interface RolePermissionsResponse {
  roleId: number;
  permissions: Permission[];
}

interface TreeNode {
  key: string;
  title: string;
  children?: TreeNode[];
  isLeaf?: boolean;
  checked?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  id?: number;
}

// ================== Component ==================
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
    NzCheckboxModule,
    NzFormModule,
    NzDropDownModule,
    NzIconModule,
    NzTreeModule,
  ],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss'],
})
export class RolesComponent implements OnInit, OnDestroy {
  roles: Role[] = [];
  treeData: TreeNode[] = [];
  originalPermissions: { id: number; granted: boolean }[] = [];

  isVisible = false;
  isConfirmLoading = false;
  submitted = false;

  roleName = '';
  editingRoleId: number | null = null;

  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  searchQuery = '';

  private destroy$ = new Subject<void>();

  private permissionService = inject(PermissionService);
  private roleService = inject(RoleService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private msg = inject(NzMessageService);

  ngOnInit(): void {
    this.loadPermissions();
    this.loadRoles();
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
            this.treeData = modules.map((module) => {
              const modulePerms = data.filter((p) => p.module === module);
              return {
                key: module,
                title: module,
                expanded: true,
                children: modulePerms.map((perm) => ({
                  key: `${module}-${perm.id}`,
                  title: perm.description,
                  isLeaf: true,
                  checked: false,
                  id: perm.id,
                })),
              };
            });
            this.cdr.detectChanges();
          });
        },
        error: (error) => console.error('Lỗi khi load permissions:', error),
      });
  }

  private loadRoles(): void {
    this.roleService
      .getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.roles = data;
            this.totalItems = data.length;
            this.cdr.detectChanges();
          });
        },
        error: (error) => console.error('Lỗi khi load roles:', error),
      });
  }

  // ================== Modal ==================
  showModal(): void {
    this.isVisible = true;
    this.submitted = false;
    this.roleName = '';
    this.editingRoleId = null;
    this.resetTreeChecked();
  }

  private resetTreeChecked(): void {
    this.treeData = this.treeData.map((module) => ({
      ...module,
      checked: false,
      children: module.children?.map((c) => ({ ...c, checked: false })) || [],
    }));
    this.cdr.detectChanges();
  }

  // ================== Lưu role ==================
  handleOk(): void {
  this.submitted = true;
  if (!this.roleName) return;

  this.isConfirmLoading = true;
  this.cdr.detectChanges();

  const saveRole$ =
    this.editingRoleId === null
      ? this.roleService.createRole({ name: this.roleName })
      : this.roleService.updateRole(this.editingRoleId, { name: this.roleName });

  saveRole$.pipe(takeUntil(this.destroy$)).subscribe({
    next: (res: any) => {
      const roleId = this.editingRoleId ?? res.roleId;

      // Build Map từ originalPermissions
      const originalMap = new Map<number, boolean>();
      this.originalPermissions.forEach(p => originalMap.set(p.id, p.granted));

      // Build payload chỉ gồm quyền thay đổi
      const payload: {id: number, granted: boolean}[] = [];
      this.treeData.forEach(module => {
        module.children?.forEach(child => {
          const checked = !!child.checked;
          const original = originalMap.get(child.id!);
          if (original === undefined || original !== checked) {
            payload.push({ id: child.id!, granted: checked });
          }
        });
      });

      if (payload.length === 0) {
        this.afterSaveSuccess('Vai trò đã được cập nhật (không thay đổi quyền)');
        return;
      }

      this.roleService.assignPermissionsToRole(roleId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.afterSaveSuccess('Vai trò đã được cập nhật thành công'),
          error: (err) => this.afterSaveError(err),
        });
    },
    error: (err) => this.afterSaveError(err),
  });
}


  private afterSaveSuccess(message: string): void {
    this.zone.run(() => {
      this.isConfirmLoading = false;
      this.isVisible = false;
      this.loadRoles();
      this.msg.success(message);
      this.cdr.detectChanges();
    });
  }

  private afterSaveError(error: any): void {
    this.zone.run(() => {
      this.isConfirmLoading = false;
      this.cdr.detectChanges();
      console.error('Lỗi khi lưu role:', error);
    });
  }

  handleCancel(): void {
    this.isVisible = false;
    this.submitted = false;
    this.editingRoleId = null;
  }

  // ================== Tree ==================
  onCheck(event: NzFormatEmitEvent): void {
    this.treeData = [...this.treeData];
    this.cdr.detectChanges();
  }

  // ================== Sửa role ==================
  editRole(role: Role): void {
  this.isVisible = true;
  this.submitted = false;
  this.editingRoleId = role.id;
  this.roleName = role.name;

  this.permissionService.userData$.pipe(takeUntil(this.destroy$)).subscribe(allPermissions => {
    this.roleService.getPermissionsByRole(role.id).pipe(takeUntil(this.destroy$)).subscribe((resp: RolePermissionsResponse) => {
      
      // Lưu tất cả quyền cũ
      this.originalPermissions = resp.permissions.map(p => ({
        id: p.id,
        granted: p.granted ?? false
      }));

      const originalMap = new Map<number, boolean>();
      this.originalPermissions.forEach(p => originalMap.set(p.id, p.granted));

      const modules = [...new Set(allPermissions.map(p => p.module))];
      this.treeData = modules.map(module => {
        const modulePerms = allPermissions.filter(p => p.module === module);
        return {
          key: module,
          title: module,
          expanded: true,
          // checked module = true nếu tất cả quyền module được granted
          checked: modulePerms.every(p => originalMap.get(p.id) ?? false),
          children: modulePerms.map(perm => ({
            key: `${module}-${perm.id}`,
            title: perm.description,
            isLeaf: true,
            id: perm.id,
            checked: originalMap.get(perm.id) ?? false
          }))
        };
      });

      this.cdr.detectChanges();
    });
  });
}


  // ================== Xóa role ==================
  deleteRole(role: Role): void {
    console.log('Đang xóa role:', role.name);
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
        if (node.children) {
          traverse(node.children, node.key);
        }
      });
    };

    traverse(this.treeData);
    return selected;
  }

  get pagedRoles(): Role[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.roles.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.cdr.detectChanges();
  }

  filterRoles(): void {
    console.log('Lọc roles theo từ khóa:', this.searchQuery);
  }
}
