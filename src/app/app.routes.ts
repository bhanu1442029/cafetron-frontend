import { Component } from '@angular/core';
import { Route, Routes } from '@angular/router';

// Cart-Order Components
import { CheckoutComponent } from './features/cart-order/checkout/checkout.component';
import { OrderHistoryComponent } from './features/cart-order/order-history/order-history.component';
import { OrderDetailComponent } from './features/cart-order/order-history/order-detail/order-detail.component';
import { MenuBrowseComponent } from './features/menu/menu-browse/menu-browse.component';

// Menu Management Components
import { MenuManageComponent } from './features/menu/menu-manage/menu-manage.component';
import { OrderQRDisplayComponent } from './features/order-qr/order-qr-display/order-qr-display.component';
import { OrderQrScannerComponent } from './features/order-qr/order-qr-scanner/order-qr-scanner.component';
import { OrderQRUploadComponent } from './features/order-qr/order-qr-upload/order-qr-upload.component';
import { WalletComponent } from './features/wallet/wallet.component';

// Vendor Management Components
import { VendorManageComponent } from './features/vendor/vendor-manage/vendor-manage.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { APP_ROLES } from './models/auth.models';

// import { APP_ROLES, AppRole, roleGuard } from './core/guards/role.guard';
// import { authGuard } from './core/guards/auth.guard';

@Component({
  standalone: true,
  template: `
    <main class="pending-page">
      <section class="pending-card">
        <p class="eyebrow">Cafetron Module</p>
        <h1>Experience in progress</h1>
        <p>
          This route is wired into the app shell and is ready for the feature component.
          The full screen will appear here once the module implementation lands.
        </p>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .pending-page {
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 24px;
    }

    .pending-card {
      width: min(560px, 100%);
      padding: 34px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: rgba(255, 255, 255, 0.95);
      box-shadow: var(--shadow-md);
      animation: fadeUp 360ms ease both;
    }

    .eyebrow {
      margin: 0 0 10px;
      color: var(--primary);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      color: var(--text);
      font-size: clamp(32px, 6vw, 54px);
      line-height: 1;
    }

    p:last-child {
      margin: 14px 0 0;
      color: var(--muted);
      line-height: 1.65;
    }
  `],
})
class PendingFeatureRouteComponent {}

type FeatureRouteOptions = {
  path: string;
  title: string;
  componentPath: string;
  roles?: string[];
};

const featureRoute = ({
  path,
  title,
  componentPath,
  roles,
}: FeatureRouteOptions): Route => ({
  path,
  title,
  canActivate: roles?.length ? [authGuard, roleGuard] : [authGuard],
  component: PendingFeatureRouteComponent,
  data: {
    componentPath,
    roles,
  },
});

const MENU_ROLES = [APP_ROLES.admin, APP_ROLES.employee, APP_ROLES.vendor];
const EMPLOYEE_ORDER_ROLES = [APP_ROLES.admin, APP_ROLES.employee];
const MENU_MANAGE_ROLES = [APP_ROLES.admin, APP_ROLES.vendor];
const VENDOR_STAFF_ROLES = [APP_ROLES.admin, APP_ROLES.vendor];
const ADMIN_ROLES = [APP_ROLES.admin];
const VENDOR_ROLES = [APP_ROLES.admin, APP_ROLES.vendor];

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',        // ← changed from 'menu' to 'login'
  },

  // ── YOUR ROUTES (auth) ──────────────────────────────────────────
  {
    path: 'login',
    title: 'Login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.LoginComponent),
  },
  {
    path: 'register',
    title: 'Register',
    loadComponent: () =>
      import('./features/auth/register/register')
        .then(m => m.RegisterComponent),
  },

  // ── TEAMMATES' ROUTES (unchanged, just added authGuard) ─────────
  {
    path: 'menu',
    title: 'Menu',
    canActivate: [authGuard, roleGuard],
    data: { roles: MENU_ROLES },
    component: MenuBrowseComponent,
  },
  {
    path: 'menu/manage',
    title: 'Manage Menu',
    canActivate: [authGuard, roleGuard],
    data: { roles: MENU_MANAGE_ROLES },
    component: MenuManageComponent,
  },
  {
    path: 'cart',
    title: 'Cart',
    canActivate: [authGuard, roleGuard],
    data: { roles: EMPLOYEE_ORDER_ROLES },
    loadComponent: () =>
      import('./features/cart-order/cart/cart.component')
        .then(m => m.CartComponent),
  },
  {
    path: 'profile',
    title: 'Profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component')
        .then(m => m.ProfileComponent),
  },
  {
    path: 'checkout',
    title: 'Checkout',
    canActivate: [authGuard, roleGuard],
    data: { roles: EMPLOYEE_ORDER_ROLES },
    component: CheckoutComponent,
  },
  {
    path: 'orders',
    title: 'Order History',
    canActivate: [authGuard, roleGuard],
    data: { roles: EMPLOYEE_ORDER_ROLES },
    component: OrderHistoryComponent,
  },
  {
    path: 'orders/:orderId',
    title: 'Order Detail',
    canActivate: [authGuard, roleGuard],
    data: { roles: EMPLOYEE_ORDER_ROLES },
    component: OrderDetailComponent,
  },
  {
    path: 'wallet',
    title: 'Wallet',
    canActivate: [authGuard, roleGuard],
    data: { roles: EMPLOYEE_ORDER_ROLES },
    component: WalletComponent,
  },
  {
    path: 'pickup',
    title: 'Scan Pickup QR',
    canActivate: [authGuard, roleGuard],
    data: { roles: VENDOR_STAFF_ROLES },
    component: OrderQrScannerComponent,
  },
  {
    path: 'pickup/scan',
    title: 'Scan Pickup QR',
    canActivate: [authGuard, roleGuard],
    data: { roles: VENDOR_STAFF_ROLES },
    component: OrderQrScannerComponent,
  },
  {
    path: 'pickup/upload',
    title: 'Upload Pickup QR',
    canActivate: [authGuard, roleGuard],
    data: { roles: VENDOR_STAFF_ROLES },
    component: OrderQRUploadComponent,
  },
  {
    path: 'pickup/qr/:orderId',
    title: 'Pickup QR',
    canActivate: [authGuard, roleGuard],
    data: { roles: EMPLOYEE_ORDER_ROLES },
    component: OrderQRDisplayComponent,
  },
  {
    path: 'counter',
    redirectTo: 'vendor/scanner',
    pathMatch: 'full',
  },
  {
    path: 'counter/scanner',
    redirectTo: 'vendor/scanner',
  },
  {
    path: 'counter/queue',
    redirectTo: 'vendor/queue',
  },
  {
    path: 'vendor/scanner',
    title: 'Vendor Scanner',
    canActivate: [authGuard, roleGuard],
    data: { roles: VENDOR_STAFF_ROLES },
    component: OrderQrScannerComponent,
  },
  featureRoute({
    path: 'vendor/queue',
    title: 'Vendor Queue',
    componentPath: 'features/pickup-scanner/queue/queue.component',
    roles: VENDOR_STAFF_ROLES,
  }),
  {
    path: 'admin',
    title: 'Admin Dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ADMIN_ROLES },
    loadComponent: () =>
    import('./features/admin/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
  },
  {
    path: 'admin/dashboard',
    title: 'Admin Dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ADMIN_ROLES },
    loadComponent: () =>
    import('./features/admin/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
    // roles: [APP_ROLES.admin],
    // componentPath: 'features/admin/dashboard/dashboard.component',
  },
  {
    path: 'admin/operations',
    title: 'Operations',
    canActivate: [authGuard, roleGuard],
    data: { roles: ADMIN_ROLES },
    loadComponent: () =>
    import('./features/admin/operations/operations.component')
      .then(m => m.OperationsComponent)
    // roles: [APP_ROLES.admin],
    // componentPath: 'features/admin/operations/operations.component',
  },
  {
    path: 'admin/vendors',
    title: 'Manage Vendors',
    canActivate: [authGuard, roleGuard],
    data: { roles: ADMIN_ROLES },
    component: VendorManageComponent,
  },
  {
    path: 'vendor/orders',
    title: 'Vendor Orders',
    canActivate: [authGuard, roleGuard],
    data: { roles: VENDOR_ROLES },
    loadComponent: () =>
      import('./features/vendor/vendor-orders/vendor-orders.component')
        .then(m => m.VendorOrdersComponent),
  },
  {
    path: '**',
    redirectTo: 'login',        // ← changed from 'menu' to 'login'
  },
];
