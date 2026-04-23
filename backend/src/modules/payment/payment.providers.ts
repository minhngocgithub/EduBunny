import crypto from 'crypto';
import {
  CoursePurchase,
  PaymentGateway,
  PaymentStatus,
} from '@prisma/client/index';
import {
  GatewayCreateOrderPayload,
  GatewayCreateOrderResult,
  GatewayStatusResult,
  GatewayVerificationResult,
} from './payment.types';

interface PaymentProviderAdapter {
  createOrder(payload: GatewayCreateOrderPayload): Promise<GatewayCreateOrderResult>;
  verifyGatewayEvent(payload: Record<string, unknown>): GatewayVerificationResult;
  queryOrderStatus(purchase: CoursePurchase): Promise<GatewayStatusResult>;
}

type HashAlgorithm = 'sha256' | 'sha512';

interface SignatureVerificationConfig {
  secretEnvKeys: string[];
  signatureKeys: string[];
  rawDataKeys?: string[];
  ignoreKeys?: string[];
  defaultAlgorithm: HashAlgorithm;
  algorithmResolver?: (payload: Record<string, unknown>) => HashAlgorithm;
}

interface SignatureVerificationResult {
  isValid: boolean;
  errorMessage?: string;
}

const MOCK_CHECKOUT_BASE_URL =
  process.env.PAYMENT_MOCK_CHECKOUT_URL || 'http://localhost:3000/checkout/mock';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ALLOW_INSECURE_SIGNATURE =
  process.env.PAYMENT_ALLOW_INSECURE_SIGNATURE === 'true' && !IS_PRODUCTION;

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function readString(payload: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const raw = payload[key];
    if (typeof raw === 'string' && raw.trim().length > 0) {
      return raw.trim();
    }

    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return String(raw);
    }
  }

  return null;
}

function readEnv(keys: string[]): string | null {
  for (const key of keys) {
    const raw = process.env[key];
    if (typeof raw === 'string' && raw.trim().length > 0) {
      return raw.trim();
    }
  }

  return null;
}

function normalizeSignature(value: string): string {
  return value.trim().toLowerCase();
}

function signatureEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(normalizeSignature(left), 'utf8');
  const rightBuffer = Buffer.from(normalizeSignature(right), 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortObject(item));
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};

    for (const key of Object.keys(input).sort()) {
      output[key] = sortObject(input[key]);
    }

    return output;
  }

  return value;
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(sortObject(value));
  }

  return String(value);
}

function buildCanonicalPayload(payload: Record<string, unknown>, ignoreKeys: string[]): string {
  const ignored = new Set(ignoreKeys.map((key) => key.toLowerCase()));

  return Object.keys(payload)
    .filter((key) => {
      if (ignored.has(key.toLowerCase())) {
        return false;
      }

      const value = payload[key];
      return value !== undefined && value !== null;
    })
    .sort()
    .map((key) => `${key}=${stringifyValue(payload[key])}`)
    .join('&');
}

function buildHmac(algorithm: HashAlgorithm, secret: string, input: string): string {
  return crypto.createHmac(algorithm, secret).update(input, 'utf8').digest('hex');
}

function resolveVNPayAlgorithm(payload: Record<string, unknown>): HashAlgorithm {
  const hashType = readString(payload, ['vnp_SecureHashType', 'secureHashType']);
  if (hashType?.toUpperCase() === 'SHA256') {
    return 'sha256';
  }

  return 'sha512';
}

function resolveVNPayAmount(payload: Record<string, unknown>): number | null {
  const direct = readNumber(payload, ['amount']);
  if (direct !== null) {
    return direct;
  }

  const rawVNPayAmount = readNumber(payload, ['vnp_Amount']);
  if (rawVNPayAmount === null) {
    return null;
  }

  // VNPAY commonly sends amount scaled by 100.
  return Math.round(rawVNPayAmount / 100);
}

function parseVNPayDate(raw: string): Date | null {
  const normalized = raw.trim();
  const match = normalized.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second] = match;
  const parsed = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )
  );

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolveVNPayPaidAt(payload: Record<string, unknown>): Date | null {
  const fromStandardKeys = readDate(payload, ['paidAt']);
  if (fromStandardKeys) {
    return fromStandardKeys;
  }

  const rawVNPayDate = readString(payload, ['vnp_PayDate']);
  if (!rawVNPayDate) {
    return null;
  }

  return parseVNPayDate(rawVNPayDate);
}

function readNumber(payload: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const raw = payload[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return raw;
    }

    if (typeof raw === 'string') {
      const value = Number(raw);
      if (Number.isFinite(value)) {
        return value;
      }
    }
  }

  return null;
}

function readDate(payload: Record<string, unknown>, keys: string[]): Date | null {
  const raw = readString(payload, keys);
  if (!raw) {
    return null;
  }

  if (/^\d+$/.test(raw)) {
    const numeric = Number(raw);

    if (Number.isFinite(numeric)) {
      if (raw.length >= 13) {
        const millisecondsDate = new Date(numeric);
        if (!Number.isNaN(millisecondsDate.getTime())) {
          return millisecondsDate;
        }
      }

      if (raw.length === 10) {
        const secondsDate = new Date(numeric * 1000);
        if (!Number.isNaN(secondsDate.getTime())) {
          return secondsDate;
        }
      }
    }
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function buildMockUrl(gateway: PaymentGateway, transactionId: string): string {
  const separator = MOCK_CHECKOUT_BASE_URL.includes('?') ? '&' : '?';
  return `${MOCK_CHECKOUT_BASE_URL}${separator}gateway=${gateway}&transactionId=${transactionId}`;
}

function parseGenericPaymentStatus(payload: Record<string, unknown>): PaymentStatus | null {
  const status = readString(payload, ['status', 'paymentStatus', 'transactionStatus']);
  if (!status) {
    return null;
  }

  const normalized = status.toUpperCase();
  if (normalized === PaymentStatus.SUCCESS) return PaymentStatus.SUCCESS;
  if (normalized === PaymentStatus.PENDING) return PaymentStatus.PENDING;
  if (normalized === PaymentStatus.FAILED) return PaymentStatus.FAILED;
  if (normalized === PaymentStatus.CANCELED) return PaymentStatus.CANCELED;
  if (normalized === PaymentStatus.REFUNDED) return PaymentStatus.REFUNDED;

  return null;
}

abstract class BasePaymentProvider implements PaymentProviderAdapter {
  constructor(
    private readonly gateway: PaymentGateway,
    private readonly signatureConfig: SignatureVerificationConfig
  ) {}

  async createOrder(payload: GatewayCreateOrderPayload): Promise<GatewayCreateOrderResult> {
    const uniqueSuffix = crypto.randomUUID().split('-')[0];
    const gatewayTransactionId = `${this.gateway}-${Date.now()}-${uniqueSuffix}`;

    return {
      gatewayTransactionId,
      paymentUrl: buildMockUrl(this.gateway, gatewayTransactionId),
      rawPayload: {
        ...payload,
        gateway: this.gateway,
        gatewayTransactionId,
      },
    };
  }

  abstract verifyGatewayEvent(payload: Record<string, unknown>): GatewayVerificationResult;

  async queryOrderStatus(purchase: CoursePurchase): Promise<GatewayStatusResult> {
    const metadata = asObject(purchase.metadata);
    const simulatedStatus = readString(metadata, ['mockGatewayStatus']);
    const normalizedStatus = simulatedStatus ? simulatedStatus.toUpperCase() : null;

    let status: PaymentStatus = PaymentStatus.PENDING;
    if (normalizedStatus === PaymentStatus.SUCCESS) status = PaymentStatus.SUCCESS;
    if (normalizedStatus === PaymentStatus.FAILED) status = PaymentStatus.FAILED;
    if (normalizedStatus === PaymentStatus.CANCELED) status = PaymentStatus.CANCELED;

    return {
      gatewayTransactionId: purchase.gatewayTransactionId || '',
      status,
      amount: purchase.amount,
      paidAt: status === PaymentStatus.SUCCESS ? new Date() : null,
      rawPayload: {
        source: 'reconciliation',
        gateway: this.gateway,
        purchaseId: purchase.id,
        gatewayTransactionId: purchase.gatewayTransactionId,
        status,
      },
    };
  }

  protected buildVerificationResult(
    payload: Record<string, unknown>,
    transactionKeys: string[],
    amountKeys: string[],
    dateKeys: string[],
    statusResolver: (input: Record<string, unknown>) => PaymentStatus,
    options?: {
      amountResolver?: (input: Record<string, unknown>) => number | null;
      dateResolver?: (input: Record<string, unknown>) => Date | null;
    }
  ): GatewayVerificationResult {
    const signatureResult = this.verifySignature(payload);
    if (!signatureResult.isValid) {
      return {
        isValid: false,
        gatewayTransactionId: '',
        status: PaymentStatus.FAILED,
        amount: null,
        paidAt: null,
        rawPayload: payload,
        errorMessage: signatureResult.errorMessage || 'Invalid gateway signature',
      };
    }

    const gatewayTransactionId = readString(payload, transactionKeys);

    if (!gatewayTransactionId) {
      return {
        isValid: false,
        gatewayTransactionId: '',
        status: PaymentStatus.FAILED,
        amount: null,
        paidAt: null,
        rawPayload: payload,
        errorMessage: 'Missing gateway transaction ID',
      };
    }

    return {
      isValid: true,
      gatewayTransactionId,
      status: statusResolver(payload),
      amount: options?.amountResolver
        ? options.amountResolver(payload)
        : readNumber(payload, amountKeys),
      paidAt: options?.dateResolver
        ? options.dateResolver(payload)
        : readDate(payload, dateKeys),
      rawPayload: payload,
    };
  }

  private verifySignature(payload: Record<string, unknown>): SignatureVerificationResult {
    if (ALLOW_INSECURE_SIGNATURE) {
      return { isValid: true };
    }

    const signature = readString(payload, this.signatureConfig.signatureKeys);
    if (!signature) {
      return {
        isValid: false,
        errorMessage: 'Missing gateway signature',
      };
    }

    const secret = readEnv(this.signatureConfig.secretEnvKeys);
    if (!secret) {
      return {
        isValid: false,
        errorMessage: `Missing gateway secret configuration (${this.signatureConfig.secretEnvKeys[0]})`,
      };
    }

    const rawData = readString(payload, this.signatureConfig.rawDataKeys || []);
    const signaturePayload =
      rawData ||
      buildCanonicalPayload(payload, [
        ...this.signatureConfig.signatureKeys,
        ...(this.signatureConfig.rawDataKeys || []),
        ...(this.signatureConfig.ignoreKeys || []),
      ]);

    if (!signaturePayload) {
      return {
        isValid: false,
        errorMessage: 'Missing signature payload for verification',
      };
    }

    const algorithm = this.signatureConfig.algorithmResolver
      ? this.signatureConfig.algorithmResolver(payload)
      : this.signatureConfig.defaultAlgorithm;

    const expected = buildHmac(algorithm, secret, signaturePayload);

    if (!signatureEquals(signature, expected)) {
      return {
        isValid: false,
        errorMessage: 'Invalid gateway signature',
      };
    }

    return { isValid: true };
  }
}

class MomoPaymentProvider extends BasePaymentProvider {
  constructor() {
    super(PaymentGateway.MOMO, {
      secretEnvKeys: ['PAYMENT_MOMO_SECRET_KEY'],
      signatureKeys: ['signature', 'partnerSignature'],
      rawDataKeys: ['signatureData', 'rawSignature'],
      defaultAlgorithm: 'sha256',
    });
  }

  verifyGatewayEvent(payload: Record<string, unknown>): GatewayVerificationResult {
    const statusResolver = (input: Record<string, unknown>): PaymentStatus => {
      const generic = parseGenericPaymentStatus(input);
      if (generic) return generic;

      const resultCode = readString(input, ['resultCode']);
      if (resultCode === '0') return PaymentStatus.SUCCESS;
      if (resultCode === '1000') return PaymentStatus.PENDING;
      if (resultCode === '1006') return PaymentStatus.CANCELED;
      return PaymentStatus.FAILED;
    };

    return this.buildVerificationResult(
      payload,
      ['gatewayTransactionId', 'transactionId', 'transId', 'orderId'],
      ['amount', 'payAmount'],
      ['paidAt', 'responseTime'],
      statusResolver
    );
  }
}

class ZaloPayProvider extends BasePaymentProvider {
  constructor() {
    super(PaymentGateway.ZALOPAY, {
      secretEnvKeys: ['PAYMENT_ZALOPAY_KEY2'],
      signatureKeys: ['mac', 'signature'],
      rawDataKeys: ['data', 'rawSignature'],
      defaultAlgorithm: 'sha256',
    });
  }

  verifyGatewayEvent(payload: Record<string, unknown>): GatewayVerificationResult {
    const statusResolver = (input: Record<string, unknown>): PaymentStatus => {
      const generic = parseGenericPaymentStatus(input);
      if (generic) return generic;

      const returnCode = readString(input, ['returnCode', 'zpTransStatus']);
      if (returnCode === '1') return PaymentStatus.SUCCESS;
      if (returnCode === '2') return PaymentStatus.PENDING;
      if (returnCode === '3') return PaymentStatus.CANCELED;
      return PaymentStatus.FAILED;
    };

    return this.buildVerificationResult(
      payload,
      ['gatewayTransactionId', 'appTransId', 'zpTransId', 'transactionId'],
      ['amount'],
      ['paidAt', 'serverTime'],
      statusResolver
    );
  }
}

class VNPayProvider extends BasePaymentProvider {
  constructor() {
    super(PaymentGateway.VNPAY, {
      secretEnvKeys: ['PAYMENT_VNPAY_HASH_SECRET'],
      signatureKeys: ['vnp_SecureHash', 'secureHash'],
      rawDataKeys: ['secureHashData', 'rawSignature'],
      ignoreKeys: ['vnp_SecureHashType'],
      defaultAlgorithm: 'sha512',
      algorithmResolver: resolveVNPayAlgorithm,
    });
  }

  verifyGatewayEvent(payload: Record<string, unknown>): GatewayVerificationResult {
    const statusResolver = (input: Record<string, unknown>): PaymentStatus => {
      const generic = parseGenericPaymentStatus(input);
      if (generic) return generic;

      const responseCode = readString(input, ['vnp_ResponseCode', 'responseCode']);
      if (responseCode === '00') return PaymentStatus.SUCCESS;
      if (responseCode === '24') return PaymentStatus.CANCELED;
      if (responseCode === '09') return PaymentStatus.PENDING;
      return PaymentStatus.FAILED;
    };

    return this.buildVerificationResult(
      payload,
      ['gatewayTransactionId', 'vnp_TxnRef', 'transactionId'],
      ['vnp_Amount', 'amount'],
      ['paidAt', 'vnp_PayDate'],
      statusResolver,
      {
        amountResolver: resolveVNPayAmount,
        dateResolver: resolveVNPayPaidAt,
      }
    );
  }
}

const providers: Record<PaymentGateway, PaymentProviderAdapter> = {
  [PaymentGateway.MOMO]: new MomoPaymentProvider(),
  [PaymentGateway.ZALOPAY]: new ZaloPayProvider(),
  [PaymentGateway.VNPAY]: new VNPayProvider(),
};

export function getPaymentProviderAdapter(gateway: PaymentGateway): PaymentProviderAdapter {
  return providers[gateway];
}
