import { Routes } from '@angular/router';

// Admin
import { Auditlog } from './features/admin/auditlog/auditlog';
import { UsersComponent } from './features/admin/users/users';
import { RolesComponent } from './features/admin/roles/roles';

import { Settings } from './features/admin/settings/settings';
import { AdminLayout } from './shared/layouts/admin-layout/admin-layout';
import { Account } from './features/admin/account/account';
import { PERMISSIONS } from './core/constants/permission.constant';
import { PERMISSION_GROUPS } from './core/constants/permission-groups';
import { Forbidden } from './shared/components/forbidden/forbidden';

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
import { ProductItemComponent } from './features/customer/product-item/product-item';
import { SellerLayout } from './shared/layouts/seller-layout/seller-layout';
import { Dashboard } from './features/seller/dashboard/dashboard';
import { Products } from './features/seller/products/products';



export const routes: Routes = [
  // CUSTOMER - Public routes (no auth required)
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'productItem', component: ProductItemComponent }
    ]
  },

  // CUSTOMER - Protected routes (auth required)
  {
    path: 'customer',
    component: CustomerLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['Customer'] },
    children: [
      { path: 'cart', component: CartComponent },
      { path: 'wishlist', component: WishlistComponent }
    ]
  },

  // SELLER - Protected routes (auth required)
  {
    path: 'seller',
    component: SellerLayout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'products', component: Products }
    ]
  },

  // AUTH
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
        ...PERMISSION_GROUPS.ADMIN
      ],
    },
    children: [
      {
        path: 'audit_log',
        component: Auditlog,
        canActivate: [authGuard],
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [authGuard],
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [authGuard],
      },
      {
        path: 'settings',
        component: Settings,
        canActivate: [authGuard],
      },
      {
        path: 'account',
        component: Account,
        canActivate: [authGuard],
      },
      { path: '', redirectTo: 'users', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: '' },
];
