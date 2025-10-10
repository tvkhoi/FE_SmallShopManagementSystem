import { PERMISSION_GROUPS } from './../../../../core/constants/permission-groups';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  inject,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { User } from '../../../../core/models/domain/user';
import { Button } from '../button/button';
import { PermissionService } from '../../../../core/services/permission.service';

export interface Permission {
  id: number;
  name: string;
  module: string;
  description: string;
  granted?: boolean;
}

export interface Role {
  id: number;
  name: string;
  userCount: number;
}

export interface GroupedPermissions {
  module: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-assign-permission-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzModalModule,
    NzTreeModule,
    Button,
  ],
  templateUrl: './assign-permission-modal.html',
  styleUrls: ['./assign-permission-modal.scss'],
})
export class AssignPermissionModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() role!: Role | null;
  @Input() user!: User | null;
  @Input() groupedPermissions: GroupedPermissions[] = [];

  @Output() cancelModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<Permission[]>();

  readonly PERMISSION_GROUPS = PERMISSION_GROUPS;

  selectedModule: string | null = null;
  allChecked = false;
  searchKeyword = '';

  filteredPermissions: GroupedPermissions[] = [];

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly permissionService = inject(PermissionService);

  ngOnChanges(): void {
    if (this.groupedPermissions.length > 0 && this.visible) {
      this.initializePermissions();
    }
  }

  // Khởi tạo lại dữ liệu mỗi khi mở modal
  private initializePermissions(): void {
    this.filteredPermissions = JSON.parse(JSON.stringify(this.groupedPermissions));
    this.selectedModule = this.filteredPermissions[0]?.module || null;
    this.allChecked = this.isAllSelected();
    this.searchKeyword = '';
    this.cdr.detectChanges();
  }

  // Lấy danh sách quyền theo module
  getPermissionsByModule(module: string): Permission[] {
    const group = this.filteredPermissions.find((g) => g.module === module);
    return group ? group.permissions : [];
  }

  // Kiểm tra đã chọn hết chưa
  isAllSelected(module?: string): boolean {
    if (module) {
      const perms = this.getPermissionsByModule(module);
      return perms.length > 0 && perms.every((p) => p.granted === true);
    } else {
      const allPerms = this.filteredPermissions.flatMap((g) => g.permissions);
      return allPerms.length > 0 && allPerms.every((p) => p.granted === true);
    }
  }

  // Chọn toàn bộ quyền
  toggleAllPermissions(checked: boolean, module?: string): void {
    if (module) {
      this.filteredPermissions = this.filteredPermissions.map((group) =>
        group.module === module
          ? { ...group, permissions: group.permissions.map((p) => ({ ...p, granted: checked })) }
          : group
      );
    } else {
      this.filteredPermissions = this.filteredPermissions.map((group) => ({
        ...group,
        permissions: group.permissions.map((p) => ({ ...p, granted: checked })),
      }));
    }

    this.syncGrantedState();
    this.allChecked = this.isAllSelected();
    this.cdr.detectChanges();
  }

  // Đóng modal → reset toàn bộ state
  handleCancel(): void {
    this.resetState();
    this.cancelModal.emit();
  }

  // Lưu quyền đã chọn
  handleSave(): void {
    this.syncGrantedState();
    // Lấy tất cả quyền có granted = true
    const selectedPermissions = this.groupedPermissions
      .flatMap((group) => group.permissions)
      .filter((perm) => perm.granted);

    // Phát ra danh sách quyền đã chọn
    this.save.emit(selectedPermissions);
    // Reset state modal
    this.resetState();
  }

  // Tìm kiếm quyền — KHÔNG làm mất quyền đã chọn
  searchPermissions(): void {
    // Luôn đồng bộ trước khi tìm kiếm
    this.syncGrantedState();

    const keyword = this.searchKeyword.trim().toLowerCase();

    // Nếu không nhập gì khôi phục danh sách gốc, vẫn giữ granted
    if (!keyword) {
      this.filteredPermissions = JSON.parse(JSON.stringify(this.groupedPermissions));
      this.selectedModule = this.filteredPermissions[0]?.module || null;
      this.cdr.detectChanges();
      return;
    }

    this.permissionService.searchPermissions(keyword).subscribe({
      next: (permissions) => {
        // Tạo map quyền đã granted (giữ lại dù có hay không trong kết quả tìm kiếm)
        const grantedMap = new Map<number, boolean>();
        for (const g of this.groupedPermissions) {
          for (const p of g.permissions) {
            if (p.granted) grantedMap.set(p.id, true);
          }
        }

        // Gom nhóm kết quả tìm kiếm
        const grouped: GroupedPermissions[] = [];
        for (const perm of permissions) {
          perm.granted = grantedMap.has(perm.id);

          let group = grouped.find((g) => g.module === perm.module);
          if (!group) {
            group = { module: perm.module, permissions: [] };
            grouped.push(group);
          }
          group.permissions.push(perm);
        }

        // Giữ lại quyền đã granted không nằm trong kết quả mới
        const extraGranted = this.groupedPermissions
          .flatMap((g) => g.permissions)
          .filter((p) => p.granted && !permissions.some((sp) => sp.id === p.id));

        for (const perm of extraGranted) {
          let group = grouped.find((g) => g.module === perm.module);
          if (!group) {
            group = { module: perm.module, permissions: [] };
            grouped.push(group);
          }
          group.permissions.push(perm);
        }

        // Cập nhật UI
        this.filteredPermissions = grouped;
        this.selectedModule = this.filteredPermissions[0]?.module || null;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Search permissions failed:', err),
    });
  }

  // Đồng bộ trạng thái granted từ filtered → grouped
  private syncGrantedState(): void {
    for (const filteredGroup of this.filteredPermissions) {
      const originalGroup = this.groupedPermissions.find((g) => g.module === filteredGroup.module);
      if (originalGroup) {
        for (const perm of filteredGroup.permissions) {
          const target = originalGroup.permissions.find((p) => p.id === perm.id);
          if (target) target.granted = perm.granted;
        }
      }
    }
  }

  // Reset toàn bộ state về mặc định
  private resetState(): void {
    this.searchKeyword = '';
    this.selectedModule = null;
    this.filteredPermissions = [];
    this.allChecked = false;
  }
}
