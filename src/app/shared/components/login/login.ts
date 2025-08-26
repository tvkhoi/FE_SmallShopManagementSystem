import { Router } from "@angular/router";
import { Component, inject, OnInit } from "@angular/core";
import { UserService } from "../../../core/services/user.service";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";

@Component({
  selector: "app-login",
  templateUrl: "./login.html",
  styleUrls: ["./login.scss"],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  ngOnInit() {
    // Tạo form reactive
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid) {
      console.warn('Vui lòng nhập tên người dùng và mật khẩu');
      return;
    }

    this.isLoading = true;
    this.userService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.userService.changeData(res);
        console.log('Đăng nhập thành công:', res);
        if (res.token) {
          localStorage.setItem('authToken', res.token);
        }
        this.isLoading = false;
        this.router.navigate(['/dashboard']); // điều hướng sau login   
      },
      error: (err) => {
        console.error('Đăng nhập thất bại:', err);
        this.isLoading = false;
      }
    });
  }

  goToSignUp() {
    this.router.navigate(['/sign-up']);
  }

  goToForgetPassword() {
    this.router.navigate(['/forget-password']);
  }
}
