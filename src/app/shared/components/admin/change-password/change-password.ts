import { PasswordPolicyService } from './../../../../core/services/passwordPolicy.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { UserService } from '../../../../core/services/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  createPasswordPolicyValidator,
  getPendingPasswordRules,
  noWhitespaceValidator,
} from '../../../../core/utils';
import { PasswordPolicy } from '../../../../core/models/domain/PasswordPolicy';
import { passwordMatchValidator } from '../../../../core/utils/passwordMatchValidator.utils';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, NzFormModule, ReactiveFormsModule, NzInputModule, NzButtonModule, NzIconModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.scss'],
  standalone: true,
})
export class ChangePassword implements OnInit {
  private readonly userService = inject(UserService);
  private readonly policyServices = inject(PasswordPolicyService);
  private readonly autheService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly cdj = inject(ChangeDetectorRef);
  private readonly msg = inject(NzMessageService);

  pendingRules: string[] = [];
  policy!: PasswordPolicy;
  formChangePassword?: FormGroup;

  passwordVisible = false;
  currentPasswordVisible = false;
  confirmPasswordVisible = false;

  ngOnInit(): void {
    this.formChangePassword = this.fb.group(
      {
        currentPassword: ['', [Validators.required, noWhitespaceValidator]],
        password: ['', [Validators.required, noWhitespaceValidator]],
        confirmPassword: ['', [Validators.required, noWhitespaceValidator]],
      },
      { validators: passwordMatchValidator }
    );
    this.policyServices.getPolicy().subscribe({
      next: (res) => {
        this.policy = res;

        const passwordCtrl = this.formChangePassword?.get('password');
        if (passwordCtrl) {
          passwordCtrl.addValidators(createPasswordPolicyValidator(res));
          passwordCtrl.updateValueAndValidity();
          passwordCtrl.valueChanges.subscribe((value) => {
            this.pendingRules = getPendingPasswordRules(value, res).map((r) => r.label);
            this.cdj.markForCheck();
          });
        }
      },
    });
  }
  onSubmit() {
    if (this.formChangePassword?.valid) {
      const currentPassword = this.formChangePassword.get('currentPassword')?.value;
      const newPassword = this.formChangePassword.get('password')?.value;
      this.userService.setPassword(parseInt(this.autheService.getId()!), { currentPassword, newPassword }).subscribe({
        next: () => {
          this.formChangePassword?.reset();
          this.pendingRules = [];
          this.cdj.markForCheck();
          this.msg.success('Đổi mật khẩu thành công!');
          this.autheService.logout();
        },
        error: (err) => console.log('Đổi mật khẩu thất bại', err)
      });
    }
  }
}
