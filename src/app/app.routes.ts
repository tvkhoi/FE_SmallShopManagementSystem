import { Dashboard } from './features/admin/dashboard/dashboard';
import { Routes } from '@angular/router';
import { LoginComponent } from './shared/components/login/login';
import { SignUpComponent } from './shared/components/sign-up/sign-up';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { AdminLayout } from './shared/layouts/admin-layout/admin-layout';
import { Auditlog } from './features/admin/auditlog/auditlog';
import { UsersComponent } from './features/admin/users/users';
import {RolesComponent } from './features/admin/roles/roles';
import { ForgotPassword } from './shared/components/forgot-password/forgot-password';
import { ResetPassword } from './shared/components/reset-password/reset-password';
import { Settings } from './features/admin/settings/settings';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'sign-up', component: SignUpComponent, canActivate: [loginGuard] },
  { path: 'forgot-password', component: ForgotPassword, canActivate: [loginGuard] },
  { path: 'reset-password', component: ResetPassword, pathMatch: 'full' },
  { path: 'admin',
          component: AdminLayout,
          canActivate: [authGuard] ,
          data: {roles: ['Admin']},
          children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'audit_log', component: Auditlog },
            { path: 'users', component: UsersComponent },
            { path: 'roles', component: RolesComponent },
            {path: 'settings', component: Settings},
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
          ]
}

];
