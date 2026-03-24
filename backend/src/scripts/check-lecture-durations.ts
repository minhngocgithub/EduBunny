/**
 * Script to check lecture durations and identify issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLectureDurations() {
    console.log('🔍 Checking lecture durations...\n');

    try {
        const courses = await prisma.course.findMany({
            where: { deletedAt: null },
            include: {
                lectures: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        for (const course of courses) {
            console.log(`\n📚 Course: ${course.title}`);
            console.log(`   Total Duration: ${course.duration} minutes\n`);
            console.log(`   Lectures (${course.lectures.length}):`);

            let sum = 0;
            course.lectures.forEach((lecture, index) => {
                console.log(`   ${index + 1}. ${lecture.title}`);
                console.log(`      Duration: ${lecture.duration} minutes`);
                sum += lecture.duration;
            });

            console.log(`\n   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`   Sum of lectures: ${sum} minutes`);
            console.log(`   Course duration: ${course.duration} minutes`);
            console.log(`   Difference: ${Math.abs(sum - course.duration)} minutes`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLectureDurations();
