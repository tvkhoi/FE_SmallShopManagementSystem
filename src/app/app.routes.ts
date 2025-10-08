import { Routes } from '@angular/router';
import { LoginComponent } from './shared/components/login/login';
import { SignUpComponent } from './shared/components/sign-up/sign-up';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { AdminLayout } from './shared/layouts/admin-layout/admin-layout';
import { Auditlog } from './features/admin/auditlog/auditlog';
import { UsersComponent } from './features/admin/users/users';
import { RolesComponent } from './features/admin/roles/roles';
import { ForgotPassword } from './shared/components/forgot-password/forgot-password';
import { ResetPassword } from './shared/components/reset-password/reset-password';
import { Settings } from './features/admin/settings/settings';
import { Account } from './features/admin/account/account';
import { PERMISSIONS } from './core/constants/permission.constant';
import { Forbidden } from './shared/components/forbidden/forbidden';
import { PERMISSION_GROUPS } from './core/constants/permission-groups';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'sign-up', component: SignUpComponent, canActivate: [loginGuard] },
  { path: 'forgot-password', component: ForgotPassword, canActivate: [loginGuard] },
  { path: 'reset-password', component: ResetPassword, pathMatch: 'full' },
  { path: 'forbidden', component: Forbidden },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    data: {
      permissions: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.ROLES_VIEW,
        ...PERMISSION_GROUPS.ADMIN
      ],
    },
    children: [
      {
        path: 'audit_log',
        component: Auditlog,
        canActivate: [authGuard],
        data: { permissions: [...PERMISSION_GROUPS.ADMIN] },
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [authGuard],
        data: { permissions: [PERMISSIONS.USERS_VIEW] },
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [authGuard],
        data: { permissions: [PERMISSIONS.ROLES_VIEW] },
      },
      {
        path: 'settings',
        component: Settings,
        canActivate: [authGuard],
        data: { permissions: [PERMISSIONS.PERMISSIONS_VIEW] },
      },
      {
        path: 'account',
        component: Account,
        canActivate: [authGuard],
        data: { permissions: [PERMISSIONS.USERS_VIEW] },
      },
      { path: '', redirectTo: 'users', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'forbidden' },
];
