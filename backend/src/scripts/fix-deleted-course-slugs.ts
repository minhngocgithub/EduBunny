/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fix deleted course slugs by appending timestamp
 * This allows reusing slugs from deleted courses
 */
async function fixDeletedCourseSlugs() {
  console.log('🔧 Fixing deleted course slugs...\n');

  // Find all soft-deleted courses
  const deletedCourses = await prisma.course.findMany({
    where: {
      deletedAt: { not: null },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      deletedAt: true,
    },
  });

  if (deletedCourses.length === 0) {
    console.log('✅ No deleted courses found. Nothing to fix.\n');
    await prisma.$disconnect();
    return;
  }

  console.log(`📋 Found ${deletedCourses.length} deleted course(s)\n`);

  let fixedCount = 0;

  for (const course of deletedCourses) {
    // Check if slug already has timestamp suffix
    if (course.slug.includes('-deleted-')) {
      console.log(`⏭️  Skipping "${course.title}" (slug already fixed)`);
      continue;
    }

    // Generate new slug with timestamp
    const timestamp = course.deletedAt ? course.deletedAt.getTime() : Date.now();
    const newSlug = `${course.slug}-deleted-${timestamp}`;

    try {
      await prisma.course.update({
        where: { id: course.id },
        data: { slug: newSlug },
      });

      console.log(`✅ Fixed: "${course.title}"`);
      console.log(`   Old slug: ${course.slug}`);
      console.log(`   New slug: ${newSlug}\n`);
      fixedCount++;
    } catch (error: any) {
      console.error(`❌ Failed to fix "${course.title}": ${error.message}\n`);
    }
  }

  console.log(`\n📊 Summary: Fixed ${fixedCount}/${deletedCourses.length} course(s)\n`);
  await prisma.$disconnect();
}

fixDeletedCourseSlugs()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
