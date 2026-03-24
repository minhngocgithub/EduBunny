/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDeletedCourses() {
  console.log('📋 Kiểm tra khóa học đã xóa (soft delete)...\n');

  // Get all courses (including soft-deleted)
  const allCourses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      deletedAt: true,
      isPublished: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`📊 Tổng số courses trong database: ${allCourses.length}`);
  
  const activeCourses = allCourses.filter(c => c.deletedAt === null);
  const deletedCourses = allCourses.filter(c => c.deletedAt !== null);

  console.log(`✅ Active courses: ${activeCourses.length}`);
  console.log(`🗑️  Soft-deleted courses: ${deletedCourses.length}\n`);

  if (deletedCourses.length > 0) {
    console.log('📝 Danh sách courses đã xóa (soft delete):');
    console.log('─'.repeat(80));
    deletedCourses.forEach(course => {
      console.log(`├─ ${course.title}`);
      console.log(`│  Slug: ${course.slug}`);
      console.log(`│  Deleted at: ${course.deletedAt?.toLocaleString('vi-VN')}`);
      console.log(`└─ ID: ${course.id}\n`);
    });
  }

  if (activeCourses.length > 0) {
    console.log('\n📚 Danh sách courses đang active:');
    console.log('─'.repeat(80));
    activeCourses.forEach(course => {
      console.log(`├─ ${course.title} ${course.isPublished ? '📗' : '📘 (Draft)'}`);
      console.log(`└─ Slug: ${course.slug}\n`);
    });
  }

  await prisma.$disconnect();
}

checkDeletedCourses()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
