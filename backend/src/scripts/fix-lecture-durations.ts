/**
 * Script to fix lecture durations (convert seconds to minutes)
 * This script divides all lecture durations by 60
 * 
 * Usage: npm run fix:lecture-durations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixLectureDurations() {
    console.log('🔧 Fixing lecture durations (converting seconds to minutes)...\n');

    try {
        const lectures = await prisma.lecture.findMany();

        console.log(`📚 Found ${lectures.length} lectures to fix\n`);

        let fixedCount = 0;

        for (const lecture of lectures) {
            const oldDuration = lecture.duration;
            const newDuration = Math.round(oldDuration / 60); // Convert seconds to minutes

            await prisma.lecture.update({
                where: { id: lecture.id },
                data: { duration: newDuration },
            });

            console.log(`✅ ${lecture.title}`);
            console.log(`   ${oldDuration} minutes (${Math.floor(oldDuration / 60)}h ${oldDuration % 60}m) → ${newDuration} minutes\n`);
            
            fixedCount++;
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ Lecture durations fixed!');
        console.log(`📊 Fixed: ${fixedCount} lectures`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Now recalculate course durations
        console.log('🔄 Recalculating course durations...\n');

        const courses = await prisma.course.findMany({
            where: { deletedAt: null },
        });

        for (const course of courses) {
            const totalDuration = await prisma.lecture.aggregate({
                where: { courseId: course.id },
                _sum: { duration: true },
            });

            const newDuration = totalDuration._sum.duration || 0;

            await prisma.course.update({
                where: { id: course.id },
                data: { duration: newDuration },
            });

            console.log(`✅ ${course.title}: ${newDuration} minutes`);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ All durations have been fixed!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Error fixing durations:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
fixLectureDurations()
    .then(() => {
        console.log('✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
