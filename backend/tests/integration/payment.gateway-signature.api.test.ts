import crypto from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';

const mockTx = {
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
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  enrollment: {
    upsert: jest.fn(),
  },
};

const mockPrisma = {
  $transaction: jest.fn(),
};

jest.mock('@prisma/client/index', () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;

    constructor(message: string, options: { code: string }) {
      super(message);
      this.code = options.code;
      Object.setPrototypeOf(this, PrismaClientKnownRequestError.prototype);
    }
  }

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

jest.mock('@/shared/utils/logger.utils', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/shared/config/passport.config', () => ({
  authMiddleware: (_req: Request, _res: Response, next: NextFunction) => next(),
  requireStudent: (_req: Request, _res: Response, next: NextFunction) => next(),
  requireAdmin: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

import paymentRoutes from '@modules/payment/payment.routes';

function signHmac(
  algorithm: 'sha256' | 'sha512',
  secret: string,
  rawData: string
): string {
  return crypto.createHmac(algorithm, secret).update(rawData, 'utf8').digest('hex');
}

describe('Payment callback/webhook signature integration', () => {
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

    process.env.PAYMENT_MOMO_SECRET_KEY = 'momo-secret-test';
    process.env.PAYMENT_ZALOPAY_KEY2 = 'zalopay-secret-test';
    process.env.PAYMENT_VNPAY_HASH_SECRET = 'vnpay-secret-test';
    process.env.PAYMENT_STRICT_INVALID_SIGNATURE_RESPONSE = 'true';

    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

    mockTx.paymentEvent.create.mockResolvedValue({ id: 'evt-1' });
    mockTx.paymentEvent.update.mockResolvedValue({ id: 'evt-1' });
    mockTx.coursePurchase.update.mockResolvedValue({ id: 'purchase-1' });
    mockTx.subscriptionPlan.findUnique.mockResolvedValue({ durationDays: 30 });
    mockTx.courseEntitlement.findFirst.mockResolvedValue(null);
    mockTx.courseEntitlement.create.mockResolvedValue({ id: 'entitlement-1' });
    mockTx.enrollment.upsert.mockResolvedValue({ id: 'enrollment-1' });
  });

  afterAll(() => {
    delete process.env.PAYMENT_MOMO_SECRET_KEY;
    delete process.env.PAYMENT_ZALOPAY_KEY2;
    delete process.env.PAYMENT_VNPAY_HASH_SECRET;
    delete process.env.PAYMENT_STRICT_INVALID_SIGNATURE_RESPONSE;
  });

  it('processes MOMO callback with valid signature', async () => {
    mockTx.coursePurchase.findFirst.mockResolvedValue({
      id: 'purchase-momo-1',
      studentId: 'student-1',
      courseId: 'course-1',
      subscriptionPlanId: 'plan-1',
      status: 'PENDING',
      amount: 120000,
      metadata: null,
    });

    const signatureData = 'gatewayTransactionId=tx-momo-1&resultCode=0&amount=120000';
    const signature = signHmac(
      'sha256',
      process.env.PAYMENT_MOMO_SECRET_KEY as string,
      signatureData
    );

    const response = await request(app)
      .post('/api/payments/callbacks/MOMO')
      .send({
        gatewayTransactionId: 'tx-momo-1',
        resultCode: '0',
        amount: 120000,
        signatureData,
        signature,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.processed).toBe(true);
    expect(response.body.data.status).toBe('SUCCESS');
    expect(response.body.data.purchaseId).toBe('purchase-momo-1');

    expect(mockTx.coursePurchase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'purchase-momo-1' },
        data: expect.objectContaining({
          status: 'SUCCESS',
        }),
      })
    );
  });

  it('rejects callback when signature is invalid', async () => {
    const response = await request(app)
      .post('/api/payments/callbacks/MOMO')
      .send({
        gatewayTransactionId: 'tx-momo-invalid',
        resultCode: '0',
        amount: 100000,
        signatureData: 'gatewayTransactionId=tx-momo-invalid&resultCode=0&amount=100000',
        signature: 'invalid-signature',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid gateway signature');
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('processes VNPAY webhook with valid SHA512 signature and scaled amount', async () => {
    mockTx.coursePurchase.findFirst.mockResolvedValue({
      id: 'purchase-vnp-1',
      studentId: 'student-2',
      courseId: 'course-2',
      subscriptionPlanId: 'plan-2',
      status: 'PENDING',
      amount: 125000,
      metadata: null,
    });

    const secureHashData = 'vnp_TxnRef=tx-vnp-1&vnp_ResponseCode=00&vnp_Amount=12500000';
    const secureHash = signHmac(
      'sha512',
      process.env.PAYMENT_VNPAY_HASH_SECRET as string,
      secureHashData
    );

    const response = await request(app)
      .post('/api/payments/webhooks/VNPAY')
      .send({
        vnp_TxnRef: 'tx-vnp-1',
        vnp_ResponseCode: '00',
        vnp_Amount: '12500000',
        vnp_SecureHashType: 'SHA512',
        secureHashData,
        vnp_SecureHash: secureHash,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.processed).toBe(true);
    expect(response.body.data.status).toBe('SUCCESS');
    expect(response.body.data.purchaseId).toBe('purchase-vnp-1');
  });

  it('processes ZALOPAY webhook with valid signature', async () => {
    mockTx.coursePurchase.findFirst.mockResolvedValue({
      id: 'purchase-zalo-1',
      studentId: 'student-3',
      courseId: 'course-3',
      subscriptionPlanId: 'plan-3',
      status: 'PENDING',
      amount: 99000,
      metadata: null,
    });

    const data = 'appTransId=tx-zalo-1&returnCode=1&amount=99000';
    const mac = signHmac(
      'sha256',
      process.env.PAYMENT_ZALOPAY_KEY2 as string,
      data
    );

    const response = await request(app)
      .post('/api/payments/webhooks/ZALOPAY')
      .send({
        appTransId: 'tx-zalo-1',
        returnCode: '1',
        amount: 99000,
        data,
        mac,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.processed).toBe(true);
    expect(response.body.data.status).toBe('SUCCESS');
    expect(response.body.data.purchaseId).toBe('purchase-zalo-1');
  });

  it('rejects webhook when gateway secret is missing', async () => {
    delete process.env.PAYMENT_VNPAY_HASH_SECRET;

    const response = await request(app)
      .post('/api/payments/webhooks/VNPAY')
      .send({
        vnp_TxnRef: 'tx-vnp-missing-secret',
        vnp_ResponseCode: '00',
        vnp_Amount: '10000000',
        secureHashData: 'vnp_TxnRef=tx-vnp-missing-secret&vnp_ResponseCode=00&vnp_Amount=10000000',
        vnp_SecureHash: 'abc',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Missing gateway secret configuration');
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();

    process.env.PAYMENT_VNPAY_HASH_SECRET = 'vnpay-secret-test';
  });
});
