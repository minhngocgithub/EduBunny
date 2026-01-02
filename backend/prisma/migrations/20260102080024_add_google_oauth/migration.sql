/*
  Warnings:

  - You are about to alter the column `xpReward` on the `achievements` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `pointsEarned` on the `answers` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedTinyInt`.
  - You are about to alter the column `duration` on the `courses` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `order` on the `courses` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `score` on the `game_scores` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `level` on the `game_scores` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedTinyInt`.
  - You are about to alter the column `duration` on the `game_scores` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `duration` on the `lectures` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `order` on the `lectures` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `watchedSeconds` on the `progress` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `points` on the `questions` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedTinyInt`.
  - You are about to alter the column `order` on the `questions` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `totalPoints` on the `quiz_attempts` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `earnedPoints` on the `quiz_attempts` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `timeSpent` on the `quiz_attempts` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `duration` on the `quizzes` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `passingScore` on the `quizzes` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedTinyInt`.
  - You are about to alter the column `maxAttempts` on the `quizzes` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedTinyInt`.
  - You are about to alter the column `order` on the `quizzes` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `xp` on the `students` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `level` on the `students` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `stars` on the `students` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `streak` on the `students` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - A unique constraint covering the columns `[slug]` on the table `lectures` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `parents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `parents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `lectures_courseId_slug_key` ON `lectures`;

-- AlterTable
ALTER TABLE `achievements` MODIFY `xpReward` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `answers` MODIFY `pointsEarned` TINYINT UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `chat_sessions` ADD COLUMN `lastMessageAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `messageCount` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `courses` ADD COLUMN `avgRating` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `metadata` JSON NULL,
    ADD COLUMN `reviewCount` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    MODIFY `duration` INTEGER UNSIGNED NOT NULL,
    MODIFY `order` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `game_scores` MODIFY `score` INTEGER UNSIGNED NOT NULL,
    MODIFY `level` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    MODIFY `duration` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `lectures` MODIFY `duration` INTEGER UNSIGNED NOT NULL,
    MODIFY `order` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `parents` ADD COLUMN `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `progress` ADD COLUMN `completionRate` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `watchedSeconds` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `questions` MODIFY `points` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    MODIFY `order` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `quiz_attempts` MODIFY `totalPoints` INTEGER UNSIGNED NOT NULL,
    MODIFY `earnedPoints` INTEGER UNSIGNED NOT NULL,
    MODIFY `timeSpent` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `quizzes` ADD COLUMN `settings` JSON NULL,
    MODIFY `duration` INTEGER UNSIGNED NOT NULL,
    MODIFY `passingScore` TINYINT UNSIGNED NOT NULL DEFAULT 70,
    MODIFY `maxAttempts` TINYINT UNSIGNED NOT NULL DEFAULT 3,
    MODIFY `order` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `students` ADD COLUMN `preferences` JSON NULL,
    MODIFY `xp` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    MODIFY `level` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    MODIFY `stars` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    MODIFY `streak` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `googleId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `course_reviews` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `course_reviews_courseId_idx`(`courseId`),
    INDEX `course_reviews_studentId_idx`(`studentId`),
    INDEX `course_reviews_rating_idx`(`rating`),
    UNIQUE INDEX `course_reviews_courseId_studentId_key`(`courseId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('ACHIEVEMENT_UNLOCKED', 'QUIZ_GRADED', 'COURSE_COMPLETED', 'PARENT_MESSAGE', 'SYSTEM') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `data` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_isRead_idx`(`userId`, `isRead`),
    INDEX `notifications_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('LOGIN', 'LOGOUT', 'COURSE_ENROLLED', 'LECTURE_VIEWED', 'QUIZ_ATTEMPTED', 'GAME_PLAYED', 'ACHIEVEMENT_UNLOCKED') NOT NULL,
    `metadata` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `activity_logs_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `chat_sessions_userId_lastMessageAt_idx` ON `chat_sessions`(`userId`, `lastMessageAt`);

-- CreateIndex
CREATE INDEX `courses_avgRating_idx` ON `courses`(`avgRating`);

-- CreateIndex
CREATE INDEX `enrollments_progress_idx` ON `enrollments`(`progress`);

-- CreateIndex
CREATE INDEX `game_scores_studentId_playedAt_idx` ON `game_scores`(`studentId`, `playedAt`);

-- CreateIndex
CREATE INDEX `game_scores_gameId_score_idx` ON `game_scores`(`gameId`, `score`);

-- CreateIndex
CREATE UNIQUE INDEX `lectures_slug_key` ON `lectures`(`slug`);

-- CreateIndex
CREATE INDEX `lectures_slug_idx` ON `lectures`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `parents_email_key` ON `parents`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `parents_phone_key` ON `parents`(`phone`);

-- CreateIndex
CREATE INDEX `parents_email_idx` ON `parents`(`email`);

-- CreateIndex
CREATE INDEX `progress_isCompleted_idx` ON `progress`(`isCompleted`);

-- CreateIndex
CREATE INDEX `questions_order_idx` ON `questions`(`order`);

-- CreateIndex
CREATE INDEX `quiz_attempts_studentId_startedAt_idx` ON `quiz_attempts`(`studentId`, `startedAt`);

-- CreateIndex
CREATE INDEX `quiz_attempts_score_idx` ON `quiz_attempts`(`score`);

-- CreateIndex
CREATE INDEX `refresh_tokens_expiresAt_idx` ON `refresh_tokens`(`expiresAt`);

-- CreateIndex
CREATE INDEX `student_achievements_unlockedAt_idx` ON `student_achievements`(`unlockedAt`);

-- CreateIndex
CREATE INDEX `students_xp_idx` ON `students`(`xp`);

-- CreateIndex
CREATE UNIQUE INDEX `users_googleId_key` ON `users`(`googleId`);

-- CreateIndex
CREATE INDEX `users_isActive_idx` ON `users`(`isActive`);

-- AddForeignKey
ALTER TABLE `course_reviews` ADD CONSTRAINT `course_reviews_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_reviews` ADD CONSTRAINT `course_reviews_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
