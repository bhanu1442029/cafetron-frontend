import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { APP_ROLES } from '../../../models/auth.models';

type NavItem = {
  label: string;
  icon: string;
  link: string;
  exact?: boolean;
};

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="isVisible">
      <div class="bottom-nav-spacer" aria-hidden="true"></div>

      <nav class="bottom-nav" aria-label="Primary navigation">
        <a
          *ngFor="let item of navItems"
          [routerLink]="item.link"
          routerLinkActive="active"
          [routerLinkActiveOptions]="item.exact === false ? { exact: false } : { exact: true }"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </a>
      </nav>
    </ng-container>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .bottom-nav-spacer {
      height: calc(92px + env(safe-area-inset-bottom, 0px));
    }

    .bottom-nav {
      position: fixed;
      left: 50%;
      bottom: 12px;
      z-index: 80;
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(0, 1fr);
      gap: 8px;
      width: min(760px, calc(100vw - 20px));
      padding: 10px 10px calc(10px + env(safe-area-inset-bottom, 0px));
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 28px;
      background: rgba(17, 24, 32, 0.76);
      box-shadow: 0 22px 54px rgba(0, 0, 0, 0.28);
      -webkit-backdrop-filter: blur(24px) saturate(1.25);
      backdrop-filter: blur(24px) saturate(1.25);
      transform: translateX(-50%);
    }

    .bottom-nav a {
      display: grid;
      place-items: center;
      gap: 6px;
      min-width: 0;
      min-height: 58px;
      padding: 10px 8px;
      border-radius: 20px;
      color: rgba(255, 255, 255, 0.74);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-align: center;
      text-decoration: none;
      transition: transform 180ms ease, background 180ms ease, color 180ms ease;
    }

    .bottom-nav a:hover {
      transform: translateY(-2px);
      color: #fff;
    }

    .bottom-nav a.active {
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.96), rgba(251, 146, 60, 0.84));
      color: #fff;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 10px 24px rgba(249, 115, 22, 0.28);
    }

    .bottom-nav .material-symbols-outlined {
      font-size: 22px;
    }

    @media (max-width: 560px) {
      .bottom-nav {
        gap: 6px;
        padding-inline: 8px;
      }

      .bottom-nav a {
        min-height: 54px;
        padding-inline: 4px;
        font-size: 11px;
      }

      .bottom-nav .material-symbols-outlined {
        font-size: 20px;
      }
    }
  `],
})
export class BottomNavComponent implements OnInit, OnDestroy {
  isVisible = false;
  navItems: NavItem[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.refreshState(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.refreshState(event.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private refreshState(url: string): void {
    this.isVisible = this.authService.isLoggedIn() && !this.isAuthPage(url);
    this.navItems = this.isVisible ? this.getNavItemsForRole() : [];
  }

  private isAuthPage(url: string): boolean {
    return url === '/login' || url === '/register';
  }

  private getNavItemsForRole(): NavItem[] {
    const role = this.authService.getRole();

    switch (role) {
      case APP_ROLES.admin:
        return [
          { label: 'Dashboard', icon: 'dashboard', link: '/admin/dashboard' },
          { label: 'Operations', icon: 'tune', link: '/admin/operations' },
          { label: 'Vendors', icon: 'storefront', link: '/admin/vendors' },
          { label: 'Menu', icon: 'restaurant_menu', link: '/menu/manage' },
          { label: 'Profile', icon: 'account_circle', link: '/profile' },
        ];
      case APP_ROLES.vendor:
        return [
          { label: 'Orders', icon: 'room_service', link: '/vendor/orders' },
          { label: 'Manage', icon: 'edit_note', link: '/menu/manage' },
          { label: 'Scanner', icon: 'qr_code_scanner', link: '/vendor/scanner' },
          { label: 'Queue', icon: 'groups', link: '/vendor/queue' },
          { label: 'Profile', icon: 'account_circle', link: '/profile' },
        ];
      default:
        return [
          { label: 'Menu', icon: 'restaurant_menu', link: '/menu' },
          { label: 'Cart', icon: 'shopping_cart', link: '/cart' },
          { label: 'Orders', icon: 'receipt_long', link: '/orders', exact: false },
          { label: 'Wallet', icon: 'account_balance_wallet', link: '/wallet' },
          { label: 'Profile', icon: 'account_circle', link: '/profile' },
        ];
    }
  }
}
