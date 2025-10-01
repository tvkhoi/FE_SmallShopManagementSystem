import { Routes } from '@angular/router';

// Admin
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Auditlog } from './features/admin/auditlog/auditlog';
import { UsersComponent } from './features/admin/users/users';
import { RolesComponent } from './features/admin/roles/roles';
import { Settings } from './features/admin/settings/settings';
import { AdminLayout } from './shared/layouts/admin-layout/admin-layout';

// Auth
import { LoginComponent } from './shared/components/login/login';
import { SignUpComponent } from './shared/components/sign-up/sign-up';
import { ForgotPassword } from './shared/components/forgot-password/forgot-password';
import { ResetPassword } from './shared/components/reset-password/reset-password';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

// Customer
import { CustomerLayoutComponent } from './shared/layouts/customer-layout/customer-layout';
import { HomeComponent } from './features/customer/home/home';
import { AboutComponent } from './features/customer/about/about';
import { ProductsComponent } from './features/customer/products/products';
import { ContactComponent } from './features/customer/contact/contact';
import { CartComponent } from './features/customer/cart/cart';
import { WishlistComponent } from './features/customer/wishlist/wishlist';


export const routes: Routes = [
  // CUSTOMER
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'cart', component: CartComponent },
      { path: 'wishlist', component: WishlistComponent },
    ]
  },

  // AUTH
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'sign-up', component: SignUpComponent, canActivate: [loginGuard] },
  { path: 'forgot-password', component: ForgotPassword, canActivate: [loginGuard] },
  { path: 'reset-password', component: ResetPassword, pathMatch: 'full' },
   
  // ADMIN
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'audit_log', component: Auditlog },
      { path: 'users', component: UsersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'settings', component: Settings },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // 404 fallback
  { path: '**', redirectTo: '' }
];
