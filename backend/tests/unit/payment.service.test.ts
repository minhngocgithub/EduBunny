import { PaymentService } from '@modules/payment/payment.service';
import { courseAccessService } from '@modules/course/course-access.service';
import { getPaymentProviderAdapter } from '@modules/payment/payment.providers';
import { notificationService } from '@shared/services/notification.service';
import {
  CurrencyCode,
  EntitlementSource,
  EntitlementStatus,
  PaymentEventType,
  PaymentGateway,
  PaymentStatus,
  Prisma,
  PrismaClient,
  RefundStatus,
} from '@prisma/client/index';

jest.mock('@/shared/utils/logger.utils', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@modules/course/course-access.service', () => ({
  courseAccessService: {
    requireStudentIdByUserId: jest.fn(),
  },
}));

jest.mock('@shared/services/notification.service', () => ({
  notificationService: {
    notifyEntitlementExpiring: jest.fn(),
  },
}));

const adapterMock = {
  createOrder: jest.fn(),
  verifyGatewayEvent: jest.fn(),
  queryOrderStatus: jest.fn(),
};

jest.mock('@modules/payment/payment.providers', () => ({
  getPaymentProviderAdapter: jest.fn(() => adapterMock),
}));

jest.mock('@prisma/client/index', () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;

    constructor(message: string, options: { code: string }) {
      super(message);
      this.code = options.code;
      Object.setPrototypeOf(this, PrismaClientKnownRequestError.prototype);
    }
  }

  const mockPrisma = {
    subscriptionPlan: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    courseDiscount: {
      findFirst: jest.fn(),
    },
    coursePurchase: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    paymentEvent: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    courseEntitlement: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    courseRefund: {
      findMany: jest.fn(),
    },
    enrollment: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    Prisma: {
      PrismaClientKnownRequestError,
    },
    CurrencyCode: {
      VND: 'VND',
    },
    EntitlementSource: {
      PURCHASE: 'PURCHASE',
    },
    EntitlementStatus: {
      ACTIVE: 'ACTIVE',
      EXPIRED: 'EXPIRED',
      REVOKED: 'REVOKED',
    },
    PaymentEventType: {
      CALLBACK: 'CALLBACK',
      WEBHOOK: 'WEBHOOK',
      RECONCILIATION: 'RECONCILIATION',
    },
    PaymentGateway: {
      MOMO: 'MOMO',
      ZALOPAY: 'ZALOPAY',
      VNPAY: 'VNPAY',
    },
    PaymentStatus: {
      PENDING: 'PENDING',
      SUCCESS: 'SUCCESS',
      FAILED: 'FAILED',
      CANCELED: 'CANCELED',
      REFUNDED: 'REFUNDED',
    },
    RefundStatus: {
      PENDING: 'PENDING',
      COMPLETED: 'COMPLETED',
      REJECTED: 'REJECTED',
    },
  };
});

describe('PaymentService', () => {
  let service: PaymentService;
  const prismaMock = new PrismaClient() as any;

  const txMock = {
    paymentEvent: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    coursePurchase: {
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    subscriptionPlan: {
      findUnique: jest.fn(),
    },
    courseEntitlement: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    courseRefund: {
      findMany: jest.fn(),
    },
    enrollment: {
      upsert: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentService();

    (courseAccessService.requireStudentIdByUserId as jest.Mock).mockResolvedValue('student-1');
    (getPaymentProviderAdapter as jest.Mock).mockReturnValue(adapterMock);
    (notificationService.notifyEntitlementExpiring as jest.Mock).mockResolvedValue({
      inAppSent: true,
      emailSent: true,
      skipped: false,
    });

    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(txMock));
  });

  it('creates payment order with active discount applied', async () => {
    const now = new Date('2026-04-06T08:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    prismaMock.subscriptionPlan.findFirst.mockResolvedValue({
      id: 'plan-1',
      courseId: 'course-1',
      priceAmount: 100000,
      currency: CurrencyCode.VND,
      isActive: true,
      course: {
        id: 'course-1',
        isPublished: true,
      },
    });

    prismaMock.courseDiscount.findFirst.mockResolvedValue({
      type: 'PERCENTAGE',
      value: 20,
    });

    adapterMock.createOrder.mockResolvedValue({
      gatewayTransactionId: 'momo-tx-1',
      paymentUrl: 'http://localhost:3000/checkout/mock?gateway=MOMO&transactionId=momo-tx-1',
      rawPayload: { provider: 'MOMO' },
    });

    prismaMock.coursePurchase.create.mockImplementation(async ({ data }: any) => ({
      ...data,
      id: data.id,
      createdAt: now,
      gatewayTransactionId: data.gatewayTransactionId,
    }));

    const result = await service.createOrder('user-1', {
      courseId: 'course-1',
      subscriptionPlanId: 'plan-1',
      gateway: PaymentGateway.MOMO,
      metadata: { campaign: 'summer' },
    });

    expect(adapterMock.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 80000,
        currency: CurrencyCode.VND,
        courseId: 'course-1',
        subscriptionPlanId: 'plan-1',
      })
    );

    expect(prismaMock.coursePurchase.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: PaymentStatus.PENDING,
          amount: 80000,
          gateway: PaymentGateway.MOMO,
          studentId: 'student-1',
        }),
      })
    );

    expect(result.amount).toBe(80000);
    expect(result.status).toBe(PaymentStatus.PENDING);

    jest.useRealTimers();
  });

  it('rejects order creation when subscription plan is missing', async () => {
    prismaMock.subscriptionPlan.findFirst.mockResolvedValue(null);

    await expect(
      service.createOrder('user-1', {
        courseId: 'course-1',
        subscriptionPlanId: 'missing-plan',
        gateway: PaymentGateway.MOMO,
      })
    ).rejects.toThrow('Subscription plan not found or inactive');
  });

  it('returns duplicate response for duplicate callback event', async () => {
    adapterMock.verifyGatewayEvent.mockReturnValue({
      isValid: true,
      gatewayTransactionId: 'tx-dup-1',
      status: PaymentStatus.SUCCESS,
      amount: 100000,
      paidAt: new Date('2026-04-06T08:00:00.000Z'),
      rawPayload: { foo: 'bar' },
    });

    const duplicateError = new (Prisma as any).PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
    });

    txMock.paymentEvent.create.mockRejectedValue(duplicateError);
    txMock.paymentEvent.findUnique.mockResolvedValue({ id: 'evt-existing' });

    const result = await service.processGatewayCallback(PaymentGateway.MOMO, { transactionId: 'tx-dup-1' });

    expect(result.duplicate).toBe(true);
    expect(result.processed).toBe(false);
    expect(result.eventType).toBe(PaymentEventType.CALLBACK);
    expect(result.message).toBe('Duplicate payment event ignored');
    expect(txMock.coursePurchase.findFirst).not.toHaveBeenCalled();
  });

  it('finalizes purchase and grants entitlement on successful callback', async () => {
    const paidAt = new Date('2026-04-06T08:00:00.000Z');

    adapterMock.verifyGatewayEvent.mockReturnValue({
      isValid: true,
      gatewayTransactionId: 'tx-success-1',
      status: PaymentStatus.SUCCESS,
      amount: 120000,
      paidAt,
      rawPayload: { provider: 'MOMO' },
    });

    txMock.paymentEvent.create.mockResolvedValue({ id: 'evt-1' });
    txMock.coursePurchase.findFirst.mockResolvedValue({
      id: 'purchase-1',
      studentId: 'student-1',
      courseId: 'course-1',
      subscriptionPlanId: 'plan-1',
      status: PaymentStatus.PENDING,
      amount: 120000,
      metadata: null,
    });

    txMock.subscriptionPlan.findUnique.mockResolvedValue({ durationDays: 30 });
    txMock.courseEntitlement.findFirst.mockResolvedValue(null);
    txMock.courseEntitlement.create.mockResolvedValue({ id: 'entitlement-1' });
    txMock.enrollment.upsert.mockResolvedValue({ id: 'enrollment-1' });
    txMock.coursePurchase.update.mockResolvedValue({ id: 'purchase-1' });
    txMock.paymentEvent.update.mockResolvedValue({ id: 'evt-1' });

    const result = await service.processGatewayCallback(PaymentGateway.MOMO, { transactionId: 'tx-success-1' });

    expect(result.processed).toBe(true);
    expect(result.status).toBe(PaymentStatus.SUCCESS);
    expect(result.purchaseId).toBe('purchase-1');

    expect(txMock.courseEntitlement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          studentId: 'student-1',
          courseId: 'course-1',
          purchaseId: 'purchase-1',
          source: EntitlementSource.PURCHASE,
          status: EntitlementStatus.ACTIVE,
        }),
      })
    );

    expect(txMock.coursePurchase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'purchase-1' },
        data: expect.objectContaining({
          status: PaymentStatus.SUCCESS,
          paidAt,
        }),
      })
    );
  });

  it('reconciles pending purchases with backoff, failed and success branches', async () => {
    const now = new Date('2026-04-06T09:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    prismaMock.coursePurchase.findMany.mockResolvedValue([
      {
        id: 'purchase-skip',
        studentId: 'student-1',
        courseId: 'course-1',
        subscriptionPlanId: 'plan-1',
        gateway: PaymentGateway.MOMO,
        gatewayTransactionId: 'tx-skip',
        status: PaymentStatus.PENDING,
        amount: 100000,
        createdAt: new Date('2026-04-06T08:00:00.000Z'),
        metadata: {
          paymentRetry: {
            attempts: 1,
            nextRetryAt: '2026-04-06T10:00:00.000Z',
            lastAttemptAt: '2026-04-06T08:30:00.000Z',
            lastError: 'Gateway timeout',
          },
        },
      },
      {
        id: 'purchase-missing-tx',
        studentId: 'student-1',
        courseId: 'course-1',
        subscriptionPlanId: 'plan-1',
        gateway: PaymentGateway.MOMO,
        gatewayTransactionId: null,
        status: PaymentStatus.PENDING,
        amount: 100000,
        createdAt: new Date('2026-04-06T08:00:00.000Z'),
        metadata: null,
      },
      {
        id: 'purchase-failed',
        studentId: 'student-1',
        courseId: 'course-1',
        subscriptionPlanId: 'plan-1',
        gateway: PaymentGateway.MOMO,
        gatewayTransactionId: 'tx-failed',
        status: PaymentStatus.PENDING,
        amount: 120000,
        createdAt: new Date('2026-04-06T08:00:00.000Z'),
        metadata: null,
      },
      {
        id: 'purchase-success',
        studentId: 'student-1',
        courseId: 'course-1',
        subscriptionPlanId: 'plan-1',
        gateway: PaymentGateway.MOMO,
        gatewayTransactionId: 'tx-success',
        status: PaymentStatus.PENDING,
        amount: 130000,
        createdAt: new Date('2026-04-06T08:00:00.000Z'),
        metadata: null,
      },
    ]);

    adapterMock.queryOrderStatus.mockImplementation(async (purchase: { id: string; gatewayTransactionId: string }) => {
      if (purchase.id === 'purchase-failed') {
        return {
          gatewayTransactionId: purchase.gatewayTransactionId,
          status: PaymentStatus.FAILED,
          amount: 120000,
          paidAt: null,
          rawPayload: { source: 'reconciliation' },
        };
      }

      if (purchase.id === 'purchase-success') {
        return {
          gatewayTransactionId: purchase.gatewayTransactionId,
          status: PaymentStatus.SUCCESS,
          amount: 130000,
          paidAt: new Date('2026-04-06T08:30:00.000Z'),
          rawPayload: { source: 'reconciliation' },
        };
      }

      return {
        gatewayTransactionId: purchase.gatewayTransactionId,
        status: PaymentStatus.PENDING,
        amount: 100000,
        paidAt: null,
        rawPayload: { source: 'reconciliation' },
      };
    });

    txMock.coursePurchase.update.mockResolvedValue({ id: 'updated' });
    txMock.subscriptionPlan.findUnique.mockResolvedValue({ durationDays: 30 });
    txMock.courseEntitlement.findFirst.mockResolvedValue(null);
    txMock.courseEntitlement.create.mockResolvedValue({ id: 'entitlement-1' });
    txMock.enrollment.upsert.mockResolvedValue({ id: 'enrollment-1' });

    const result = await service.reconcilePendingPurchases({ olderThanMinutes: 10, limit: 10 });

    expect(result).toEqual({
      scanned: 4,
      updatedToSuccess: 1,
      updatedToFailed: 1,
      stillPending: 1,
      skippedByBackoff: 1,
    });

    expect(adapterMock.queryOrderStatus).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('returns my entitlements with computed effective status', async () => {
    const now = new Date('2026-04-13T10:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    prismaMock.courseEntitlement.findMany.mockResolvedValue([
      {
        id: 'entitlement-expired-by-time',
        studentId: 'student-1',
        courseId: 'course-1',
        purchaseId: 'purchase-1',
        source: EntitlementSource.PURCHASE,
        status: EntitlementStatus.ACTIVE,
        startsAt: new Date('2026-03-01T00:00:00.000Z'),
        expiresAt: new Date('2026-04-01T00:00:00.000Z'),
        revokedAt: null,
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
        course: {
          id: 'course-1',
          title: 'Math',
          slug: 'math',
          thumbnail: null,
          isFree: false,
        },
        purchase: {
          id: 'purchase-1',
          status: PaymentStatus.SUCCESS,
          gateway: PaymentGateway.MOMO,
          gatewayTransactionId: 'tx-1',
          amount: 100000,
          currency: CurrencyCode.VND,
          paidAt: new Date('2026-03-01T00:00:00.000Z'),
          expiresAt: new Date('2026-04-01T00:00:00.000Z'),
        },
      },
      {
        id: 'entitlement-active',
        studentId: 'student-1',
        courseId: 'course-2',
        purchaseId: 'purchase-2',
        source: EntitlementSource.PURCHASE,
        status: EntitlementStatus.ACTIVE,
        startsAt: new Date('2026-04-01T00:00:00.000Z'),
        expiresAt: new Date('2026-05-01T00:00:00.000Z'),
        revokedAt: null,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-01T00:00:00.000Z'),
        course: {
          id: 'course-2',
          title: 'Science',
          slug: 'science',
          thumbnail: null,
          isFree: false,
        },
        purchase: {
          id: 'purchase-2',
          status: PaymentStatus.SUCCESS,
          gateway: PaymentGateway.ZALOPAY,
          gatewayTransactionId: 'tx-2',
          amount: 120000,
          currency: CurrencyCode.VND,
          paidAt: new Date('2026-04-01T00:00:00.000Z'),
          expiresAt: new Date('2026-05-01T00:00:00.000Z'),
        },
      },
    ]);

    const result = await service.getMyEntitlements('user-1');

    expect(result).toHaveLength(2);
    expect(result[0].effectiveStatus).toBe(EntitlementStatus.EXPIRED);
    expect(result[0].canAccessNow).toBe(false);
    expect(result[1].effectiveStatus).toBe(EntitlementStatus.ACTIVE);
    expect(result[1].canAccessNow).toBe(true);

    jest.useRealTimers();
  });

  it('lists expiring entitlements within configured days', async () => {
    prismaMock.courseEntitlement.findMany.mockResolvedValue([
      {
        id: 'entitlement-1',
      },
    ]);

    const result = await service.getExpiringEntitlements({ days: 14, limit: 30 });

    expect(result.days).toBe(14);
    expect(result.total).toBe(1);
    expect(prismaMock.courseEntitlement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 30,
      })
    );
  });

  it('dispatches expiring entitlement notifications with summary counts', async () => {
    const expiresSoon = new Date('2026-04-15T00:00:00.000Z');

    prismaMock.courseEntitlement.findMany.mockResolvedValue([
      {
        id: 'entitlement-1',
        expiresAt: expiresSoon,
        course: {
          id: 'course-1',
          title: 'Math Advanced',
          slug: 'math-advanced',
        },
        student: {
          id: 'student-1',
          firstName: 'Minh',
          lastName: 'An',
          user: {
            id: 'user-1',
            email: 'student1@test.com',
          },
        },
      },
      {
        id: 'entitlement-2',
        expiresAt: expiresSoon,
        course: {
          id: 'course-2',
          title: 'Science Starter',
          slug: 'science-starter',
        },
        student: {
          id: 'student-2',
          firstName: 'Lan',
          lastName: 'Chi',
          user: {
            id: 'user-2',
            email: 'student2@test.com',
          },
        },
      },
    ]);

    (notificationService.notifyEntitlementExpiring as jest.Mock)
      .mockResolvedValueOnce({
        inAppSent: true,
        emailSent: true,
        skipped: false,
      })
      .mockResolvedValueOnce({
        inAppSent: false,
        emailSent: false,
        skipped: true,
      });

    const result = await service.sendExpiringEntitlementNotifications({ days: 7, limit: 10 });

    expect(result).toEqual({
      scanned: 2,
      inAppSent: 1,
      emailSent: 1,
      skipped: 1,
      failed: 0,
    });

    expect(notificationService.notifyEntitlementExpiring).toHaveBeenCalledTimes(2);
  });

  it('processes subscription lifecycle for expiry, refunds, and canceled purchases', async () => {
    const asOf = new Date('2026-04-13T10:00:00.000Z');

    prismaMock.courseEntitlement.updateMany.mockResolvedValue({ count: 2 });
    prismaMock.courseRefund.findMany.mockResolvedValue([
      { purchaseId: 'purchase-refund-1' },
    ]);
    prismaMock.coursePurchase.findMany.mockResolvedValue([
      { id: 'purchase-canceled-1' },
    ]);

    txMock.courseEntitlement.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 });
    txMock.coursePurchase.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.processSubscriptionLifecycle({ asOf, limit: 100 });

    expect(result).toEqual({
      processedAt: asOf,
      expiredEntitlements: 2,
      revokedByRefund: 1,
      revokedByCanceled: 1,
      purchasesMarkedRefunded: 1,
    });

    expect(prismaMock.courseRefund.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: RefundStatus.COMPLETED,
        },
      })
    );
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(2);
  });
});
