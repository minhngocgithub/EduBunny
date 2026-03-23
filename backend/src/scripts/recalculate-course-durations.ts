/**
 * Script to recalculate course durations from their lectures
 * Run this script to fix hardcoded course durations in the database
 * 
 * Usage: npx ts-node src/scripts/recalculate-course-durations.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function recalculateCourseDurations() {
    console.log('🔄 Starting course duration recalculation...\n');

    try {
        // Get all courses
        const courses = await prisma.course.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                title: true,
                duration: true,
            },
        });

        console.log(`📚 Found ${courses.length} courses to process\n`);

        let updatedCount = 0;
        let unchangedCount = 0;

        for (const course of courses) {
            // Calculate total duration from lectures
            const totalDuration = await prisma.lecture.aggregate({
                where: { courseId: course.id },
                _sum: { duration: true },
            });

            const newDuration = totalDuration._sum.duration || 0;
            const oldDuration = course.duration;

            // Update course duration
            await prisma.course.update({
                where: { id: course.id },
                data: { duration: newDuration },
            });

            if (oldDuration !== newDuration) {
                console.log(`✅ ${course.title}`);
                console.log(`   Old: ${oldDuration} minutes → New: ${newDuration} minutes\n`);
                updatedCount++;
            } else {
                unchangedCount++;
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ Recalculation completed!');
        console.log(`📊 Updated: ${updatedCount} courses`);
        console.log(`📊 Unchanged: ${unchangedCount} courses`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Error recalculating course durations:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
recalculateCourseDurations()
    .then(() => {
        console.log('✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
