/* eslint-disable no-console */

import { EntitlementSource, EntitlementStatus, PrismaClient } from '@prisma/client/index';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting legacy enrollment -> entitlement backfill...');

    await prisma.$transaction(async (tx) => {
        const enrollments = await tx.enrollment.findMany({
            select: {
                studentId: true,
                courseId: true,
                enrolledAt: true,
            },
        });

        if (enrollments.length === 0) {
            console.log('No enrollments found. Nothing to backfill.');
            return;
        }

        await tx.courseEntitlement.createMany({
            data: enrollments.map((enrollment) => ({
                studentId: enrollment.studentId,
                courseId: enrollment.courseId,
                source: EntitlementSource.LEGACY_ENROLLMENT,
                status: EntitlementStatus.ACTIVE,
                startsAt: enrollment.enrolledAt,
                expiresAt: null,
            })),
            skipDuplicates: true,
        });

        const [enrollmentCount, legacyEntitlementCount] = await Promise.all([
            tx.enrollment.count(),
            tx.courseEntitlement.count({
                where: {
                    source: EntitlementSource.LEGACY_ENROLLMENT,
                },
            }),
        ]);

        if (legacyEntitlementCount !== enrollmentCount) {
            throw new Error(
                `Backfill verification failed: enrollments=${enrollmentCount}, legacyEntitlements=${legacyEntitlementCount}`
            );
        }

        console.log(
            `Backfill verification passed: enrollments=${enrollmentCount}, legacyEntitlements=${legacyEntitlementCount}`
        );
    });

    console.log('Legacy entitlement backfill completed.');
}

main()
    .catch((error) => {
        console.error('Legacy entitlement backfill failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
