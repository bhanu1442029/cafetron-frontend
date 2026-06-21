import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrderApiService } from '../services/order-api.service';
import { PlaceOrderRequest } from '../models/order.models';
import { CartItem, CartService } from '../services/cart.service';
import { WalletService } from '../../wallet/wallet.service';

type PickupWindow = {
  id: string;
  label: string;
  start: string;
  end: string;
  caption: string;
};

@Component({
  selector: 'checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  selectedPickupSlot = '';
  pickupLocation = 'Cafetron cafeteria counter';
  totalAmount = 0;
  walletBalance: number | null = null;
  isLoading = false;
  isWalletLoading = false;
  errorMessage = '';
  toastMessage = '';
  toastType: 'error' | 'success' = 'error';
  checkoutView: 'cards' | 'overview' = 'cards';
  activeStep = 0;

  readonly pickupSlots: PickupWindow[] = [
    { id: 'morning', label: 'Morning', start: '08:30', end: '09:00', caption: '8:30 AM - 9:00 AM' },
    { id: 'afternoon', label: 'Afternoon', start: '12:00', end: '14:00', caption: '12:00 PM - 2:00 PM' },
    { id: 'evening', label: 'Evening', start: '16:00', end: '18:00', caption: '4:00 PM - 6:00 PM' },
    { id: 'dinner', label: 'Dinner', start: '20:00', end: '22:00', caption: '8:00 PM - 10:00 PM' },
  ];

  checkoutSteps = [
    { label: 'Pickup window', icon: 'schedule' },
    { label: 'Preview food', icon: 'restaurant' },
    { label: 'Payment', icon: 'payments' },
    { label: 'Place order', icon: 'receipt_long' },
  ];

  private destroy$ = new Subject<void>();
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private slotAvailabilityTimerId: ReturnType<typeof setInterval> | null = null;
  private readonly locationStorageKey = 'cafetron_pickup_location';

  constructor(
    private orderApi: OrderApiService,
    private cartService: CartService,
    private walletService: WalletService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.pickupLocation = localStorage.getItem(this.locationStorageKey)?.trim() || this.pickupLocation;

    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.cartItems = items;
        this.calculateTotal();
      });

    this.loadWalletBalance();
    this.slotAvailabilityTimerId = setInterval(() => {
      if (this.selectedPickupSlot && !this.hasValidPickupSlotSelected()) {
        this.selectedPickupSlot = '';
        this.showToast('Selected pickup window has ended. Please choose another available window.', 'error');
      }
    }, 30000);
  }

  getWalletLabel(): string {
    if (this.isWalletLoading) {
      return 'Loading...';
    }

    return this.walletBalance === null
      ? 'Unavailable'
      : `₹${this.walletBalance.toFixed(2)}`;
  }

  getLineTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  getCartInitial(item: CartItem): string {
    return item.itemName?.trim().charAt(0).toUpperCase() || String(item.menuItemId);
  }

  setCheckoutView(view: 'cards' | 'overview'): void {
    if (view === 'overview' && !this.hasValidPickupSlotSelected()) {
      this.showToast(this.getPickupSlotRequiredMessage(), 'error');
    }

    this.checkoutView = view;
  }

  onLocationChange(location: string): void {
    this.pickupLocation = location;
    localStorage.setItem(this.locationStorageKey, location);
  }

  getPickupSlotLabel(slot: PickupWindow): string {
    return slot.label;
  }

  getPickupSlotCaption(slot: PickupWindow): string {
    return slot.caption;
  }

  selectPickupSlot(slot: PickupWindow): void {
    if (!this.isPickupSlotAvailable(slot)) {
      this.showToast(this.getInvalidPickupSlotMessage(slot), 'error');
      return;
    }

    this.selectedPickupSlot = slot.id;
    this.errorMessage = '';
  }

  onPickupSlotPointerDown(slot: PickupWindow, event: PointerEvent): void {
    if (this.isPickupSlotAvailable(slot)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.showToast(this.getInvalidPickupSlotMessage(slot), 'error');
  }

  hasAvailablePickupSlots(): boolean {
    return this.pickupSlots.some((slot) => this.isPickupSlotAvailable(slot));
  }

  isPickupSlotAvailable(slotOrId: PickupWindow | string): boolean {
    const slot = this.resolvePickupSlot(slotOrId);
    if (!slot) {
      return false;
    }

    return this.getMinutesSinceMidnight() <= this.getSlotEndMinutes(slot);
  }

  goToStep(index: number): void {
    if (index > 0 && !this.hasValidPickupSlotSelected()) {
      this.showToast(this.getPickupSlotRequiredMessage(), 'error');
      return;
    }

    this.activeStep = Math.max(0, Math.min(index, this.checkoutSteps.length - 1));
  }

  nextStep(): void {
    if (this.activeStep === 0 && !this.hasValidPickupSlotSelected()) {
      this.showToast(this.getPickupSlotRequiredMessage(), 'error');
      return;
    }

    this.goToStep(this.activeStep + 1);
  }

  previousStep(): void {
    this.goToStep(this.activeStep - 1);
  }

  onPlaceOrder(): void {
    if (!this.hasValidPickupSlotSelected()) {
      this.showToast(this.getPickupSlotRequiredMessage(), 'error');
      return;
    }

    if (this.cartItems.length === 0) {
      this.showToast('Your cart is empty', 'error');
      return;
    }

    if (!this.pickupLocation.trim()) {
      this.showToast('Please enter a pickup location', 'error');
      return;
    }

    const selectedSlot = this.resolvePickupSlot(this.selectedPickupSlot);
    if (!selectedSlot) {
      this.showToast(this.getPickupSlotRequiredMessage(), 'error');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request: PlaceOrderRequest = {
      pickupSlot: `${selectedSlot.label} (${selectedSlot.caption})`,
      pickupSlotTime: selectedSlot.start,
      location: this.pickupLocation.trim(),
      pickupTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      items: this.cartService.toPlaceOrderItems(),
    };

    this.orderApi
      .placeOrder(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cartService.clearCart();
          this.router.navigate(['/orders', response.orderId]);
        },
        error: (error) => {
          const apiMessage = error.error?.message || error.error?.error;
          const statusMessage = error.status === 401
            ? 'Your session is not valid. Please log in again before placing the order.'
            : apiMessage || 'Failed to place order. Please try again.';

          this.errorMessage = statusMessage;
          this.showToast(statusMessage, 'error');
          this.isLoading = false;
        },
      });
  }

  private calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  private loadWalletBalance(): void {
    this.isWalletLoading = true;

    this.walletService
      .getWallet()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (wallet) => {
          this.walletBalance = wallet.balance;
          this.isWalletLoading = false;
        },
        error: (error) => {
          console.error('Failed to load wallet:', error);
          this.walletBalance = null;
          this.isWalletLoading = false;
        },
      });
  }

  private hasValidPickupSlotSelected(): boolean {
    return !!this.selectedPickupSlot && this.isPickupSlotAvailable(this.selectedPickupSlot);
  }

  private getPickupSlotRequiredMessage(): string {
    if (!this.selectedPickupSlot) {
      return 'Please select an available pickup window';
    }

    const slot = this.resolvePickupSlot(this.selectedPickupSlot);
    return slot ? this.getInvalidPickupSlotMessage(slot) : 'Please select an available pickup window';
  }

  private getInvalidPickupSlotMessage(slot: PickupWindow): string {
    return `${slot.label} pickup is closed for today. Please choose a later available window.`;
  }

  private resolvePickupSlot(slotOrId: PickupWindow | string): PickupWindow | null {
    if (typeof slotOrId !== 'string') {
      return slotOrId;
    }

    return this.pickupSlots.find((slot) => slot.id === slotOrId) || null;
  }

  private getSlotEndMinutes(slot: PickupWindow): number {
    const [hour, minute] = slot.end.split(':').map(Number);
    return hour * 60 + minute;
  }

  private getMinutesSinceMidnight(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  private showToast(message: string, type: 'error' | 'success'): void {
    this.errorMessage = type === 'error' ? message : this.errorMessage;
    this.toastMessage = message;
    this.toastType = type;

    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }

    this.toastTimeoutId = setTimeout(() => {
      this.toastMessage = '';
      this.toastTimeoutId = null;
    }, 4200);
  }

  ngOnDestroy(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    if (this.slotAvailabilityTimerId) {
      clearInterval(this.slotAvailabilityTimerId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
