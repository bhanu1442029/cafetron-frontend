import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuService } from '../menu.service';
import { MenuItem } from '../menu.models';
import { Subject } from 'rxjs';
import { takeUntil, timeout } from 'rxjs/operators';
import { CartItem, CartService } from '../../cart-order/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { APP_ROLES } from 'src/app/models/auth.models';

@Component({
  selector: 'app-menu-browse',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-browse.component.html',
  styleUrl: './menu-browse.component.css',
})
export class MenuBrowseComponent implements OnInit, OnDestroy {

  items: MenuItem[] = [];
  activeFilter = 'ALL';
  isLoading = true;
  errorMessage = '';
  cartMessage = '';
  cartItems: CartItem[] = [];
  cartItemCount = 0;
  cartTotal = 0;
  isCartOpen = false;
  userName = '';

  private cartMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private menuService: MenuService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName() || 'Profile';
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.cartItems = items;
        this.cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartTotal = this.cartService.getTotalForItems(items);
        this.cdr.detectChanges();
      });

    this.loadToday();
  }

    isVendorUser(): boolean {
      return this.authService.hasRole(APP_ROLES.vendor);
    }
  
  addToCart(item: MenuItem): void {
    if (!item.isAvailable) {
      this.showCartMessage(`${item.itemName} is currently unavailable.`);
      return;
    }

    if (item.stock <= 0) {
      this.showCartMessage(`${item.itemName} is out of stock.`);
      return;
    }

    this.cartService.addItem(item, 1);
    this.isCartOpen = true;
    this.showCartMessage(`${item.itemName} added to cart.`);
  }

  openCart(): void {
    this.cartItems = this.cartService.getSnapshot();
    this.cartItemCount = this.cartService.getItemCount();
    this.cartTotal = this.cartService.getTotal();
    this.isCartOpen = true;
  }

  closeCart(): void {
    this.isCartOpen = false;
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.menuItemId, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      this.cartService.removeItem(item.menuItemId);
      return;
    }

    this.cartService.updateQuantity(item.menuItemId, item.quantity - 1);
  }

  removeFromCart(item: CartItem): void {
    this.cartService.removeItem(item.menuItemId);
  }

  goToCheckout(): void {
    if (this.cartItemCount === 0) {
      return;
    }

    this.router.navigate(['/checkout']);
  }

  logout(): void {
    this.authService.logout();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }

  loadToday(): void {
    this.activeFilter = 'ALL';
    this.isLoading = true;
    this.errorMessage = '';

    this.menuService
      .getTodaysMenu()
      .pipe(
        timeout(10000),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.items = this.normalizeItems(data);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading menu:', error);
          this.items = [];
          this.errorMessage =
            error.name === 'TimeoutError'
              ? 'Menu took too long to load. Please check that the backend is running.'
              : error.error?.message || 'Failed to load menu. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.isLoading = true;
    this.errorMessage = '';

    if (term.trim()) {
      this.menuService
        .search(term)
        .pipe(
          timeout(10000),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (data) => {
            this.items = this.normalizeItems(data);
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Search error:', error);
            this.items = [];
            this.errorMessage = 'Failed to search menu items.';
            this.isLoading = false;
            this.cdr.detectChanges();
          },
        });
    } else {
      this.loadToday();
    }
  }

  applyFilter(type: string): void {
    this.activeFilter = type;
    this.isLoading = true;
    this.errorMessage = '';

    if (type === 'ALL') {
      this.loadToday();
    } else {
      this.menuService
        .filterByFoodType(type)
        .pipe(
          timeout(10000),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (data) => {
            this.items = this.normalizeItems(data);
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Filter error:', error);
            this.items = [];
            this.errorMessage = `Failed to filter by ${type}.`;
            this.isLoading = false;
            this.cdr.detectChanges();
          },
        });
    }
  }

  private normalizeItems(data: unknown): MenuItem[] {
    if (Array.isArray(data)) {
      return data;
    }

    const payload = data as { items?: MenuItem[]; data?: MenuItem[]; content?: MenuItem[] } | null;
    return payload?.items ?? payload?.data ?? payload?.content ?? [];
  }

  trackByItemId(index: number, item: MenuItem): number {
    return item.id;
  }

  private showCartMessage(message: string): void {
    this.cartMessage = message;
    this.cdr.detectChanges();

    if (this.cartMessageTimeout) {
      clearTimeout(this.cartMessageTimeout);
    }

    this.cartMessageTimeout = setTimeout(() => {
      this.cartMessage = '';
      this.cdr.detectChanges();
      this.cartMessageTimeout = null;
    }, 2200);
  }

  ngOnDestroy(): void {
    if (this.cartMessageTimeout) {
      clearTimeout(this.cartMessageTimeout);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}

