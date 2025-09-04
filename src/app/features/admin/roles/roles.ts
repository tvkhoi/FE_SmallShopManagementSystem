import { NzMessageService } from 'ng-zorro-antd/message';
import { Component, inject, ChangeDetectorRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  roleId: number;
  name: string;
  userCount: number;
}

interface Permission {
  id: number;
  name: string;
  module: string;
  description: string;
}

interface TreeNode {
  key: string;
  title: string;
  children?: TreeNode[];
  isLeaf?: boolean;
  checked?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  id?: number; // For leaf nodes (permissions)
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
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  treeData: TreeNode[] = [];

  isVisible = false;
  isConfirmLoading = false;
  submitted = false;

  roleName = '';
  editingRoleId: number | null = null;

  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  searchQuery = '';

  private permissionService = inject(PermissionService);
  private roleService = inject(RoleService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private msg = inject(NzMessageService);

  ngOnInit(): void {
    this.loadPermissions();
    this.loadRoles();
  }

  private loadPermissions(): void {
    this.permissionService.getPermissions().subscribe({
      next: () => {
        this.permissionService.userData$.subscribe({
          next: (data: Permission[]) => {
            this.zone.run(() => {
              // Group permissions into tree structure
              const modules = [...new Set(data.map(p => p.module))];
              this.treeData = modules.map(module => {
                const modulePerms = data.filter(p => p.module === module);
                return {
                  key: module,
                  title: module,
                  expanded: true,
                  children: modulePerms.map(perm => ({
                    key: `${module}-${perm.id}`,
                    title: perm.description,
                    isLeaf: true,
                    checked: false,
                    id: perm.id
                  }))
                };
              });
              this.cdr.detectChanges();
            });
          },
          error: (error) => console.error('Lỗi khi load permissions:', error),
        });
      },
      error: (error) => console.error('Lỗi khi gọi API permissions:', error),
    });
  }

  private loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
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

  showModal(): void {
    this.isVisible = true;
    this.submitted = false;
    this.roleName = '';
    this.resetTreeChecked();
  }

  private resetTreeChecked(): void {
  this.treeData = this.treeData.map(module => ({
    ...module,
    checked: false,
    children: module.children?.map(c => ({ ...c, checked: false })) || []
  }));
  this.cdr.detectChanges();
}

  handleOk(): void {
    this.submitted = true;

    if (!this.roleName || this.selectedPermissions.length === 0) {
      return;
    }

    this.isConfirmLoading = true;
    this.cdr.detectChanges();

    this.zone.run(() => {
      this.roleService.createRole({ name: this.roleName }).subscribe({
        next: (newRole) => {
          const roleId = newRole.roleId;

          const payload = this.selectedPermissions.map((p) => ({
            id: p.id,
            granted: true,
          }));

          this.roleService.assignPermissionsToRole(roleId, payload).subscribe({
            next: () => {
              this.zone.run(() => {
                this.isConfirmLoading = false;
                this.isVisible = false;
                this.loadRoles();
                this.msg.success('Vai trò đã được tạo và gán quyền thành công');
                this.cdr.detectChanges();
              });
            },
            error: (error) => {
              this.zone.run(() => {
                this.isConfirmLoading = false;
                this.cdr.detectChanges();
                console.error('Lỗi khi gán quyền:', error);
              });
            },
          });
        },
        error: (error) => {
          this.zone.run(() => {
            this.isConfirmLoading = false;
            this.cdr.detectChanges();
            console.error('Lỗi khi tạo role:', error);
          });
        },
      });
    });
  }

  handleCancel(): void {
    this.isVisible = false;
    this.submitted = false;
  }

onCheck(event: NzFormatEmitEvent): void {
  this.treeData = [...this.treeData]; 
  this.cdr.detectChanges();
}

private updateTreeChecked(nodes: TreeNode[], checkedKeys: string[]): TreeNode[] {
  return nodes.map(node => {
    const updatedNode = { ...node, checked: checkedKeys.includes(node.key) };
    if (node.children) {
      updatedNode.children = this.updateTreeChecked(node.children, checkedKeys);
    }
    return updatedNode;
  });
}

// Chỉ lấy quyền (leaf nodes hoặc cả cha nếu muốn)
get selectedPermissions(): Permission[] {
  const selected: Permission[] = [];

  const traverse = (nodes: TreeNode[], parentModule?: string) => {
    nodes.forEach(node => {
      if (node.checked) {
        // Nếu là leaf node => quyền
        if (node.isLeaf) {
          selected.push({
            id: node.id!,
            name: node.title!,
            module: parentModule || '',
            description: node.title!
          });
        } else {
          // Nếu muốn lấy cả node cha thì có thể push vào đây
          // selected.push({ id: 0, name: node.title, module: node.key, description: node.title });
        }
      }
      if (node.children) {
        traverse(node.children, node.key);
      }
    });
  };

  traverse(this.treeData);
  return selected;
}


  // Sửa role
  editRole(role: Role): void {
    console.log('Đang sửa role:', role.name);
  }

  // Xóa role
  deleteRole(role: Role): void {
    console.log('Đang xóa role:', role.name);
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