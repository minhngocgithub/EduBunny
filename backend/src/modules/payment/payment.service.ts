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
import { logger } from '@/shared/utils/logger.utils';
import { notificationService } from '@/shared/services/notification.service';
import { courseAccessService } from '../course/course-access.service';
import {
  CreatePaymentOrderInput,
  CreatePaymentOrderResult,
  ExpiringEntitlementNotificationInput,
  ExpiringEntitlementNotificationResult,
  ExpiringEntitlementsQuery,
  GatewayStatusResult,
  GatewayVerificationResult,
  PaymentHistoryQuery,
  PaymentRetryInfo,
  ProcessGatewayEventResult,
  ReconciliationInput,
  ReconciliationResult,
  SubscriptionLifecycleInput,
  SubscriptionLifecycleResult,
} from './payment.types';
import { getPaymentProviderAdapter } from './payment.providers';

const prisma = new PrismaClient();

const DEFAULT_PENDING_AGE_MINUTES = 10;
const DEFAULT_RECONCILIATION_LIMIT = 100;
const RECONCILIATION_INTERVAL_MS = 15 * 60 * 1000;
const DEFAULT_LIFECYCLE_LIMIT = 500;
const LIFECYCLE_INTERVAL_MS = 60 * 60 * 1000;
const DEFAULT_EXPIRING_NOTIFICATION_DAYS = 7;
const DEFAULT_EXPIRING_NOTIFICATION_LIMIT = 100;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_BACKOFF_MINUTES = [1, 5, 15, 60, 60];
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export class PaymentService {
  private reconciliationTimer: NodeJS.Timeout | null = null;
  private lifecycleTimer: NodeJS.Timeout | null = null;

  startReconciliationScheduler(): void {
    if (this.reconciliationTimer || process.env.PAYMENT_RECONCILIATION_ENABLED === 'false') {
      return;
    }

    this.reconciliationTimer = setInterval(() => {
      this.reconcilePendingPurchases({
        olderThanMinutes: DEFAULT_PENDING_AGE_MINUTES,
        limit: DEFAULT_RECONCILIATION_LIMIT,
      }).catch((error) => {
        logger.error('Payment reconciliation scheduler failed', error);
      });
    }, RECONCILIATION_INTERVAL_MS);

    this.reconciliationTimer.unref();
    logger.info('Payment reconciliation scheduler started (15 min interval)');
  }

  stopReconciliationScheduler(): void {
    if (!this.reconciliationTimer) {
      return;
    }

    clearInterval(this.reconciliationTimer);
    this.reconciliationTimer = null;
    logger.info('Payment reconciliation scheduler stopped');
  }

  startLifecycleScheduler(): void {
    if (this.lifecycleTimer || process.env.PAYMENT_LIFECYCLE_ENABLED === 'false') {
      return;
    }

    this.lifecycleTimer = setInterval(() => {
      this.processSubscriptionLifecycle({ limit: DEFAULT_LIFECYCLE_LIMIT })
        .then(() => this.sendExpiringEntitlementNotifications({
          days: DEFAULT_EXPIRING_NOTIFICATION_DAYS,
          limit: DEFAULT_EXPIRING_NOTIFICATION_LIMIT,
        }))
        .catch((error) => {
          logger.error('Subscription lifecycle scheduler failed', error);
        });
    }, LIFECYCLE_INTERVAL_MS);

    this.lifecycleTimer.unref();
    logger.info('Subscription lifecycle scheduler started (60 min interval)');
  }

  stopLifecycleScheduler(): void {
    if (!this.lifecycleTimer) {
      return;
    }

    clearInterval(this.lifecycleTimer);
    this.lifecycleTimer = null;
    logger.info('Subscription lifecycle scheduler stopped');
  }

  async createOrder(userId: string, input: CreatePaymentOrderInput): Promise<CreatePaymentOrderResult> {
    const studentId = await courseAccessService.requireStudentIdByUserId(userId);

    const plan = await prisma.subscriptionPlan.findFirst({
      where: {
        id: input.subscriptionPlanId,
        courseId: input.courseId,
        isActive: true,
      },
      include: {
        course: {
          select: {
            id: true,
            isPublished: true,
          },
        },
      },
    });

    if (!plan) {
      throw new Error('Subscription plan not found or inactive');
    }

    if (!plan.course.isPublished) {
      throw new Error('Course is not published');
    }

    if (plan.currency !== CurrencyCode.VND) {
      throw new Error('Only VND is supported in this phase');
    }

    const now = new Date();
    const activeDiscount = await prisma.courseDiscount.findFirst({
      where: {
        courseId: input.courseId,
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const amount = this.calculateAmount(plan.priceAmount, activeDiscount);
    const adapter = getPaymentProviderAdapter(input.gateway);

    const provisionalPurchaseId = crypto.randomUUID();
    const order = await adapter.createOrder({
      amount,
      currency: plan.currency,
      purchaseId: provisionalPurchaseId,
      courseId: input.courseId,
      subscriptionPlanId: plan.id,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      metadata: input.metadata,
    });

    const createdPurchase = await prisma.coursePurchase.create({
      data: {
        id: provisionalPurchaseId,
        studentId,
        courseId: input.courseId,
        subscriptionPlanId: plan.id,
        gateway: input.gateway,
        gatewayTransactionId: order.gatewayTransactionId,
        status: PaymentStatus.PENDING,
        amount,
        currency: plan.currency,
        metadata: this.toJson({
          gatewayPayload: order.rawPayload,
          paymentRetry: this.buildRetryInfo(0, null, null, null),
          custom: input.metadata || {},
        }),
      },
    });

    return {
      purchaseId: createdPurchase.id,
      gateway: createdPurchase.gateway,
      gatewayTransactionId: createdPurchase.gatewayTransactionId || '',
      amount: createdPurchase.amount,
      currency: createdPurchase.currency,
      paymentUrl: order.paymentUrl,
      status: createdPurchase.status,
      createdAt: createdPurchase.createdAt,
    };
  }

  async processGatewayCallback(
    gateway: PaymentGateway,
    payload: Record<string, unknown>
  ): Promise<ProcessGatewayEventResult> {
    return this.processGatewayEvent(gateway, PaymentEventType.CALLBACK, payload);
  }

  async processGatewayWebhook(
    gateway: PaymentGateway,
    payload: Record<string, unknown>
  ): Promise<ProcessGatewayEventResult> {
    return this.processGatewayEvent(gateway, PaymentEventType.WEBHOOK, payload);
  }

  async getMyPurchases(userId: string, query: PaymentHistoryQuery) {
    const studentId = await courseAccessService.requireStudentIdByUserId(userId);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.coursePurchase.findMany({
        where: { studentId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
            },
          },
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
              durationDays: true,
              priceAmount: true,
              currency: true,
            },
          },
          refunds: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
              refundedAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coursePurchase.count({ where: { studentId } }),
    ]);

    return {
      purchases: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMyEntitlements(userId: string) {
    const studentId = await courseAccessService.requireStudentIdByUserId(userId);
    const now = new Date();

    const entitlements = await prisma.courseEntitlement.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            isFree: true,
          },
        },
        purchase: {
          select: {
            id: true,
            status: true,
            gateway: true,
            gatewayTransactionId: true,
            amount: true,
            currency: true,
            paidAt: true,
            expiresAt: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { expiresAt: 'asc' }],
    });

    return entitlements.map((entitlement) => {
      const isExpiredByTime = Boolean(entitlement.expiresAt && entitlement.expiresAt <= now);
      const effectiveStatus =
        entitlement.status === EntitlementStatus.ACTIVE && isExpiredByTime
          ? EntitlementStatus.EXPIRED
          : entitlement.status;

      return {
        ...entitlement,
        effectiveStatus,
        canAccessNow: effectiveStatus === EntitlementStatus.ACTIVE,
      };
    });
  }

  async getExpiringEntitlements(query: ExpiringEntitlementsQuery) {
    const days = query.days || 7;
    const limit = query.limit || 100;
    const now = new Date();
    const expiresBefore = this.addDays(now, days);

    const entitlements = await prisma.courseEntitlement.findMany({
      where: {
        status: EntitlementStatus.ACTIVE,
        expiresAt: {
          not: null,
          gt: now,
          lte: expiresBefore,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        purchase: {
          select: {
            id: true,
            status: true,
            paidAt: true,
            expiresAt: true,
          },
        },
      },
      orderBy: { expiresAt: 'asc' },
      take: limit,
    });

    return {
      days,
      total: entitlements.length,
      entitlements,
    };
  }

  async sendExpiringEntitlementNotifications(
    input: ExpiringEntitlementNotificationInput = {}
  ): Promise<ExpiringEntitlementNotificationResult> {
    if (process.env.PAYMENT_EXPIRING_NOTIFICATION_ENABLED === 'false') {
      return {
        scanned: 0,
        inAppSent: 0,
        emailSent: 0,
        skipped: 0,
        failed: 0,
      };
    }

    const days = input.days ?? DEFAULT_EXPIRING_NOTIFICATION_DAYS;
    const limit = input.limit ?? DEFAULT_EXPIRING_NOTIFICATION_LIMIT;
    const expiring = await this.getExpiringEntitlements({ days, limit });

    const summary: ExpiringEntitlementNotificationResult = {
      scanned: expiring.entitlements.length,
      inAppSent: 0,
      emailSent: 0,
      skipped: 0,
      failed: 0,
    };

    const now = new Date();

    for (const entitlement of expiring.entitlements) {
      if (!entitlement.expiresAt) {
        summary.skipped += 1;
        continue;
      }

      try {
        const daysRemaining = Math.max(
          0,
          Math.ceil((entitlement.expiresAt.getTime() - now.getTime()) / DAY_IN_MS)
        );

        const studentName = `${entitlement.student.firstName} ${entitlement.student.lastName}`.trim();
        const result = await notificationService.notifyEntitlementExpiring({
          userId: entitlement.student.user.id,
          userEmail: entitlement.student.user.email,
          studentName,
          courseTitle: entitlement.course.title,
          courseSlug: entitlement.course.slug,
          entitlementId: entitlement.id,
          expiresAt: entitlement.expiresAt,
          daysRemaining,
        });

        if (result.inAppSent) {
          summary.inAppSent += 1;
        }

        if (result.emailSent) {
          summary.emailSent += 1;
        }

        if (result.skipped) {
          summary.skipped += 1;
        }
      } catch (error) {
        summary.failed += 1;
        logger.error('Failed to send expiring entitlement notification', {
          entitlementId: entitlement.id,
          error,
        });
      }
    }

    return summary;
  }

  async reconcilePendingPurchases(input: ReconciliationInput): Promise<ReconciliationResult> {
    const olderThanMinutes = input.olderThanMinutes ?? DEFAULT_PENDING_AGE_MINUTES;
    const limit = input.limit ?? DEFAULT_RECONCILIATION_LIMIT;
    const threshold = new Date(Date.now() - olderThanMinutes * 60 * 1000);

    const pending = await prisma.coursePurchase.findMany({
      where: {
        status: PaymentStatus.PENDING,
        createdAt: { lte: threshold },
      },
      include: {
        subscriptionPlan: {
          select: {
            id: true,
            durationDays: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });

    const summary: ReconciliationResult = {
      scanned: pending.length,
      updatedToSuccess: 0,
      updatedToFailed: 0,
      stillPending: 0,
      skippedByBackoff: 0,
    };

    const now = new Date();

    for (const purchase of pending) {
      const retryInfo = this.readRetryInfo(purchase.metadata);
      if (retryInfo.nextRetryAt && new Date(retryInfo.nextRetryAt) > now) {
        summary.skippedByBackoff += 1;
        continue;
      }

      if (!purchase.gatewayTransactionId) {
        await prisma.$transaction(async (tx) => {
          await this.scheduleRetry(
            tx,
            purchase,
            'Missing gateway transaction ID during reconciliation'
          );
        });
        summary.stillPending += 1;
        continue;
      }

      const adapter = getPaymentProviderAdapter(purchase.gateway);
      const status = await adapter.queryOrderStatus(purchase);

      if (status.status === PaymentStatus.SUCCESS) {
        await prisma.$transaction(async (tx) => {
          await this.finalizeSuccessfulPurchase(tx, purchase, status);
        });
        summary.updatedToSuccess += 1;
        continue;
      }

      if (status.status === PaymentStatus.FAILED || status.status === PaymentStatus.CANCELED) {
        const failedStatus: Extract<PaymentStatus, 'FAILED' | 'CANCELED'> =
          status.status === PaymentStatus.FAILED ? 'FAILED' : 'CANCELED';

        await prisma.$transaction(async (tx) => {
          await this.markPurchaseAsFailed(
            tx,
            purchase,
            failedStatus,
            'Gateway reconciliation marked transaction as failed'
          );
        });
        summary.updatedToFailed += 1;
        continue;
      }

      await prisma.$transaction(async (tx) => {
        await this.scheduleRetry(tx, purchase, 'Gateway still reports pending status');
      });
      summary.stillPending += 1;
    }

    return summary;
  }

  async getPendingPurchases(limit = 100) {
    const items = await prisma.coursePurchase.findMany({
      where: {
        status: PaymentStatus.PENDING,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            durationDays: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return items.map((purchase) => ({
      ...purchase,
      retryInfo: this.readRetryInfo(purchase.metadata),
    }));
  }

  async processSubscriptionLifecycle(
    input: SubscriptionLifecycleInput = {}
  ): Promise<SubscriptionLifecycleResult> {
    const asOf = input.asOf || new Date();
    const limit = input.limit || DEFAULT_LIFECYCLE_LIMIT;

    const expiredEntitlements = await prisma.courseEntitlement.updateMany({
      where: {
        status: EntitlementStatus.ACTIVE,
        expiresAt: {
          not: null,
          lte: asOf,
        },
      },
      data: {
        status: EntitlementStatus.EXPIRED,
      },
    });

    const completedRefunds = await prisma.courseRefund.findMany({
      where: {
        status: RefundStatus.COMPLETED,
      },
      select: {
        purchaseId: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
      take: limit,
    });

    let revokedByRefund = 0;
    let purchasesMarkedRefunded = 0;

    for (const refund of completedRefunds) {
      await prisma.$transaction(async (tx) => {
        const [revokeResult, purchaseResult] = await Promise.all([
          tx.courseEntitlement.updateMany({
            where: {
              purchaseId: refund.purchaseId,
              status: EntitlementStatus.ACTIVE,
            },
            data: {
              status: EntitlementStatus.REVOKED,
              revokedAt: asOf,
            },
          }),
          tx.coursePurchase.updateMany({
            where: {
              id: refund.purchaseId,
              status: {
                not: PaymentStatus.REFUNDED,
              },
            },
            data: {
              status: PaymentStatus.REFUNDED,
            },
          }),
        ]);

        revokedByRefund += revokeResult.count;
        purchasesMarkedRefunded += purchaseResult.count;
      });
    }

    const canceledPurchases = await prisma.coursePurchase.findMany({
      where: {
        status: PaymentStatus.CANCELED,
        entitlement: {
          is: {
            status: EntitlementStatus.ACTIVE,
          },
        },
      },
      select: {
        id: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
      take: limit,
    });

    let revokedByCanceled = 0;

    for (const purchase of canceledPurchases) {
      await prisma.$transaction(async (tx) => {
        const revokeResult = await tx.courseEntitlement.updateMany({
          where: {
            purchaseId: purchase.id,
            status: EntitlementStatus.ACTIVE,
          },
          data: {
            status: EntitlementStatus.REVOKED,
            revokedAt: asOf,
          },
        });

        revokedByCanceled += revokeResult.count;
      });
    }

    return {
      processedAt: asOf,
      expiredEntitlements: expiredEntitlements.count,
      revokedByRefund,
      revokedByCanceled,
      purchasesMarkedRefunded,
    };
  }

  private async processGatewayEvent(
    gateway: PaymentGateway,
    eventType: PaymentEventType,
    payload: Record<string, unknown>
  ): Promise<ProcessGatewayEventResult> {
    const adapter = getPaymentProviderAdapter(gateway);
    const verification = adapter.verifyGatewayEvent(payload);

    if (!verification.isValid) {
      const message = verification.errorMessage || 'Invalid gateway payload';

      return {
        gateway,
        eventType,
        gatewayTransactionId: verification.gatewayTransactionId,
        processed: false,
        duplicate: false,
        purchaseId: null,
        status: null,
        message,
        invalidSignature: /signature|secret/i.test(message),
      };
    }

    return prisma.$transaction(async (tx) => {
      const paymentEvent = await this.createPaymentEvent(tx, gateway, eventType, verification);
      if (!paymentEvent.created) {
        return {
          gateway,
          eventType,
          gatewayTransactionId: verification.gatewayTransactionId,
          processed: false,
          duplicate: true,
          purchaseId: null,
          status: null,
          message: 'Duplicate payment event ignored',
        };
      }

      const purchase = await tx.coursePurchase.findFirst({
        where: {
          gateway,
          gatewayTransactionId: verification.gatewayTransactionId,
        },
        include: {
          subscriptionPlan: {
            select: {
              id: true,
              durationDays: true,
            },
          },
        },
      });

      if (!purchase) {
        await tx.paymentEvent.update({
          where: { id: paymentEvent.id },
          data: { processedAt: new Date() },
        });

        return {
          gateway,
          eventType,
          gatewayTransactionId: verification.gatewayTransactionId,
          processed: false,
          duplicate: false,
          purchaseId: null,
          status: null,
          message: 'Purchase not found for gateway transaction',
        };
      }

      if (
        verification.amount !== null &&
        verification.amount > 0 &&
        verification.amount !== purchase.amount
      ) {
        await this.scheduleRetry(tx, purchase, 'Amount mismatch detected from gateway callback');

        await tx.paymentEvent.update({
          where: { id: paymentEvent.id },
          data: { processedAt: new Date() },
        });

        return {
          gateway,
          eventType,
          gatewayTransactionId: verification.gatewayTransactionId,
          processed: false,
          duplicate: false,
          purchaseId: purchase.id,
          status: purchase.status,
          message: 'Amount mismatch, purchase kept pending for retry',
        };
      }

      let status = purchase.status;
      let message = 'No status change';

      if (verification.status === PaymentStatus.SUCCESS) {
        const result = await this.finalizeSuccessfulPurchase(tx, purchase, verification);
        status = result.status;
        message = result.message;
      } else if (
        verification.status === PaymentStatus.FAILED ||
        verification.status === PaymentStatus.CANCELED
      ) {
        const failedStatus: Extract<PaymentStatus, 'FAILED' | 'CANCELED'> =
          verification.status === PaymentStatus.FAILED ? 'FAILED' : 'CANCELED';

        const result = await this.markPurchaseAsFailed(
          tx,
          purchase,
          failedStatus,
          'Gateway reported failed/canceled status'
        );
        status = result.status;
        message = result.message;
      } else {
        await this.scheduleRetry(tx, purchase, 'Gateway reported pending status');
        status = PaymentStatus.PENDING;
        message = 'Purchase remains pending and retry has been scheduled';
      }

      await tx.paymentEvent.update({
        where: { id: paymentEvent.id },
        data: { processedAt: new Date() },
      });

      return {
        gateway,
        eventType,
        gatewayTransactionId: verification.gatewayTransactionId,
        processed: true,
        duplicate: false,
        purchaseId: purchase.id,
        status,
        message,
      };
    });
  }

  private async createPaymentEvent(
    tx: Prisma.TransactionClient,
    gateway: PaymentGateway,
    eventType: PaymentEventType,
    verification: GatewayVerificationResult
  ): Promise<{ id: string; created: boolean }> {
    try {
      const event = await tx.paymentEvent.create({
        data: {
          gateway,
          gatewayTransactionId: verification.gatewayTransactionId,
          eventType,
          payload: this.toJson(verification.rawPayload),
        },
      });

      return { id: event.id, created: true };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await tx.paymentEvent.findUnique({
          where: {
            gatewayTransactionId_eventType: {
              gatewayTransactionId: verification.gatewayTransactionId,
              eventType,
            },
          },
          select: { id: true },
        });

        return { id: existing?.id || '', created: false };
      }

      throw error;
    }
  }

  private async finalizeSuccessfulPurchase(
    tx: Prisma.TransactionClient,
    purchase: {
      id: string;
      studentId: string;
      courseId: string;
      subscriptionPlanId: string | null;
      status: PaymentStatus;
      metadata: Prisma.JsonValue | null;
    },
    gatewayStatus: GatewayStatusResult | GatewayVerificationResult
  ): Promise<{ status: PaymentStatus; message: string }> {
    if (purchase.status === PaymentStatus.SUCCESS) {
      return {
        status: PaymentStatus.SUCCESS,
        message: 'Purchase already finalized',
      };
    }

    if (!purchase.subscriptionPlanId) {
      throw new Error('Purchase is missing subscription plan reference');
    }

    const plan = await tx.subscriptionPlan.findUnique({
      where: { id: purchase.subscriptionPlanId },
      select: {
        durationDays: true,
      },
    });

    if (!plan) {
      throw new Error('Subscription plan not found for purchase');
    }

    const paidAt = gatewayStatus.paidAt || new Date();

    const existingEntitlement = await tx.courseEntitlement.findFirst({
      where: {
        studentId: purchase.studentId,
        courseId: purchase.courseId,
        source: EntitlementSource.PURCHASE,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const baseTime =
      existingEntitlement?.expiresAt && existingEntitlement.expiresAt > paidAt
        ? existingEntitlement.expiresAt
        : paidAt;

    const startsAt =
      existingEntitlement?.expiresAt && existingEntitlement.expiresAt > paidAt
        ? existingEntitlement.startsAt
        : paidAt;

    const expiresAt = this.addDays(baseTime, plan.durationDays);

    if (existingEntitlement) {
      await tx.courseEntitlement.update({
        where: { id: existingEntitlement.id },
        data: {
          purchaseId: purchase.id,
          status: EntitlementStatus.ACTIVE,
          startsAt,
          expiresAt,
          revokedAt: null,
        },
      });
    } else {
      await tx.courseEntitlement.create({
        data: {
          studentId: purchase.studentId,
          courseId: purchase.courseId,
          purchaseId: purchase.id,
          source: EntitlementSource.PURCHASE,
          status: EntitlementStatus.ACTIVE,
          startsAt,
          expiresAt,
        },
      });
    }

    await tx.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: purchase.studentId,
          courseId: purchase.courseId,
        },
      },
      create: {
        studentId: purchase.studentId,
        courseId: purchase.courseId,
        progress: 0,
        lastAccessAt: new Date(),
      },
      update: {
        lastAccessAt: new Date(),
      },
    });

    const metadata = this.mergeMetadata(purchase.metadata, {
      paymentRetry: this.buildRetryInfo(0, null, new Date().toISOString(), null),
      lastGatewayStatus: PaymentStatus.SUCCESS,
      lastGatewayPayload: gatewayStatus.rawPayload,
    });

    await tx.coursePurchase.update({
      where: { id: purchase.id },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt,
        expiresAt,
        metadata: this.toJson(metadata),
      },
    });

    return {
      status: PaymentStatus.SUCCESS,
      message: 'Purchase finalized and entitlement granted',
    };
  }

  private async markPurchaseAsFailed(
    tx: Prisma.TransactionClient,
    purchase: {
      id: string;
      status: PaymentStatus;
      metadata: Prisma.JsonValue | null;
    },
    status: Extract<PaymentStatus, 'FAILED' | 'CANCELED'>,
    reason: string
  ): Promise<{ status: PaymentStatus; message: string }> {
    if (purchase.status === PaymentStatus.SUCCESS) {
      return {
        status: PaymentStatus.SUCCESS,
        message: 'Purchase already succeeded, ignoring failed callback',
      };
    }

    const metadata = this.mergeMetadata(purchase.metadata, {
      paymentRetry: this.buildRetryInfo(0, null, new Date().toISOString(), reason),
      lastGatewayStatus: status,
    });

    await tx.coursePurchase.update({
      where: { id: purchase.id },
      data: {
        status,
        metadata: this.toJson(metadata),
      },
    });

    return {
      status,
      message: reason,
    };
  }

  private async scheduleRetry(
    tx: Prisma.TransactionClient,
    purchase: {
      id: string;
      status: PaymentStatus;
      metadata: Prisma.JsonValue | null;
    },
    reason: string
  ): Promise<void> {
    if (purchase.status !== PaymentStatus.PENDING) {
      return;
    }

    const now = new Date();
    const retryInfo = this.readRetryInfo(purchase.metadata);
    const nextAttempts = retryInfo.attempts + 1;

    if (nextAttempts >= MAX_RETRY_ATTEMPTS) {
      const finalMetadata = this.mergeMetadata(purchase.metadata, {
        paymentRetry: this.buildRetryInfo(nextAttempts, null, now.toISOString(), reason),
      });

      await tx.coursePurchase.update({
        where: { id: purchase.id },
        data: {
          status: PaymentStatus.FAILED,
          metadata: this.toJson(finalMetadata),
        },
      });

      return;
    }

    const delayMinutes = RETRY_BACKOFF_MINUTES[Math.min(nextAttempts - 1, RETRY_BACKOFF_MINUTES.length - 1)];
    const nextRetryAt = new Date(now.getTime() + delayMinutes * 60 * 1000);

    const metadata = this.mergeMetadata(purchase.metadata, {
      paymentRetry: this.buildRetryInfo(
        nextAttempts,
        nextRetryAt.toISOString(),
        now.toISOString(),
        reason
      ),
    });

    await tx.coursePurchase.update({
      where: { id: purchase.id },
      data: {
        metadata: this.toJson(metadata),
      },
    });
  }

  private calculateAmount(
    basePrice: number,
    discount: {
      type: 'PERCENTAGE' | 'FIXED_AMOUNT';
      value: number;
    } | null
  ): number {
    if (!discount) {
      return basePrice;
    }

    if (discount.type === 'PERCENTAGE') {
      const reduced = Math.round(basePrice - (basePrice * discount.value) / 100);
      return Math.max(0, reduced);
    }

    return Math.max(0, basePrice - discount.value);
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  private readRetryInfo(metadata: Prisma.JsonValue | null): PaymentRetryInfo {
    const root = this.toObject(metadata);
    const retryRaw = this.toObject(root.paymentRetry);

    const attemptsRaw = retryRaw.attempts;
    const attempts =
      typeof attemptsRaw === 'number' && Number.isFinite(attemptsRaw)
        ? attemptsRaw
        : 0;

    const nextRetryAt =
      typeof retryRaw.nextRetryAt === 'string' ? retryRaw.nextRetryAt : null;
    const lastAttemptAt =
      typeof retryRaw.lastAttemptAt === 'string' ? retryRaw.lastAttemptAt : null;
    const lastError = typeof retryRaw.lastError === 'string' ? retryRaw.lastError : null;

    return this.buildRetryInfo(attempts, nextRetryAt, lastAttemptAt, lastError);
  }

  private buildRetryInfo(
    attempts: number,
    nextRetryAt: string | null,
    lastAttemptAt: string | null,
    lastError: string | null
  ): PaymentRetryInfo {
    return {
      attempts,
      nextRetryAt,
      lastAttemptAt,
      lastError,
    };
  }

  private mergeMetadata(
    metadata: Prisma.JsonValue | null,
    patch: Record<string, unknown>
  ): Record<string, unknown> {
    return {
      ...this.toObject(metadata),
      ...patch,
    };
  }

  private toObject(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return value as Record<string, unknown>;
  }

  private toJson(value: Record<string, unknown>): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
  }
}

export const paymentService = new PaymentService();
