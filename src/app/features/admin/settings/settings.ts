import { PERMISSIONS } from './../../../core/constants/permission.constant';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { PasswordPolicy } from '../../../core/models/domain/PasswordPolicy';
import { PasswordPolicyService } from '../../../core/services/passwordPolicy.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Button } from "../../../shared/components/admin/button/button";
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCheckboxModule,
    NzButtonModule,
    NzInputModule,
    Button
],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
})
export class Settings implements OnInit {
  policy: PasswordPolicy = {
    requiredLength: 0,
    requireUppercase: false,
    requireLowercase: false,
    requireDigit: false,
    requireNonAlphanumeric: false,
  };

  private readonly passwordPolicyService = inject(PasswordPolicyService);
  private readonly ms = inject(NzMessageService);
  private readonly cdj = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);
  readonly PERMISSIONS = PERMISSIONS;

  ngOnInit(): void {
    if (this.auth.hasPermission(PERMISSIONS.PASSWORDPOLICY_VIEW)) {
      this.passwordPolicyService.getPolicy().subscribe((data) => {
        this.policy = data;
        this.cdj.detectChanges();
      });
    }
    else {
      console.log('Bạn không có quyền xem chính sách mật khẩu');
    }
  }

  savePolicy() {
    this.passwordPolicyService.updatePolicy(this.policy).subscribe({
      next: (res) => {
        this.ms.success('Lưu policy thành công');
        this.cdj.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi lưu policy', err);
      },
    });
  }
}
