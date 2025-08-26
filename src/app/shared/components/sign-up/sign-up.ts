import { Router } from '@angular/router';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import {NzAvatarModule }from 'ng-zorro-antd/avatar';
import { UserService } from '../../../core/services/user.service';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-sign-up',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.scss'],
  imports: [
    ReactiveFormsModule,
    NzCardModule,
    NzAvatarModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    RouterModule
  ],
  standalone: true
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  isLoading = false;
  private fb: FormBuilder = inject(FormBuilder);
  private userService: UserService = inject(UserService);
  private router: Router = inject(Router);

  ngOnInit(): void {
    this.signUpForm = this.fb.group(
      {
        username: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        c_password: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // custom validator: check password trùng nhau
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('c_password')?.value;
    return password === confirm ? null : { notSame: true };
  }

  signUp(): void {
    if (this.signUpForm.invalid) {
      Object.values(this.signUpForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isLoading = true;
  const { username, email, password } = this.signUpForm.value;

  this.userService.signUp({ username, email, password })
    .pipe(finalize(() => (this.isLoading = false)))
    .subscribe({
      next: (res: any) => {
        console.log('Đăng ký thành công:', res);
        // sau khi đăng ký thành công => điều hướng sang login
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Đăng ký thất bại:', err);
      }
    });
  }

  
}
