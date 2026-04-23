-- CreateTable
CREATE TABLE `course_pricing` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `basePrice` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `currency` ENUM('VND') NOT NULL DEFAULT 'VND',
    `saleStartAt` DATETIME(3) NULL,
    `saleEndAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `course_pricing_courseId_key`(`courseId`),
    INDEX `course_pricing_isActive_idx`(`isActive`),
    INDEX `course_pricing_saleStartAt_saleEndAt_idx`(`saleStartAt`, `saleEndAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_plans` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `durationDays` INTEGER UNSIGNED NOT NULL,
    `priceAmount` INTEGER UNSIGNED NOT NULL,
    `currency` ENUM('VND') NOT NULL DEFAULT 'VND',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscription_plans_courseId_name_key`(`courseId`, `name`),
    INDEX `subscription_plans_courseId_isActive_idx`(`courseId`, `isActive`),
    INDEX `subscription_plans_durationDays_idx`(`durationDays`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_discounts` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `type` ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    `value` INTEGER UNSIGNED NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `course_discounts_courseId_isActive_idx`(`courseId`, `isActive`),
    INDEX `course_discounts_startsAt_endsAt_idx`(`startsAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_purchases` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `subscriptionPlanId` VARCHAR(191) NULL,
    `gateway` ENUM('MOMO', 'ZALOPAY', 'VNPAY') NOT NULL,
    `gatewayTransactionId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `amount` INTEGER UNSIGNED NOT NULL,
    `currency` ENUM('VND') NOT NULL DEFAULT 'VND',
    `paidAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `course_purchases_gateway_gatewayTransactionId_key`(`gateway`, `gatewayTransactionId`),
    INDEX `course_purchases_studentId_createdAt_idx`(`studentId`, `createdAt`),
    INDEX `course_purchases_courseId_status_idx`(`courseId`, `status`),
    INDEX `course_purchases_gateway_gatewayTransactionId_idx`(`gateway`, `gatewayTransactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_entitlements` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `purchaseId` VARCHAR(191) NULL,
    `source` ENUM('LEGACY_ENROLLMENT', 'FREE_COURSE', 'PURCHASE', 'ADMIN_GRANT') NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'REVOKED') NOT NULL DEFAULT 'ACTIVE',
    `startsAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `course_entitlements_studentId_courseId_source_key`(`studentId`, `courseId`, `source`),
    UNIQUE INDEX `course_entitlements_purchaseId_key`(`purchaseId`),
    INDEX `course_entitlements_studentId_status_expiresAt_idx`(`studentId`, `status`, `expiresAt`),
    INDEX `course_entitlements_courseId_status_idx`(`courseId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_refunds` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `amount` INTEGER UNSIGNED NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reason` TEXT NULL,
    `processedBy` VARCHAR(191) NULL,
    `processedAt` DATETIME(3) NULL,
    `refundedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `course_refunds_purchaseId_status_idx`(`purchaseId`, `status`),
    INDEX `course_refunds_studentId_createdAt_idx`(`studentId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_events` (
    `id` VARCHAR(191) NOT NULL,
    `gateway` ENUM('MOMO', 'ZALOPAY', 'VNPAY') NOT NULL,
    `gatewayTransactionId` VARCHAR(191) NOT NULL,
    `eventType` ENUM('CALLBACK', 'WEBHOOK', 'RECONCILIATION') NOT NULL,
    `payload` JSON NOT NULL,
    `processedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payment_events_gatewayTransactionId_eventType_key`(`gatewayTransactionId`, `eventType`),
    INDEX `payment_events_gateway_createdAt_idx`(`gateway`, `createdAt`),
    INDEX `payment_events_processedAt_idx`(`processedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_pricing` ADD CONSTRAINT `course_pricing_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_plans` ADD CONSTRAINT `subscription_plans_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_discounts` ADD CONSTRAINT `course_discounts_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_purchases` ADD CONSTRAINT `course_purchases_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_purchases` ADD CONSTRAINT `course_purchases_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_purchases` ADD CONSTRAINT `course_purchases_subscriptionPlanId_fkey` FOREIGN KEY (`subscriptionPlanId`) REFERENCES `subscription_plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_entitlements` ADD CONSTRAINT `course_entitlements_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_entitlements` ADD CONSTRAINT `course_entitlements_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_entitlements` ADD CONSTRAINT `course_entitlements_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `course_purchases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_refunds` ADD CONSTRAINT `course_refunds_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `course_purchases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_refunds` ADD CONSTRAINT `course_refunds_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
