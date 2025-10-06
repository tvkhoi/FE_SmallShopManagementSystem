import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
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
import {
  createPasswordPolicyValidator,
  getPendingPasswordRules,
  noWhitespaceValidator,
} from '../../../core/utils';
import { PasswordPolicyService } from '../../../core/services/passwordPolicy.service';
import { PasswordPolicy } from '../../../core/models/domain/PasswordPolicy';
import { passwordMatchValidator } from '../../../core/utils/passwordMatchValidator.utils';
import { Button } from '../../../shared/components/admin/button/button';
import { ActionDropdown } from '../../../shared/components/admin/action-dropdown/action-dropdown';
import { ConfirmDialog } from '../../../shared/components/admin/confirm-dialog/confirm-dialog';

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
    ReactiveFormsModule,
    Button,
    ActionDropdown,
    ConfirmDialog,
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
  private readonly fb = inject(FormBuilder);
  private readonly policyService = inject(PasswordPolicyService);

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
  selectedUser!: User | null;

  isDeleteModalVisible: boolean = false;
  

  // Permissions
  groupedPermissions: { module: string; permissions: Permission[] }[] = [];
  treeData: TreeNode[] = [];
  allChecked = false;

  // Role
  roles: Role[] = [];
  selectedNames: string[] = [];

  userForm!: FormGroup;
  policy!: PasswordPolicy;
  pendingRules: string[] = [];

  ngOnInit(): void {
    this.userForm = this.fb.group(
      {
        username: ['', [Validators.required, noWhitespaceValidator]],
        email: ['', [Validators.required, Validators.email]],
        fullName: [''],
        address: [''],
        phoneNumber: ['', [Validators.pattern(/^0[0-9]{9}$/)]],
        password: ['', [Validators.required, noWhitespaceValidator]],
        confirmPassword: ['', [Validators.required]],
        isActive: [true],
      },
      { validators: passwordMatchValidator }
    );
    this.policyService.getPolicy().subscribe({
      next: (res) => {
        this.policy = res;

        const passwordCtrl = this.userForm.get('password');
        if (passwordCtrl) {
          passwordCtrl.addValidators(createPasswordPolicyValidator(this.policy));
          passwordCtrl.updateValueAndValidity();
        }

        passwordCtrl?.valueChanges.subscribe((value) => {
          this.pendingRules = getPendingPasswordRules(value || '', this.policy).map((r) => r.label);
        });
      },
      error: () => console.error('Không thể lấy chính sách mật khẩu'),
    });

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
    this.userForm.get('username')?.enable();
    this.userForm.get('email')?.enable();
    this.userForm.get('password')?.enable();
    this.userForm.get('confirmPassword')?.enable();

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

    this.roles = this.roles.map((r) => ({ ...r, checked: false }));
    this.selectedNames = [];
  }

  handleCancel(): void {
    this.isVisible = false;
    this.submitted = false;
    this.isEditMode = false;
    this.userForm.reset();
  }

  handleOk(): void {
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

    if (this.isEditMode === true) {
      this.userForm.get('username')?.disable();
      this.userForm.get('email')?.disable();
      this.userForm.get('password')?.disable();
      this.userForm.get('confirmPassword')?.disable();
    }

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
    this.selectedUser = user;
    this.openDeleteModal();
  }

  openDeleteModal(): void {
    this.isDeleteModalVisible = true;
  }

  handleConfirmDelete(): void {
    this.userService.deleteUser(this.selectedUser!.id).subscribe({
      next: () => {
        this.msg.success('Đã xóa user');
        this.loadUsers();
      },
      error: (err) => this.msg.error('Lỗi khi xóa user'),
    });
  }

  handleCancelDelete(): void {
    this.msg.info('Đã hủy xóa');
  }

  viewDetails(user: User): void {
    this.isViewDetailsVisible = true;
    this.selectedUser = user;
  }

  toggleLock(user: any) {
    this.selectedUser = user;
    this.isDeleteModalVisible = true;
  }
  handleConfirmLock(): void {
    if (!this.selectedUser) return;
    const request$ = this.selectedUser.isActive
      ? this.userService.deactivateUser(this.selectedUser.id) // Lock user
      : this.userService.activateUser(this.selectedUser.id); // Unlock user

    request$.subscribe({
      next: (res: any) => {
        this.selectedUser!.isActive = !this.selectedUser!.isActive; // Cập nhật UI ngay
        this.msg.success(`Người dùng đã ${this.selectedUser!.isActive ? 'mở khóa' : 'khóa'} thành công`);
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
          },
        });
    this.isDeleteModalVisible = false;
  }
  handleCancelLock(): void {
    this.isDeleteModalVisible = false;
    this.msg.info('Đã hủy');
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
    this.userForm.get('username')?.disable();
    this.userForm.get('email')?.disable();
    this.userForm.get('password')?.enable();
    this.userForm.get('confirmPassword')?.enable();
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
  handleUserAction(event: { action: string; data: any }) {
    switch (event.action) {
      case 'viewDetails':
        this.viewDetails(event.data);
        break;
      case 'editUser':
        this.editUser(event.data);
        break;
      case 'assignUser':
        this.showAssignModal(event.data);
        break;
      case 'deleteUser':
        this.deleteUser(event.data);
        break;
      case 'changePassword':
        this.showChangePasswordModal(event.data);
        break;
      case 'toggleLock':
        this.toggleLock(event.data);
        break;
    }
  }
}
