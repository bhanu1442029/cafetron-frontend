import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil, timeout } from 'rxjs/operators';

import { OrderApiService } from '../services/order-api.service';
import { MyOrderSummaryResponse } from '../models/order.models';
import { WalletService } from '../../wallet/wallet.service';

@Component({
  selector: 'order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css',
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  orders: MyOrderSummaryResponse[] = [];
  isLoading = true;
  walletBalance: number | null = null;
  isWalletLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private orderApi: OrderApiService,
    private walletService: WalletService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadWalletBalance();
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
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load wallet:', error);
          this.walletBalance = null;
          this.isWalletLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  getWalletLabel(): string {
    if (this.isWalletLoading) {
      return 'Loading...';
    }

    return this.walletBalance === null
      ? 'Unavailable'
      : `₹${this.walletBalance.toFixed(2)}`;
  }

  private loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderApi
      .getMyOrders()
      .pipe(
        timeout(10000),
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (orders) => {
          this.orders = orders;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.orders = [];
          this.errorMessage =
            error.name === 'TimeoutError'
              ? 'Orders took too long to load. Please check that the backend is running.'
              : error.error?.message || 'Failed to load orders. Please try again.';
        },
      });
  }

  viewOrderDetail(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'status-pending';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  getPaymentStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'payment-paid';
      case 'PENDING':
        return 'payment-pending';
      case 'FAILED':
        return 'payment-failed';
      default:
        return 'payment-default';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
