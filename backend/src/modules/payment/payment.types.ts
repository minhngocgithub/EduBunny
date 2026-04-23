import { CurrencyCode, PaymentEventType, PaymentGateway, PaymentStatus } from '@prisma/client/index';

export interface CreatePaymentOrderInput {
  courseId: string;
  subscriptionPlanId: string;
  gateway: PaymentGateway;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentOrderResult {
  purchaseId: string;
  gateway: PaymentGateway;
  gatewayTransactionId: string;
  amount: number;
  currency: CurrencyCode;
  paymentUrl: string;
  status: PaymentStatus;
  createdAt: Date;
}

export interface PaymentRetryInfo {
  attempts: number;
  nextRetryAt: string | null;
  lastAttemptAt: string | null;
  lastError: string | null;
}

export interface GatewayCreateOrderPayload {
  amount: number;
  currency: CurrencyCode;
  purchaseId: string;
  courseId: string;
  subscriptionPlanId: string;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface GatewayCreateOrderResult {
  gatewayTransactionId: string;
  paymentUrl: string;
  rawPayload: Record<string, unknown>;
}

export interface GatewayVerificationResult {
  isValid: boolean;
  gatewayTransactionId: string;
  status: PaymentStatus;
  amount: number | null;
  paidAt: Date | null;
  rawPayload: Record<string, unknown>;
  errorMessage?: string;
}

export interface GatewayStatusResult {
  gatewayTransactionId: string;
  status: PaymentStatus;
  amount: number | null;
  paidAt: Date | null;
  rawPayload: Record<string, unknown>;
}

export interface ProcessGatewayEventResult {
  gateway: PaymentGateway;
  eventType: PaymentEventType;
  gatewayTransactionId: string;
  processed: boolean;
  duplicate: boolean;
  purchaseId: string | null;
  status: PaymentStatus | null;
  message: string;
  invalidSignature?: boolean;
}

export interface ReconciliationInput {
  olderThanMinutes?: number;
  limit?: number;
}

export interface ReconciliationResult {
  scanned: number;
  updatedToSuccess: number;
  updatedToFailed: number;
  stillPending: number;
  skippedByBackoff: number;
}

export interface PaymentHistoryQuery {
  page?: number;
  limit?: number;
}

export interface SubscriptionLifecycleInput {
  asOf?: Date;
  limit?: number;
}

export interface SubscriptionLifecycleResult {
  processedAt: Date;
  expiredEntitlements: number;
  revokedByRefund: number;
  revokedByCanceled: number;
  purchasesMarkedRefunded: number;
}

export interface ExpiringEntitlementsQuery {
  days?: number;
  limit?: number;
}

export interface ExpiringEntitlementNotificationInput {
  days?: number;
  limit?: number;
}

export interface ExpiringEntitlementNotificationResult {
  scanned: number;
  inAppSent: number;
  emailSent: number;
  skipped: number;
  failed: number;
}
