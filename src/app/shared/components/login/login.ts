import { AuthService } from './../../../auth/auth.service';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  imports: [
    NzIconModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    RouterModule,
    CommonModule,
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly message = inject(NzMessageService);

  passwordVisible = false;

  ngOnInit() {
    // Tạo form reactive
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.isLoading) return;
    if (this.loginForm.invalid) {
      this.message.warning('Vui lòng nhập email và mật khẩu');
      return;
    }

    this.isLoading = true;
    this.userService
      .login(this.loginForm.value)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 2000);
        })
      )
      .subscribe({
        next: (res) => {
          console.log('Đăng nhập thành công, response:', res);

          if (res.token && res.refreshToken) {
            this.authService.saveTokens(res.token, res.refreshToken);
            this.authService.redirectByRole();
            this.message.success('Đăng nhập thành công');
          } else {
            this.message.error('Không tìm thấy token trong phản hồi');
          }
        },
        error: (err) => {
          console.error('Đăng nhập thất bại:', err);
        },
      });
  }

  onToggleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.passwordVisible = !this.passwordVisible;
    }
  }
}
