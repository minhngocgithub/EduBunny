/**
 * Script to delete a specific course by slug
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteCourseBySlug(slug: string) {
    console.log(`🗑️  Deleting course with slug: ${slug}\n`);

    try {
        const course = await prisma.course.findUnique({
            where: { slug },
            include: {
                lectures: true,
            },
        });

        if (!course) {
            console.log(`⚠️  Course with slug "${slug}" not found.\n`);
            return;
        }

        console.log(`📚 Found course: ${course.title}`);
        console.log(`   Lectures: ${course.lectures.length}`);
        console.log(`   Duration: ${course.duration} minutes\n`);

        // Delete all lectures first (due to foreign key)
        if (course.lectures.length > 0) {
            await prisma.lecture.deleteMany({
                where: { courseId: course.id },
            });
            console.log(`✅ Deleted ${course.lectures.length} lectures\n`);
        }

        // Delete the course
        await prisma.course.delete({
            where: { id: course.id },
        });

        console.log(`✅ Course "${course.title}" deleted successfully!\n`);

    } catch (error) {
        console.error('❌ Error deleting course:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Get slug from command line argument
const slug = process.argv[2];

if (!slug) {
    console.error('❌ Please provide a course slug as argument');
    console.log('Usage: npx tsx src/scripts/delete-course.ts <slug>');
    process.exit(1);
}

deleteCourseBySlug(slug)
    .then(() => {
        console.log('✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
