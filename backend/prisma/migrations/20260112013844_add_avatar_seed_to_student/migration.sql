-- AlterTable
ALTER TABLE `students` ADD COLUMN `avatarSeed` VARCHAR(50) NULL;

-- CreateTable
CREATE TABLE `monitoring_subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NOT NULL,
    `childId` VARCHAR(191) NOT NULL,
    `reportType` ENUM('DAILY', 'WEEKLY') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `monitoring_subscriptions_parentId_idx`(`parentId`),
    INDEX `monitoring_subscriptions_childId_idx`(`childId`),
    UNIQUE INDEX `monitoring_subscriptions_parentId_childId_reportType_key`(`parentId`, `childId`, `reportType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progress_reports` (
    `id` VARCHAR(191) NOT NULL,
    `childId` VARCHAR(191) NOT NULL,
    `reportType` ENUM('DAILY', 'WEEKLY') NOT NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `data` JSON NOT NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `progress_reports_childId_reportType_periodStart_idx`(`childId`, `reportType`, `periodStart`),
    INDEX `progress_reports_childId_idx`(`childId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `monitoring_subscriptions` ADD CONSTRAINT `monitoring_subscriptions_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `parents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
