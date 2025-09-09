import { Component, Input, Output, EventEmitter, ChangeDetectorRef, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTreeModule } from 'ng-zorro-antd/tree';

// ================== Interfaces ==================
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

// ================== Component ==================
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
  ],
  templateUrl: './assign-permission-modal.html',
  styleUrls: ['./assign-permission-modal.scss']
})
export class AssignPermissionModalComponent {
  @Input() visible = false;
  @Input() role!: Role | null;
  @Input() groupedPermissions: GroupedPermissions[] = [];

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<Permission[]>();

  selectedModule: string | null = null;
  allChecked = false;

  private cdr = inject(ChangeDetectorRef);

  ngOnChanges(): void {
    if (this.groupedPermissions.length > 0 && !this.selectedModule) {
      this.selectedModule = this.groupedPermissions[0].module;
    }
  }

  getPermissionsByModule(module: string): Permission[] {
    const group = this.groupedPermissions.find((g) => g.module === module);
    return group ? group.permissions : [];
  }

  isAllSelected(module?: string): boolean {
    if (module) {
      const perms = this.getPermissionsByModule(module);
      return perms.length > 0 && perms.every((p) => p.granted === true);
    } else {
      const allPerms = this.groupedPermissions.flatMap((g) => g.permissions);
      return allPerms.length > 0 && allPerms.every((p) => p.granted === true);
    }
  }

  toggleAllPermissions(checked: boolean, module?: string): void {
    if (module) {
      this.groupedPermissions = this.groupedPermissions.map((group) =>
        group.module === module
          ? { ...group, permissions: group.permissions.map((perm) => ({ ...perm, granted: checked })) }
          : group
      );
    } else {
      this.groupedPermissions = this.groupedPermissions.map((group) => ({
        ...group,
        permissions: group.permissions.map((perm) => ({ ...perm, granted: checked })),
      }));
    }
    this.allChecked = this.isAllSelected();
    this.cdr.detectChanges();
  }

  handleCancel(): void {
    this.cancel.emit();
  }

  handleSave(): void {
    const payload = this.groupedPermissions.flatMap((group) =>
      group.permissions.map((perm) => ({ ...perm }))
    );
    this.save.emit(payload);
  }
}
