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

  // 7. Create Shop Items
  await prisma.shopItem.createMany({
    data: [
      // Streak Shields
      {
        type: 'STREAK_SHIELD',
        name: 'Khiên Bảo Vệ Streak',
        description: 'Bảo vệ chuỗi học tập của bạn trong 24 giờ nếu quên học',
        icon: '🛡️',
        price: 500,
        currency: 'COIN',
        requiredLevel: 1,
        isActive: true,
        metadata: { duration: 24 },
      },
      // Avatars
      {
        type: 'AVATAR',
        name: 'Avatar Gấu Trúc',
        description: 'Hình đại diện dễ thương của chú gấu trúc',
        icon: '🐼',
        price: 200,
        currency: 'COIN',
        requiredLevel: 1,
        isActive: true,
        metadata: { avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=panda' },
      },
      {
        type: 'AVATAR',
        name: 'Avatar Siêu Nhân',
        description: 'Trở thành siêu anh hùng của chính mình',
        icon: '🦸',
        price: 500,
        currency: 'COIN',
        requiredLevel: 5,
        isActive: true,
        metadata: { avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superhero' },
      },
      {
        type: 'AVATAR',
        name: 'Avatar Ninja',
        description: 'Ninja bí ẩn và mạnh mẽ',
        icon: '🥷',
        price: 800,
        currency: 'COIN',
        requiredLevel: 10,
        isActive: true,
        metadata: { avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ninja' },
      },
      {
        type: 'AVATAR',
        name: 'Avatar Rồng Vàng',
        description: 'Rồng vàng huyền thoại - Biểu tượng của sức mạnh',
        icon: '🐉',
        price: 1500,
        currency: 'COIN',
        requiredLevel: 15,
        isActive: true,
        metadata: { avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dragon' },
      },
      // Stickers
      {
        type: 'STICKER',
        name: 'Gói Sticker Biểu Cảm',
        description: 'Bộ sưu tập 10 sticker biểu cảm vui nhộn',
        icon: '😊',
        price: 150,
        currency: 'COIN',
        requiredLevel: 1,
        isActive: true,
        metadata: { count: 10, category: 'emotion' },
      },
      {
        type: 'STICKER',
        name: 'Gói Sticker Động Vật',
        description: 'Bộ sưu tập 15 sticker động vật đáng yêu',
        icon: '🐱',
        price: 250,
        currency: 'COIN',
        requiredLevel: 3,
        isActive: true,
        metadata: { count: 15, category: 'animals' },
      },
      {
        type: 'STICKER',
        name: 'Gói Sticker Premium',
        description: 'Bộ sưu tập 20 sticker độc quyền',
        icon: '✨',
        price: 400,
        currency: 'COIN',
        requiredLevel: 8,
        isActive: true,
        metadata: { count: 20, category: 'premium' },
      },
      // Badges (Star currency)
      {
        type: 'BADGE',
        name: 'Huy Hiệu Học Giỏi',
        description: 'Dành cho những học sinh xuất sắc',
        icon: '🏅',
        price: 20,
        currency: 'STAR',
        requiredLevel: 5,
        isActive: true,
        metadata: { tier: 'bronze' },
      },
      {
        type: 'BADGE',
        name: 'Huy Hiệu Vàng',
        description: 'Biểu tượng của sự thành công',
        icon: '🥇',
        price: 50,
        currency: 'STAR',
        requiredLevel: 10,
        isActive: true,
        metadata: { tier: 'gold' },
      },
      {
        type: 'BADGE',
        name: 'Huy Hiệu Huyền Thoại',
        description: 'Chỉ dành cho những người giỏi nhất',
        icon: '👑',
        price: 100,
        currency: 'STAR',
        requiredLevel: 15,
        isActive: true,
        metadata: { tier: 'legendary' },
      },
      // Themes
      {
        type: 'THEME',
        name: 'Theme Rừng Xanh',
        description: 'Giao diện với màu xanh thiên nhiên tươi mát',
        icon: '🌲',
        price: 600,
        currency: 'COIN',
        requiredLevel: 5,
        isActive: true,
        metadata: { colors: { primary: '#2ecc71', secondary: '#27ae60' } },
      },
      {
        type: 'THEME',
        name: 'Theme Biển Đêm',
        description: 'Giao diện tối với tông màu xanh dương huyền bí',
        icon: '🌊',
        price: 800,
        currency: 'COIN',
        requiredLevel: 8,
        isActive: true,
        metadata: { colors: { primary: '#3498db', secondary: '#2c3e50' } },
      },
      {
        type: 'THEME',
        name: 'Theme Hoàng Hôn',
        description: 'Giao diện ấm áp với tông màu cam đỏ',
        icon: '🌅',
        price: 1000,
        currency: 'COIN',
        requiredLevel: 12,
        isActive: true,
        metadata: { colors: { primary: '#e74c3c', secondary: '#f39c12' } },
      },
      {
        type: 'THEME',
        name: 'Theme Vũ Trụ',
        description: 'Giao diện tối với hiệu ứng vũ trụ lung linh',
        icon: '🌌',
        price: 2000,
        currency: 'COIN',
        requiredLevel: 20,
        isActive: true,
        metadata: { colors: { primary: '#9b59b6', secondary: '#8e44ad' } },
      },
    ],
  });
  console.log('✅ Shop items created');

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
