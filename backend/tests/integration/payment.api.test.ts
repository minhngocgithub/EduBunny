import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import paymentRoutes from '@modules/payment/payment.routes';
import { paymentService } from '@modules/payment/payment.service';

jest.mock('@modules/payment/payment.service', () => ({
  paymentService: {
    createOrder: jest.fn(),
    processGatewayCallback: jest.fn(),
    processGatewayWebhook: jest.fn(),
    getMyPurchases: jest.fn(),
    getMyEntitlements: jest.fn(),
    getPendingPurchases: jest.fn(),
    getExpiringEntitlements: jest.fn(),
    sendExpiringEntitlementNotifications: jest.fn(),
    reconcilePendingPurchases: jest.fn(),
    processSubscriptionLifecycle: jest.fn(),
  },
}));

jest.mock('@/shared/config/passport.config', () => {
  return {
    authMiddleware: (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No token provided',
        });
      }

      const token = authHeader.substring(7);
      if (token === 'student-token') {
        (req as any).user = {
          userId: 'user-student-1',
          email: 'student@test.com',
          role: 'STUDENT',
        };
        return next();
      }

      if (token === 'admin-token') {
        (req as any).user = {
          userId: 'user-admin-1',
          email: 'admin@test.com',
          role: 'ADMIN',
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    },

    requireStudent: (req: Request, res: Response, next: NextFunction) => {
      if ((req as any).user?.role !== 'STUDENT') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }
      return next();
    },

    requireAdmin: (req: Request, res: Response, next: NextFunction) => {
      if ((req as any).user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }
      return next();
    },
  };
});

describe('Payment API Supertest', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/payments', paymentRoutes);

    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.PAYMENT_STRICT_INVALID_SIGNATURE_RESPONSE;
  });

  it('POST /api/payments/orders creates order for student', async () => {
    (paymentService.createOrder as jest.Mock).mockResolvedValue({
      purchaseId: 'purchase-1',
      gateway: 'MOMO',
      gatewayTransactionId: 'tx-1',
      amount: 100000,
      currency: 'VND',
      paymentUrl: 'http://localhost:3000/checkout/mock?gateway=MOMO&transactionId=tx-1',
      status: 'PENDING',
      createdAt: new Date('2026-04-06T09:00:00.000Z'),
    });

    const response = await request(app)
      .post('/api/payments/orders')
      .set('Authorization', 'Bearer student-token')
      .send({
        courseId: '11111111-1111-1111-1111-111111111111',
        subscriptionPlanId: '22222222-2222-2222-2222-222222222222',
        gateway: 'MOMO',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.purchaseId).toBe('purchase-1');
    expect(paymentService.createOrder).toHaveBeenCalledWith(
      'user-student-1',
      expect.objectContaining({ gateway: 'MOMO' })
    );
  });

  it('POST /api/payments/orders rejects invalid body', async () => {
    await request(app)
      .post('/api/payments/orders')
      .set('Authorization', 'Bearer student-token')
      .send({
        courseId: 'invalid-uuid',
        subscriptionPlanId: '22222222-2222-2222-2222-222222222222',
        gateway: 'MOMO',
      })
      .expect(400);

    expect(paymentService.createOrder).not.toHaveBeenCalled();
  });

  it('POST /api/payments/orders forbids admin role', async () => {
    await request(app)
      .post('/api/payments/orders')
      .set('Authorization', 'Bearer admin-token')
      .send({
        courseId: '11111111-1111-1111-1111-111111111111',
        subscriptionPlanId: '22222222-2222-2222-2222-222222222222',
        gateway: 'MOMO',
      })
      .expect(403);
  });

  it('POST /api/payments/callbacks/:gateway processes callback', async () => {
    (paymentService.processGatewayCallback as jest.Mock).mockResolvedValue({
      gateway: 'MOMO',
      eventType: 'CALLBACK',
      gatewayTransactionId: 'tx-1',
      processed: true,
      duplicate: false,
      purchaseId: 'purchase-1',
      status: 'SUCCESS',
      message: 'Purchase finalized and entitlement granted',
    });

    const response = await request(app)
      .post('/api/payments/callbacks/MOMO')
      .send({
        transactionId: 'tx-1',
        amount: 100000,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(paymentService.processGatewayCallback).toHaveBeenCalledWith('MOMO', {
      transactionId: 'tx-1',
      amount: 100000,
    });
  });

  it('POST /api/payments/callbacks/:gateway validates gateway param', async () => {
    await request(app)
      .post('/api/payments/callbacks/PAYPAL')
      .send({ transactionId: 'tx-1' })
      .expect(400);

    expect(paymentService.processGatewayCallback).not.toHaveBeenCalled();
  });

  it('POST /api/payments/callbacks/:gateway returns 400 for invalid signature in strict mode', async () => {
    process.env.PAYMENT_STRICT_INVALID_SIGNATURE_RESPONSE = 'true';

    (paymentService.processGatewayCallback as jest.Mock).mockResolvedValue({
      gateway: 'MOMO',
      eventType: 'CALLBACK',
      gatewayTransactionId: 'tx-invalid-signature',
      processed: false,
      duplicate: false,
      purchaseId: null,
      status: null,
      message: 'Invalid gateway signature',
      invalidSignature: true,
    });

    const response = await request(app)
      .post('/api/payments/callbacks/MOMO')
      .send({
        gatewayTransactionId: 'tx-invalid-signature',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid gateway signature');
  });

  it('POST /api/payments/webhooks/:gateway processes webhook', async () => {
    (paymentService.processGatewayWebhook as jest.Mock).mockResolvedValue({
      gateway: 'VNPAY',
      eventType: 'WEBHOOK',
      gatewayTransactionId: 'tx-2',
      processed: true,
      duplicate: false,
      purchaseId: 'purchase-2',
      status: 'SUCCESS',
      message: 'Purchase finalized and entitlement granted',
    });

    await request(app)
      .post('/api/payments/webhooks/VNPAY')
      .send({
        vnp_TxnRef: 'tx-2',
        vnp_ResponseCode: '00',
      })
      .expect(200);

    expect(paymentService.processGatewayWebhook).toHaveBeenCalled();
  });

  it('GET /api/payments/me/purchases returns purchase history for student', async () => {
    (paymentService.getMyPurchases as jest.Mock).mockResolvedValue({
      purchases: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });

    const response = await request(app)
      .get('/api/payments/me/purchases?page=1&limit=20')
      .set('Authorization', 'Bearer student-token')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(paymentService.getMyPurchases).toHaveBeenCalledWith('user-student-1', {
      page: 1,
      limit: 20,
    });
  });

  it('GET /api/payments/me/purchases requires authentication', async () => {
    await request(app)
      .get('/api/payments/me/purchases')
      .expect(401);

    expect(paymentService.getMyPurchases).not.toHaveBeenCalled();
  });

  it('GET /api/payments/me/entitlements returns student entitlements', async () => {
    (paymentService.getMyEntitlements as jest.Mock).mockResolvedValue([
      {
        id: 'entitlement-1',
        effectiveStatus: 'ACTIVE',
        canAccessNow: true,
      },
    ]);

    const response = await request(app)
      .get('/api/payments/me/entitlements')
      .set('Authorization', 'Bearer student-token')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(paymentService.getMyEntitlements).toHaveBeenCalledWith('user-student-1');
  });

  it('GET /api/payments/admin/purchases/pending returns pending purchases for admin', async () => {
    (paymentService.getPendingPurchases as jest.Mock).mockResolvedValue([]);

    const response = await request(app)
      .get('/api/payments/admin/purchases/pending?limit=50')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(paymentService.getPendingPurchases).toHaveBeenCalledWith(50);
  });

  it('GET /api/payments/admin/purchases/pending forbids student', async () => {
    await request(app)
      .get('/api/payments/admin/purchases/pending')
      .set('Authorization', 'Bearer student-token')
      .expect(403);

    expect(paymentService.getPendingPurchases).not.toHaveBeenCalled();
  });

  it('GET /api/payments/admin/entitlements/expiring returns expiring entitlements', async () => {
    (paymentService.getExpiringEntitlements as jest.Mock).mockResolvedValue({
      days: 10,
      total: 1,
      entitlements: [{ id: 'entitlement-1' }],
    });

    const response = await request(app)
      .get('/api/payments/admin/entitlements/expiring?days=10&limit=50')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(paymentService.getExpiringEntitlements).toHaveBeenCalledWith({
      days: 10,
      limit: 50,
    });
  });

  it('POST /api/payments/admin/entitlements/expiring/notify dispatches reminders for admin', async () => {
    (paymentService.sendExpiringEntitlementNotifications as jest.Mock).mockResolvedValue({
      scanned: 2,
      inAppSent: 2,
      emailSent: 1,
      skipped: 0,
      failed: 0,
    });

    const response = await request(app)
      .post('/api/payments/admin/entitlements/expiring/notify')
      .set('Authorization', 'Bearer admin-token')
      .send({ days: 5, limit: 20 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(paymentService.sendExpiringEntitlementNotifications).toHaveBeenCalledWith({
      days: 5,
      limit: 20,
    });
  });

  it('POST /api/payments/admin/reconciliation runs reconciliation for admin', async () => {
    (paymentService.reconcilePendingPurchases as jest.Mock).mockResolvedValue({
      scanned: 10,
      updatedToSuccess: 2,
      updatedToFailed: 1,
      stillPending: 7,
      skippedByBackoff: 0,
    });

    const response = await request(app)
      .post('/api/payments/admin/reconciliation')
      .set('Authorization', 'Bearer admin-token')
      .send({ olderThanMinutes: 20, limit: 100 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(paymentService.reconcilePendingPurchases).toHaveBeenCalledWith({
      olderThanMinutes: 20,
      limit: 100,
    });
  });

  it('POST /api/payments/admin/reconciliation validates payload', async () => {
    await request(app)
      .post('/api/payments/admin/reconciliation')
      .set('Authorization', 'Bearer admin-token')
      .send({ olderThanMinutes: -1, limit: 5000 })
      .expect(400);

    expect(paymentService.reconcilePendingPurchases).not.toHaveBeenCalled();
  });

  it('POST /api/payments/admin/lifecycle/run processes subscription lifecycle', async () => {
    (paymentService.processSubscriptionLifecycle as jest.Mock).mockResolvedValue({
      processedAt: '2026-04-13T10:00:00.000Z',
      expiredEntitlements: 3,
      revokedByRefund: 1,
      revokedByCanceled: 1,
      purchasesMarkedRefunded: 1,
    });

    const response = await request(app)
      .post('/api/payments/admin/lifecycle/run')
      .set('Authorization', 'Bearer admin-token')
      .send({
        asOf: '2026-04-13T10:00:00.000Z',
        limit: 200,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(paymentService.processSubscriptionLifecycle).toHaveBeenCalledWith({
      asOf: new Date('2026-04-13T10:00:00.000Z'),
      limit: 200,
    });
  });

  it('POST /api/payments/admin/lifecycle/run validates request body', async () => {
    await request(app)
      .post('/api/payments/admin/lifecycle/run')
      .set('Authorization', 'Bearer admin-token')
      .send({
        asOf: 'invalid-date',
        limit: -10,
      })
      .expect(400);

    expect(paymentService.processSubscriptionLifecycle).not.toHaveBeenCalled();
  });
});
