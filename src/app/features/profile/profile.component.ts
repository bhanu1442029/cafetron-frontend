import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { APP_ROLES, UserProfile } from '../../models/auth.models';
import { CartService } from '../cart-order/services/cart.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: UserProfile | null = null;
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to load profile.';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  logout(): void {
    this.authService.logout();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }

  getInitials(): string {
    const name = this.profile?.name?.trim();
    if (!name) {
      return 'U';
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  getDisplayRole(role: string): string {
    const normalizedRole = String(role).replace(/^ROLE_/i, '').trim().toUpperCase();
    return normalizedRole === APP_ROLES.counter ? APP_ROLES.vendor : normalizedRole;
  }

  isVendorProfile(): boolean {
    return this.getDisplayRole(this.profile?.role || '') === APP_ROLES.vendor;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
