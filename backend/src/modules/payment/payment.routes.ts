import { Router } from 'express';
import { paymentController } from './payment.controller';
import {
  CreatePaymentOrderSchema,
  ExpiringEntitlementNotificationRequestSchema,
  ExpiringEntitlementsQuerySchema,
  GatewayParamSchema,
  PaymentHistoryQuerySchema,
  PendingPurchasesQuerySchema,
  ProcessGatewayEventSchema,
  ReconciliationRequestSchema,
  SubscriptionLifecycleRequestSchema,
} from './payment.dto';
import {
  authMiddleware,
  requireAdmin,
  requireStudent,
} from '@/shared/config/passport.config';
import {
  validateParams,
  validateQuery,
  validateRequest,
} from '@/shared/middleware/validation.middleware';

const router = Router();

router.post(
  '/orders',
  authMiddleware,
  requireStudent,
  validateRequest(CreatePaymentOrderSchema),
  paymentController.createOrder.bind(paymentController)
);

router.post(
  '/callbacks/:gateway',
  validateParams(GatewayParamSchema),
  validateRequest(ProcessGatewayEventSchema),
  paymentController.handleCallback.bind(paymentController)
);

router.post(
  '/webhooks/:gateway',
  validateParams(GatewayParamSchema),
  validateRequest(ProcessGatewayEventSchema),
  paymentController.handleWebhook.bind(paymentController)
);

router.get(
  '/me/purchases',
  authMiddleware,
  requireStudent,
  validateQuery(PaymentHistoryQuerySchema),
  paymentController.getMyPurchases.bind(paymentController)
);

router.get(
  '/me/entitlements',
  authMiddleware,
  requireStudent,
  paymentController.getMyEntitlements.bind(paymentController)
);

router.get(
  '/admin/purchases/pending',
  authMiddleware,
  requireAdmin,
  validateQuery(PendingPurchasesQuerySchema),
  paymentController.getPendingPurchases.bind(paymentController)
);

router.post(
  '/admin/reconciliation',
  authMiddleware,
  requireAdmin,
  validateRequest(ReconciliationRequestSchema),
  paymentController.runReconciliation.bind(paymentController)
);

router.get(
  '/admin/entitlements/expiring',
  authMiddleware,
  requireAdmin,
  validateQuery(ExpiringEntitlementsQuerySchema),
  paymentController.getExpiringEntitlements.bind(paymentController)
);

router.post(
  '/admin/entitlements/expiring/notify',
  authMiddleware,
  requireAdmin,
  validateRequest(ExpiringEntitlementNotificationRequestSchema),
  paymentController.notifyExpiringEntitlements.bind(paymentController)
);

router.post(
  '/admin/lifecycle/run',
  authMiddleware,
  requireAdmin,
  validateRequest(SubscriptionLifecycleRequestSchema),
  paymentController.runSubscriptionLifecycle.bind(paymentController)
);

export default router;
