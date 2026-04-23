import { PaymentGateway } from '@prisma/client/index';
import { z } from 'zod';

export const GatewayParamSchema = z.object({
  gateway: z.nativeEnum(PaymentGateway),
});

export const CreatePaymentOrderSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  subscriptionPlanId: z.string().uuid('Invalid subscription plan ID'),
  gateway: z.nativeEnum(PaymentGateway),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const ProcessGatewayEventSchema = z.record(z.unknown());

export const ReconciliationRequestSchema = z.object({
  olderThanMinutes: z.number().int().positive().max(1440).optional().default(10),
  limit: z.number().int().positive().max(200).optional().default(100),
});

export const PaymentHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const PendingPurchasesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).optional().default(100),
});

export const SubscriptionLifecycleRequestSchema = z.object({
  asOf: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(1000).optional().default(500),
});

export const ExpiringEntitlementsQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).optional().default(7),
  limit: z.coerce.number().int().positive().max(500).optional().default(100),
});

export const ExpiringEntitlementNotificationRequestSchema = ExpiringEntitlementsQuerySchema;

export type CreatePaymentOrderDTO = z.infer<typeof CreatePaymentOrderSchema>;
export type ProcessGatewayEventDTO = z.infer<typeof ProcessGatewayEventSchema>;
export type ReconciliationRequestDTO = z.infer<typeof ReconciliationRequestSchema>;
export type PaymentHistoryQueryDTO = z.infer<typeof PaymentHistoryQuerySchema>;
export type PendingPurchasesQueryDTO = z.infer<typeof PendingPurchasesQuerySchema>;
export type SubscriptionLifecycleRequestDTO = z.infer<typeof SubscriptionLifecycleRequestSchema>;
export type ExpiringEntitlementsQueryDTO = z.infer<typeof ExpiringEntitlementsQuerySchema>;
export type ExpiringEntitlementNotificationRequestDTO = z.infer<typeof ExpiringEntitlementNotificationRequestSchema>;
