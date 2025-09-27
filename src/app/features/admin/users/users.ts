import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeModule, NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { PaginationComponent } from '../../../shared/components/admin/pagination-component/pagination-component';
import { AssignPermissionModalComponent } from '../../../shared/components/admin/assign-permission-modal/assign-permission-modal';
import { PermissionService } from '../../../core/services/permission.service';
import { UserService } from '../../../core/services/user.service';

import { Permission } from '../../../core/models/domain/permission';
import { TreeNode } from '../../../core/models/ui/tree-node';
import { User } from '../../../core/models/domain/user';
import { UserPermissionsResponse } from '../../../core/models/ui/user-permission-respose.model';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { Role } from '../../../core/models/domain/role';
import { RoleService } from '../../../core/services/role.service';
import { UserDTO } from '../../../core/models/ui/user.dto';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzSelectModule } from 'ng-zorro-antd/select';

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
    NzTooltipModule,
    NzSelectModule,
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class UsersComponent implements OnInit {
  private readonly permissionService = inject(PermissionService);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  searchQuery = '';
  users: User[] = [];

  newUser: UserDTO = {
    id: 0,
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    password: '',
    address: '',
    createdAt: new Date(),
    isActive: true,
    isDeleted: false,
    RoleName: [],
  };

  filters: any = {
    isActive: undefined,
    email: '',
    username: '',
    phone: '',
    fullName: '',
    atDress: '',
    createdAt: '',
  };

  totalItems = 0;
  pageSize: number = 5;
  currentPage: number = 1;

  // Modal states
  isVisible = false;
  isConfirmLoading = false;
  isAssignVisible = false;
  isViewDetailsVisible = false;
  submitted = false;
  passwordVisible: boolean = false;
  confirmPasswordVisible = false;
  confirmPassword: string = '';
  isEditMode: boolean = false;
  isChangePasswordVisible = false;
  loading: boolean = false;
  changePassword = { newPassword: '' };

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

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadUsers();
    this.loadPermissions();
    this.loadRoles();
  }

  /** Load danh sách user */
  private loadUsers(): void {
    const params = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
    };
    this.userService.getUsersPaged(params).subscribe({
      next: (pagedResult) => {
        this.zone.run(() => {
          this.users = pagedResult.items;
          this.totalItems = pagedResult.totalItems;
          this.pageSize = pagedResult.pageSize;
          this.currentPage = pagedResult.pageNumber;
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Lỗi tải users phân trang:', err),
    });
  }

  /** Load toàn bộ quyền */
  private loadPermissions(): void {
    this.permissionService.getPermissions().subscribe({
      next: (allPerms) => {
        const modules = [...new Set(allPerms.map((p) => p.module))];
        this.groupedPermissions = modules.map((module) => ({
          module,
          permissions: allPerms.filter((p) => p.module === module),
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Lỗi khi load permissions:', err),
    });
  }
  /** Load toàn bộ role */
  private loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.roles = data.map((role: Role) => ({
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

  filterUsers(page: number = 1): void {
    const term = this.searchQuery.trim();

    // Nếu không có từ khóa → quay lại loadUsers bình thường
    if (!term) {
      this.currentPage = page;
      this.loadUsers();
      return;
    }

    this.userService.searchUsers(term, page, this.pageSize).subscribe({
      next: (pagedResult) => {
        this.zone.run(() => {
          this.users = pagedResult.items;
          this.totalItems = pagedResult.totalItems;
          this.pageSize = pagedResult.pageSize;
          this.currentPage = pagedResult.pageNumber;
          this.cdr.detectChanges();
        });
      },
      error: (e) => console.error('Lỗi search users:', e),
    });
  }
  onPageChange(page: number): void {
    this.currentPage = page;

    if (this.searchQuery.trim()) {
      // Nếu đang search theo từ khóa
      this.filterUsers(page);
    } else if (
      this.filters.email ||
      this.filters.username ||
      this.filters.phone ||
      this.filters.fullName ||
      this.filters.atDress ||
      this.filters.createdAt !== '' ||
      this.filters.isActive !== undefined
    ) {
      this.applyFilter();
    } else {
      this.loadUsers();
    }

    this.cdr.detectChanges();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.onPageChange(this.currentPage);
    this.cdr.detectChanges();
  }

  /** Modal: tạo user + gán quyền */
  showModal(): void {
    this.isVisible = true;
    this.submitted = false;
    this.isEditMode = false;
    this.userId = null;

    // Reset form user
    this.newUser = {
      id: 0,
      username: '',
      email: '',
      fullName: '',
      phoneNumber: '',
      password: '',
      address: '',
      createdAt: new Date(),
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
    if (!this.isEditMode && this.newUser.password !== this.confirmPassword) {
      this.msg.error('Mật khẩu và Nhập lại mật khẩu không khớp!');
      return;
    }

    this.submitted = true;
    this.isConfirmLoading = true;

    // Gán danh sách RoleName từ selection
    this.newUser.RoleName = this.selectedNames ?? [];

    let request$: any;
    if (this.userId) {
      const updatePayload = {
        id: this.newUser.id,
        username: this.newUser.username,
        email: this.newUser.email,
        fullName: this.newUser.fullName,
        phoneNumber: this.newUser.phoneNumber,
        address: this.newUser.address,
        createdAt: this.newUser.createdAt,
        isActive: this.newUser.isActive,
        isDeleted: true,
        roleName: this.selectedNames,
      };
      console.log('Payload cập nhật user:', updatePayload);
      // Update
      request$ = this.userService.updateUser(this.userId, updatePayload);
    } else {
      // Create
      request$ = this.userService.createUser(this.newUser);
    }

    request$
      .pipe(
        finalize(() => {
          this.isConfirmLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.msg.success(this.userId ? 'Cập nhật user thành công' : 'Tạo user thành công');
          this.isVisible = false;
          this.loadUsers();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Lỗi khi lưu user:', err);
        },
      });
  }

  /** Modal: gán quyền cho user đã tồn tại */
  showAssignModal(user: User): void {
    this.isAssignVisible = true;
    this.selectedUserId = user.id;
    this.selectedUser = user;

    this.permissionService.getPermissions().subscribe((allPerms) => {
      this.userService.getUserPermissions(user.id).subscribe((resp: UserPermissionsResponse) => {
        const userPermMap = new Map<number, boolean>();
        resp.permissions.forEach((p) => userPermMap.set(p.id, p.granted ?? false));

        const modules = [...new Set(allPerms.map((p) => p.module))];
        this.groupedPermissions = modules.map((module) => ({
          module,
          permissions: allPerms
            .filter((p) => p.module === module)
            .map((p) => ({ ...p, granted: userPermMap.get(p.id) ?? false })),
        }));

        this.cdr.detectChanges(); // bắt buộc cập nhật UI
      });
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
    this.isVisible = true;
    this.submitted = false;
    this.isEditMode = true;
    this.userId = user.id;

    this.userService.getUserById(user.id).subscribe({
      next: (res) => {
        console.log('Chi tiết user từ API:', res);

        this.newUser = {
          id: res.id,
          username: res.username,
          email: res.email,
          fullName: res.fullName,
          phoneNumber: res.phoneNumber,
          address: res.address,
          createdAt: res.createdAt,
          isActive: res.isActive,
          isDeleted: res.isDeleted,
          RoleName: res.roleName ?? [], // map từ roleName (BE) sang RoleName (FE)
          password: '********',
        };

        // Đánh dấu role được check
        this.roles = this.roles.map((r) => ({
          ...r,
          checked: (this.newUser.RoleName ?? []).includes(r.name),
        }));

        this.selectedNames = [...(this.newUser.RoleName ?? [])];

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi lấy user theo id:', err);
      },
    });
  }

  deleteUser(user: User): void {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc muốn xóa vai trò này?',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.msg.success('Đã xóa user');
            this.loadUsers();
          },
          error: (e) => console.error('Lỗi khi xóa user:', e),
        });
      },
      nzCancelText: 'Hủy',
      nzOnCancel: () => this.msg.info('Hủy xóa vai trò'),
    });
  }

  viewDetails(user: User): void {
    this.isViewDetailsVisible = true;
    this.selectedUser = user;
  }

  toggleLock(user: any) {
    const action = user.isActive ? 'khóa' : 'mở khóa';
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn ${action} người dùng này?`,
      nzOkText: action,
      nzOkType: 'primary',
      nzOkDanger: user.isActive, // chỉ cảnh báo đỏ khi khóa
      nzOnOk: () => {
        // Chọn API phù hợp
        const request$ = user.isActive
          ? this.userService.deactivateUser(user.id) // Lock user
          : this.userService.activateUser(user.id); // Unlock user

        request$.subscribe({
          next: (res: any) => {
            user.isActive = !user.isActive; // Cập nhật UI ngay
            this.msg.success(`Người dùng đã ${user.isActive ? 'mở khóa' : 'khóa'} thành công`);
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.msg.error(`Cập nhật trạng thái thất bại: ${err?.message || err}`);
            console.error(err);
          },
        });
      },
      nzCancelText: 'Hủy',
      nzOnCancel: () => this.msg.info(`Hủy ${action} người dùng`),
    });
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

  showChangePasswordModal(user: User): void {
    this.selectedUser = user;
    this.isChangePasswordVisible = true;
    this.changePassword = { newPassword: '' };
    this.confirmPassword = '';
  }

  handleOkChangePassword(): void {
    if (this.changePassword.newPassword !== this.confirmPassword) {
      this.msg.error('Mật khẩu xác nhận không khớp');
      return;
    }

    const userId = this.selectedUser!.id;
    this.userService
      .setPassword(userId, { newPassword: this.changePassword.newPassword })
      .subscribe({
        next: () => {
          this.msg.success('Đổi mật khẩu thành công');
          this.handleCancelChangePassword();
        },
        error: () => {},
      });
  }

  handleCancelChangePassword(): void {
    this.isChangePasswordVisible = false;
    this.changePassword = { newPassword: '' };
    this.confirmPassword = '';
    this.passwordVisible = false;
    this.confirmPasswordVisible = false;
    this.cdr.detectChanges();
  }

  applyFilter() {
    this.loading = true;
    const payload: any = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
    };

    Object.keys(this.filters).forEach((key) => {
      const value = this.filters[key];
      if (value !== undefined && value !== null && value.toString().trim() !== '') {
        payload[key] = value.toString().trim();
      }
    });

    this.userService.getUsersPagedWithFilter(payload).subscribe({
      next: (res) => {
        this.users = res.items;
        this.totalItems = res.totalItems;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi filter', err);
        this.loading = false;
      },
    });
  }

  resetFilter() {
    this.filters = {};
    this.applyFilter();
  }

  sortField: string | null = null;
  sortOrder: string | null = null;

  onSort(field: string, order: string | null): void {
    this.sortField = field;
    this.sortOrder = order;

    if (!order) {
      // Nếu bỏ sort -> load lại dữ liệu gốc
      this.loadUsers();
      return;
    }

    this.users = [...this.users].sort((a, b) => {
      let valueA = a[field as keyof User];
      let valueB = b[field as keyof User];

      // Nếu là ngày thì convert sang timestamp
      if (field === 'createdAt') {
        valueA = new Date(valueA as any).getTime();
        valueB = new Date(valueB as any).getTime();
      }

      if (valueA! < valueB!) return order === 'ascend' ? -1 : 1;
      if (valueA! > valueB!) return order === 'ascend' ? 1 : -1;
      return 0;
    });
  }
}
