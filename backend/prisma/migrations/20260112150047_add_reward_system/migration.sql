-- AlterTable
ALTER TABLE `students` ADD COLUMN `coins` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `reward_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `type` ENUM('EARN', 'SPEND', 'BONUS', 'PENALTY', 'REFUND') NOT NULL,
    `category` ENUM('LESSON_COMPLETE', 'QUIZ_COMPLETE', 'GAME_PLAY', 'STREAK_BONUS', 'LEVEL_UP', 'SHOP_PURCHASE', 'ACHIEVEMENT_UNLOCK', 'AI_CHAT', 'DAILY_LOGIN') NOT NULL,
    `amount` INTEGER NOT NULL,
    `currency` ENUM('XP', 'COIN', 'STAR') NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reward_transactions_studentId_createdAt_idx`(`studentId`, `createdAt`),
    INDEX `reward_transactions_category_idx`(`category`),
    INDEX `reward_transactions_currency_idx`(`currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shop_items` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('AVATAR', 'STICKER', 'BADGE', 'STREAK_SHIELD', 'THEME') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,
    `currency` ENUM('XP', 'COIN', 'STAR') NOT NULL,
    `requiredLevel` INTEGER UNSIGNED NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `shop_items_type_isActive_idx`(`type`, `isActive`),
    INDEX `shop_items_currency_idx`(`currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shop_purchases` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,
    `currency` ENUM('XP', 'COIN', 'STAR') NOT NULL,
    `purchasedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `shop_purchases_studentId_purchasedAt_idx`(`studentId`, `purchasedAt`),
    INDEX `shop_purchases_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `streak_shields` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `streak_shields_studentId_expiresAt_idx`(`studentId`, `expiresAt`),
    INDEX `streak_shields_usedAt_idx`(`usedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reward_transactions` ADD CONSTRAINT `reward_transactions_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shop_purchases` ADD CONSTRAINT `shop_purchases_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shop_purchases` ADD CONSTRAINT `shop_purchases_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `shop_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `streak_shields` ADD CONSTRAINT `streak_shields_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
