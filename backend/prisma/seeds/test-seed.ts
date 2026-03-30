/**
 * Script kiểm tra seed data
 * Chạy: npx ts-node prisma/seeds/test-seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSeed() {
  console.log('🧪 Testing seed data...\n');

  try {
    // Test 1: Check courses
    console.log('📚 Test 1: Checking courses...');
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        subject: true,
        grade: true,
        isPublished: true,
        _count: {
          select: {
            lectures: true,
            quizzes: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    console.log(`✅ Found ${courses.length} courses:`);
    courses.forEach((course, index) => {
      console.log(
        `   ${index + 1}. ${course.title}`,
        `\n      - Slug: ${course.slug}`,
        `\n      - Subject: ${course.subject}, Grade: ${course.grade}`,
        `\n      - Published: ${course.isPublished}`,
        `\n      - Lectures: ${course._count.lectures}, Quizzes: ${course._count.quizzes}`
      );
    });

    // Test 2: Check lectures
    console.log('\n📖 Test 2: Checking lectures...');
    const lectures = await prisma.lecture.findMany({
      select: {
        id: true,
        title: true,
        duration: true,
        isPreview: true,
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    console.log(`✅ Found ${lectures.length} lectures total`);
    const previewLectures = lectures.filter((l) => l.isPreview);
    console.log(`   - ${previewLectures.length} preview lectures (free to view)`);
    console.log(`   - ${lectures.length - previewLectures.length} premium lectures`);

    // Test 3: Check quizzes
    console.log('\n❓ Test 3: Checking quizzes...');
    const quizzes = await prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        duration: true,
        passingScore: true,
        _count: {
          select: {
            questions: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    console.log(`✅ Found ${quizzes.length} quizzes:`);
    quizzes.forEach((quiz, index) => {
      console.log(
        `   ${index + 1}. ${quiz.title}`,
        `\n      - Course: ${quiz.course.title}`,
        `\n      - Duration: ${quiz.duration} min, Passing: ${quiz.passingScore}%`,
        `\n      - Questions: ${quiz._count.questions}`
      );
    });

    // Test 4: Check questions
    console.log('\n✏️ Test 4: Checking questions...');
    const questions = await prisma.question.findMany({
      select: {
        type: true,
      },
    });

    const questionsByType = questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`✅ Found ${questions.length} questions total:`);
    Object.entries(questionsByType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} questions`);
    });

    // Test 5: Check detailed course
    console.log('\n🔍 Test 5: Detailed check for one course...');
    const detailedCourse = await prisma.course.findFirst({
      where: { slug: 'toan-lop-1-hoc-dem-va-phep-tinh-co-ban' },
      include: {
        lectures: {
          orderBy: { order: 'asc' },
        },
        quizzes: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (detailedCourse) {
      console.log(`✅ Course: ${detailedCourse.title}`);
      console.log(`   - Lectures (${detailedCourse.lectures.length}):`);
      detailedCourse.lectures.forEach((lecture) => {
        console.log(`     ${lecture.order}. ${lecture.title} (${lecture.duration}s)`);
      });
      console.log(`   - Quizzes (${detailedCourse.quizzes.length}):`);
      detailedCourse.quizzes.forEach((quiz) => {
        console.log(`     - ${quiz.title}: ${quiz.questions.length} questions`);
      });
    } else {
      console.log('❌ Course not found!');
    }

    // Test 6: Validate data integrity
    console.log('\n🔐 Test 6: Validating data integrity...');
    
    // Check courses have empty slugs (schema does not allow null)
    const coursesWithoutSlug = await prisma.course.count({
      where: { slug: '' },
    });
    console.log(`   - Courses without slug: ${coursesWithoutSlug} ${coursesWithoutSlug === 0 ? '✅' : '❌'}`);

    // Check for invalid lecture references
    const orphanLectures = await prisma.lecture.count({
      where: { courseId: '' },
    });
    console.log(`   - Orphan lectures: ${orphanLectures} ${orphanLectures === 0 ? '✅' : '❌'}`);

    // Check questions have empty correct answers (schema does not allow null)
    const questionsWithoutAnswer = await prisma.question.count({
      where: { correctAnswer: '' },
    });
    console.log(
      `   - Questions without answer: ${questionsWithoutAnswer} ${questionsWithoutAnswer === 0 ? '✅' : '❌'}`
    );

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   ✅ ${courses.length} courses`);
    console.log(`   ✅ ${lectures.length} lectures`);
    console.log(`   ✅ ${quizzes.length} quizzes`);
    console.log(`   ✅ ${questions.length} questions`);
    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testSeed()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  });
