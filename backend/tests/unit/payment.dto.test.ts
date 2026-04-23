import {
  CreatePaymentOrderSchema,
  ExpiringEntitlementNotificationRequestSchema,
  ExpiringEntitlementsQuerySchema,
  GatewayParamSchema,
  PaymentHistoryQuerySchema,
  PendingPurchasesQuerySchema,
  ReconciliationRequestSchema,
  SubscriptionLifecycleRequestSchema,
} from '@modules/payment/payment.dto';

describe('Payment DTO Schemas', () => {
  it('parses valid create order payload', () => {
    const parsed = CreatePaymentOrderSchema.parse({
      courseId: '11111111-1111-1111-1111-111111111111',
      subscriptionPlanId: '22222222-2222-2222-2222-222222222222',
      gateway: 'MOMO',
      returnUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
      metadata: {
        source: 'campaign',
      },
    });

    expect(parsed.gateway).toBe('MOMO');
    expect(parsed.metadata?.source).toBe('campaign');
  });

  it('rejects invalid create order payload', () => {
    expect(() =>
      CreatePaymentOrderSchema.parse({
        courseId: 'invalid-course-id',
        subscriptionPlanId: '22222222-2222-2222-2222-222222222222',
        gateway: 'MOMO',
      })
    ).toThrow();
  });

  it('parses reconciliation defaults', () => {
    const parsed = ReconciliationRequestSchema.parse({});

    expect(parsed.olderThanMinutes).toBe(10);
    expect(parsed.limit).toBe(100);
  });

  it('coerces history and pending query values', () => {
    const history = PaymentHistoryQuerySchema.parse({
      page: '2',
      limit: '25',
    });

    const pending = PendingPurchasesQuerySchema.parse({
      limit: '50',
    });

    expect(history.page).toBe(2);
    expect(history.limit).toBe(25);
    expect(pending.limit).toBe(50);
  });

  it('validates gateway route param', () => {
    const parsed = GatewayParamSchema.parse({ gateway: 'VNPAY' });
    expect(parsed.gateway).toBe('VNPAY');

    expect(() => GatewayParamSchema.parse({ gateway: 'PAYPAL' })).toThrow();
  });

  it('parses subscription lifecycle defaults', () => {
    const parsed = SubscriptionLifecycleRequestSchema.parse({});

    expect(parsed.limit).toBe(500);
    expect(parsed.asOf).toBeUndefined();
  });

  it('validates expiring entitlements query', () => {
    const parsed = ExpiringEntitlementsQuerySchema.parse({
      days: '15',
      limit: '120',
    });

    expect(parsed.days).toBe(15);
    expect(parsed.limit).toBe(120);

    expect(() =>
      ExpiringEntitlementsQuerySchema.parse({
        days: 0,
      })
    ).toThrow();
  });

  it('parses expiring entitlement notification request body', () => {
    const parsed = ExpiringEntitlementNotificationRequestSchema.parse({
      days: '3',
      limit: '25',
    });

    expect(parsed.days).toBe(3);
    expect(parsed.limit).toBe(25);
  });
});
