import { AuthService } from './../../../auth/auth.service';
import { Router, RouterModule } from "@angular/router";
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
    NzButtonModule,
    RouterModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  ngOnInit() {
    // Tạo form reactive
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid) {
      console.warn('Vui lòng nhập email và mật khẩu');
      return;
    }

    this.isLoading = true;
    this.userService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.userService.changeData(res);
        console.log('Đăng nhập thành công:', res);
        if (res.token) {
          this.authService.saveToken(res.token);
          this.authService.redirectByRole();
        }
        this.isLoading = false;  
      },
      error: (err) => {
        console.error('Đăng nhập thất bại:', err);
        this.isLoading = false;
      }
    });
  }
}
