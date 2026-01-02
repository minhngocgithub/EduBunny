/* eslint-disable no-console, @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean database (optional - comment out in production)
  // await prisma.chatMessage.deleteMany();
  // await prisma.chatSession.deleteMany();
  // ... delete all tables

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  void await prisma.user.create({
    data: {
      email: 'admin@learningplatform.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Admin user created');

  // 2. Create Parent Users
  const parent1Password = await bcrypt.hash('parent123', 10);
  const parent1User = await prisma.user.create({
    data: {
      email: 'parent1@example.com',
      password: parent1Password,
      role: 'PARENT',
      isActive: true,
      emailVerified: true,
      parent: {
        create: {
          firstName: 'Nguyen Van',
          lastName: 'An',
          phone: '0901234567',
        },
      },
    },
    include: { parent: true },
  });
  console.log('✅ Parent user created');

  // 3. Create Student Users
  const student1Password = await bcrypt.hash('student123', 10);
  void await prisma.user.create({
    data: {
      email: 'student1@example.com',
      password: student1Password,
      role: 'STUDENT',
      isActive: true,
      emailVerified: true,
      student: {
        create: {
          firstName: 'Nguyen',
          lastName: 'Minh',
          dateOfBirth: new Date('2016-05-15'),
          grade: 'GRADE_3',
          xp: 100,
          level: 2,
          stars: 15,
          streak: 3,
          parentId: parent1User.parent!.id,
        },
      },
    },
  });

  const student2Password = await bcrypt.hash('student123', 10);
  void await prisma.user.create({
    data: {
      email: 'student2@example.com',
      password: student2Password,
      role: 'STUDENT',
      isActive: true,
      emailVerified: true,
      student: {
        create: {
          firstName: 'Tran Thi',
          lastName: 'Hoa',
          dateOfBirth: new Date('2017-08-20'),
          grade: 'GRADE_2',
          xp: 50,
          level: 1,
          stars: 8,
          streak: 1,
        },
      },
    },
  });
  console.log('✅ Student users created');

  // 4. Create Courses
  const mathCourse = await prisma.course.create({
    data: {
      title: 'Toán học lớp 3 - Cơ bản',
      slug: 'toan-hoc-lop-3-co-ban',
      description: 'Khóa học toán cơ bản dành cho học sinh lớp 3',
      subject: 'MATH',
      grade: 'GRADE_3',
      level: 'BEGINNER',
      duration: 300,
      isPublished: true,
      isFree: true,
      order: 1,
    },
  });

  const vietnameseCourse = await prisma.course.create({
    data: {
      title: 'Tiếng Việt lớp 2 - Kỹ năng đọc',
      slug: 'tieng-viet-lop-2-ky-nang-doc',
      description: 'Phát triển kỹ năng đọc hiểu cho học sinh lớp 2',
      subject: 'VIETNAMESE',
      grade: 'GRADE_2',
      level: 'BEGINNER',
      duration: 240,
      isPublished: true,
      isFree: true,
      order: 2,
    },
  });
  console.log('✅ Courses created');

  // 5. Create Lectures
  await prisma.lecture.createMany({
    data: [
      {
        courseId: mathCourse.id,
        title: 'Bài 1: Phép cộng trong phạm vi 100',
        slug: 'bai-1-phep-cong',
        description: 'Học cách cộng các số trong phạm vi 100',
        duration: 600,
        order: 1,
        isPreview: true,
      },
      {
        courseId: mathCourse.id,
        title: 'Bài 2: Phép trừ trong phạm vi 100',
        slug: 'bai-2-phep-tru',
        description: 'Học cách trừ các số trong phạm vi 100',
        duration: 600,
        order: 2,
      },
      {
        courseId: vietnameseCourse.id,
        title: 'Bài 1: Đọc hiểu đoạn văn ngắn',
        slug: 'bai-1-doc-hieu',
        description: 'Luyện đọc và hiểu các đoạn văn ngắn',
        duration: 480,
        order: 1,
        isPreview: true,
      },
    ],
  });
  console.log('✅ Lectures created');

  // 6. Create Games
  await prisma.game.createMany({
    data: [
      {
        type: 'MATH_QUIZ',
        title: 'Thử thách Toán học',
        description: 'Giải các bài toán nhanh nhất có thể!',
        subject: 'MATH',
        grade: 'GRADE_3',
        config: { difficulty: 'easy', timeLimit: 60 },
        isActive: true,
      },
      {
        type: 'WORD_MATCHING',
        title: 'Ghép từ vựng',
        description: 'Ghép các từ với nghĩa đúng của chúng',
        subject: 'VIETNAMESE',
        grade: 'GRADE_2',
        config: { pairs: 10, timeLimit: 120 },
        isActive: true,
      },
      {
        type: 'MEMORY_CARD',
        title: 'Trí nhớ siêu phàm',
        description: 'Tìm các cặp thẻ giống nhau',
        subject: 'ENGLISH',
        grade: 'GRADE_3',
        config: { cards: 16, timeLimit: 180 },
        isActive: true,
      },
    ],
  });
  console.log('✅ Games created');

  // 7. Create Achievements
  await prisma.achievement.createMany({
    data: [
      {
        type: 'COURSE_COMPLETION',
        title: 'Người học tập',
        description: 'Hoàn thành khóa học đầu tiên',
        icon: '🎓',
        xpReward: 50,
        condition: { type: 'complete_course', count: 1 },
      },
      {
        type: 'QUIZ_MASTER',
        title: 'Thạc sĩ Quiz',
        description: 'Đạt 100% điểm trong 5 bài quiz',
        icon: '🏆',
        xpReward: 100,
        condition: { type: 'perfect_quiz', count: 5 },
      },
      {
        type: 'STREAK_KEEPER',
        title: 'Kiên trì',
        description: 'Học liên tục 7 ngày',
        icon: '🔥',
        xpReward: 75,
        condition: { type: 'streak_days', count: 7 },
      },
      {
        type: 'GAME_CHAMPION',
        title: 'Vô địch Game',
        description: 'Đạt top 1 trong bất kỳ trò chơi nào',
        icon: '🥇',
        xpReward: 150,
        condition: { type: 'game_rank', rank: 1 },
      },
    ],
  });
  console.log('✅ Achievements created');

  console.log('🎉 Seed completed!');
  console.log('\n📝 Test Accounts:');
  console.log('Admin: admin@learningplatform.com / admin123');
  console.log('Parent: parent1@example.com / parent123');
  console.log('Student: student1@example.com / student123');
  console.log('Student: student2@example.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
