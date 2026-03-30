/* eslint-disable no-console, @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import seedCourses from './seeds/courses.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create or update Admin account
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edubunny.com' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
    create: {
      email: 'admin@edubunny.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`✅ Admin user created/updated: ${admin.email} / admin123`);

  // Seed courses
  console.log('\n📚 Seeding courses data...');
  await seedCourses();

  console.log('\n🎉 Seed completed!');
  console.log('\n📝 Admin Account:');
  console.log('Email: admin@edubunny.com');
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
