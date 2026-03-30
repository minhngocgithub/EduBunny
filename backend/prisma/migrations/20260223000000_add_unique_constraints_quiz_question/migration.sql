-- Add unique constraint for courseId + order in Quiz
ALTER TABLE `quizzes` ADD UNIQUE INDEX `quizzes_courseId_order_key`(`courseId`, `order`);

-- Add unique constraint for quizId + order in Question
ALTER TABLE `questions` ADD UNIQUE INDEX `questions_quizId_order_key`(`quizId`, `order`);
