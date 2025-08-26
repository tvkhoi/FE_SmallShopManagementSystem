import { Dashboard } from './features/admin/dashboard/dashboard';
import { Routes } from '@angular/router';
import { LoginComponent } from './shared/components/login/login';
import { SignUpComponent } from './shared/components/sign-up/sign-up';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'sign-up', component: SignUpComponent, canActivate: [loginGuard] },
  { path: 'admin/dashboard', component: Dashboard, canActivate: [authGuard] , data: {roles: ['Admin']}}

];
