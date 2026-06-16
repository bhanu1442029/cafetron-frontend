import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrderApiService } from '../../services/order-api.service';
import { OrderDetailResponse } from '../../models/order.models';
import { OrderQRDisplayComponent } from 'src/app/features/order-qr/order-qr-display/order-qr-display.component';

@Component({
  selector: 'order-detail',
  standalone: true,
  imports: [CommonModule, OrderQRDisplayComponent, RouterModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order: OrderDetailResponse | null = null;
  isLoading: boolean = true; // Start as true, not false
  errorMessage: string = '';
  isProcessingTimeout: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private orderApi: OrderApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 OrderDetailComponent initialized');
    console.log('📊 Initial state - isLoading:', this.isLoading, 'order:', this.order);
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const orderId = +params['orderId'];
      console.log('📍 orderId from route:', orderId);
      if (orderId) {
        this.loadOrderDetail(orderId);
      } else {
        console.warn('⚠️ No orderId in route params');
        this.isLoading = false;
      }
    });
  }

  private loadOrderDetail(orderId: number): void {
    console.log('📥 Loading order detail for orderId:', orderId);
    console.log('🔄 Before set - isLoading:', this.isLoading);
    this.isLoading = true;
    console.log('🔄 After set - isLoading:', this.isLoading);
    this.errorMessage = '';

    const subscription = this.orderApi
      .getOrderDetail(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          console.log('✅✅✅ NEXT CALLBACK FIRED ✅✅✅');
          console.log('✅ Order detail loaded:', order);
          console.log('✅ Setting order and isLoading = false');
          this.order = order;
          this.isLoading = false;
          this.cdr.markForCheck();
          console.log('✅ After update - isLoading:', this.isLoading, 'order:', this.order);
        },
        error: (error) => {
          console.error('❌❌❌ ERROR CALLBACK FIRED ❌❌❌');
          console.error('❌ Error loading order detail:', error);
          this.errorMessage =
            error.error?.message || 'Failed to load order details. Please try again.';
          this.isLoading = false;
          this.cdr.markForCheck();
          console.error('❌ After update - isLoading:', this.isLoading, 'errorMessage:', this.errorMessage);
        },
      });
    console.log('📬 Subscription created:', subscription);
  }

  onProcessTimeout(): void {
    if (!this.order) return;

    if (!confirm('Are you sure you want to request a timeout for this order?')) {
      return;
    }

    this.isProcessingTimeout = true;
    this.errorMessage = '';

    this.orderApi
      .processTimeout(this.order.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this.isProcessingTimeout = false;
        },
        error: (error) => {
          console.error('❌ Error processing timeout:', error);
          this.errorMessage =
            error.error?.message || 'Failed to process timeout. Please try again.';
          this.isProcessingTimeout = false;
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
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

  getVendorStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PREPARING':
        return 'vendor-preparing';
      case 'READY':
        return 'vendor-ready';
      case 'COMPLETED':
        return 'vendor-completed';
      case 'CANCELLED':
        return 'vendor-cancelled';
      default:
        return 'vendor-default';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
