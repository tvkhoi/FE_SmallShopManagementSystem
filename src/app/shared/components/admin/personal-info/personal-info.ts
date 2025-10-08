import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { NzFormItemComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzColDirective, NzGridModule } from 'ng-zorro-antd/grid';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/domain/user';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Button } from "../button/button";
import { PERMISSIONS } from '../../../../core/constants/permission.constant';

@Component({
  selector: 'app-personal-info',
  imports: [
    CommonModule,
    NzFormItemComponent,
    NzColDirective,
    NzGridModule,
    NzFormModule,
    FormsModule,
    NzInputModule,
    NzButtonModule,
    ReactiveFormsModule,
    Button
],
  templateUrl: './personal-info.html',
  styleUrls: ['./personal-info.scss'],
  standalone: true,
})
export class PersonalInfo implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly cdj = inject(ChangeDetectorRef);
  private readonly msg = inject(NzMessageService);
  private readonly auth = inject(AuthService);

  formUser!: FormGroup;
  userData: User | null = null;
  readonly PERMISSIONS = PERMISSIONS;

  ngOnInit(): void {
    this.formUser = this.fb.group({
      fullname: [''],
      phoneNumber: ['', [Validators.pattern(/^0\d{9}$/)]],
      username: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      address: [''],
    });

    if(this.auth.hasPermission(PERMISSIONS.USERS_VIEW)) {
      this.loadUserData();
    }
    else {
      console.warn('Không có quyền xem người dùng (USERS_VIEW)');
    }
  }

  private loadUserData() {
    this.userService.getUserById(parseInt(this.authService.getId()!)).subscribe({
      next: (user) => {
        this.userData = user;
        if (this.formUser) {
          this.formUser.patchValue({
            fullname: user.fullName,
            phoneNumber: user.phoneNumber,
            username: user.username,
            email: user.email,
            address: user.address,
          });
        }
      },
    });
  }

  onSubmit() {
    if (this.formUser?.valid && this.userData) {
      const updatedUser: User = {
        ...this.userData,
        fullName: this.formUser.value.fullname,
        phoneNumber: this.formUser.value.phoneNumber,
        address: this.formUser.value.address,
      };
      this.userService.updateUser(parseInt(this.authService.getId()!), updatedUser).subscribe({
        next: (user) => {
          this.userData = user;
          this.cdj.detectChanges();
          this.msg.success('Cập nhật thông tin cá nhân thành công!');
        },
        error: (err) => console.log('Cập nhật thất bại', err),
      });
    }
  }
}
