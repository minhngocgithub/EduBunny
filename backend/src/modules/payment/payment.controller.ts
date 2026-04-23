import { NextFunction, Request, Response } from 'express';
import { PaymentGateway } from '@prisma/client/index';
import { errorResponse, successResponse } from '@/shared/utils/response.utils';
import { paymentService } from './payment.service';
import {
  CreatePaymentOrderDTO,
  ExpiringEntitlementNotificationRequestDTO,
  ExpiringEntitlementsQueryDTO,
  GatewayParamSchema,
  PaymentHistoryQueryDTO,
  PendingPurchasesQueryDTO,
  ProcessGatewayEventDTO,
  ReconciliationRequestDTO,
  SubscriptionLifecycleRequestDTO,
} from './payment.dto';
import { ProcessGatewayEventResult } from './payment.types';

export class PaymentController {
  private shouldRejectInvalidGatewaySignature(): boolean {
    const explicitMode = process.env.PAYMENT_STRICT_INVALID_SIGNATURE_RESPONSE;
    if (explicitMode === 'true') {
      return true;
    }

    if (explicitMode === 'false') {
      return false;
    }

    return process.env.NODE_ENV === 'production';
  }

  private isInvalidSignatureResult(result: ProcessGatewayEventResult): boolean {
    if (result.invalidSignature === true) {
      return true;
    }

    return !result.processed && /signature|secret/i.test(result.message);
  }

  private rejectInvalidSignatureResult(res: Response, result: ProcessGatewayEventResult): boolean {
    if (!this.shouldRejectInvalidGatewaySignature()) {
      return false;
    }

    if (!this.isInvalidSignatureResult(result)) {
      return false;
    }

    errorResponse(res, { message: result.message }, 400);
    return true;
  }

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new Error('Unauthorized');
      }

      const payload = req.body as CreatePaymentOrderDTO;
      const result = await paymentService.createOrder(req.user.userId, payload);

      successResponse(
        res,
        {
          message: 'Payment order created successfully',
          data: result,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async handleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gateway } = GatewayParamSchema.parse(req.params);
      const payload = req.body as ProcessGatewayEventDTO;
      const result = await paymentService.processGatewayCallback(gateway as PaymentGateway, payload);

      if (this.rejectInvalidSignatureResult(res, result)) {
        return;
      }

      successResponse(res, {
        message: 'Gateway callback processed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gateway } = GatewayParamSchema.parse(req.params);
      const payload = req.body as ProcessGatewayEventDTO;
      const result = await paymentService.processGatewayWebhook(gateway as PaymentGateway, payload);

      if (this.rejectInvalidSignatureResult(res, result)) {
        return;
      }

      successResponse(res, {
        message: 'Gateway webhook processed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyPurchases(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new Error('Unauthorized');
      }

      const query = req.query as unknown as PaymentHistoryQueryDTO;
      const result = await paymentService.getMyPurchases(req.user.userId, query);

      successResponse(res, {
        message: 'Payment purchase history retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyEntitlements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new Error('Unauthorized');
      }

      const result = await paymentService.getMyEntitlements(req.user.userId);

      successResponse(res, {
        message: 'Entitlements retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async runReconciliation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as ReconciliationRequestDTO;
      const result = await paymentService.reconcilePendingPurchases(payload);

      successResponse(res, {
        message: 'Payment reconciliation completed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async runSubscriptionLifecycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as SubscriptionLifecycleRequestDTO;
      const result = await paymentService.processSubscriptionLifecycle(payload);

      successResponse(res, {
        message: 'Subscription lifecycle processing completed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingPurchases(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as PendingPurchasesQueryDTO;
      const result = await paymentService.getPendingPurchases(query.limit);

      successResponse(res, {
        message: 'Pending purchases retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpiringEntitlements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ExpiringEntitlementsQueryDTO;
      const result = await paymentService.getExpiringEntitlements(query);

      successResponse(res, {
        message: 'Expiring entitlements retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async notifyExpiringEntitlements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as ExpiringEntitlementNotificationRequestDTO;
      const result = await paymentService.sendExpiringEntitlementNotifications(payload);

      successResponse(res, {
        message: 'Expiring entitlement notifications dispatched successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
