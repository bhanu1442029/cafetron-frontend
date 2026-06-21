export interface PlaceOrderItemRequest {
  menuItemId: number;
  quantity: number;
}

export interface PlaceOrderRequest {
  pickupSlot: string;
  pickupSlotTime: string;
  location: string;
  pickupTimeZone: string;
  items: PlaceOrderItemRequest[];
}

export interface PlaceOrderResponse {
  orderId: number;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  qrToken: string;
}

export interface MyOrderSummaryResponse {
  orderId: number;
  overallStatus: string;
  paymentStatus: string;
  totalAmount: number;
  pickupSlot: string;
  location: string;
  pickupTimeZone: string;
  createdAt: string | Date;
}

export interface OrderDetailItemResponse {
  menuItemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  vendorStatus: string;
}

export interface OrderDetailResponse {
  orderId: number;
  overallStatus: string;
  paymentStatus: string;
  totalAmount: number;
  pickupSlot: string;
  location: string;
  pickupTimeZone: string;
  qrToken: string;
  createdAt: string | Date;
  items: OrderDetailItemResponse[];
}
