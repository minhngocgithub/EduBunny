/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, Subject, Grade, CourseLevel, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

type CurriculumSubject = 'MATH' | 'VIETNAMESE' | 'LIFE_SKILLS' | 'SCIENCE' | 'ENGLISH';

interface CurriculumLecture {
  title: string;
  chapter?: string;
  periods: number;
  description?: string;
}

interface CurriculumCourse {
  grade: number;
  subject: CurriculumSubject;
  subjectLabel: string;
  lectures: CurriculumLecture[];
}

export interface QuestionData {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  order: number;
}

export interface QuizData {
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  maxAttempts: number;
  order: number;
  isActive: boolean;
  questions: QuestionData[];
}

export interface LectureData {
  title: string;
  description: string;
  videoUrl?: string | null;
  duration: number;
  order: number;
  isPreview: boolean;
  quiz?: QuizData;
}

export interface CourseData {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  subject: Subject;
  grade: Grade;
  level: CourseLevel;
  duration: number;
  isPublished: boolean;
  isFree: boolean;
  order: number;
  lectures: LectureData[];
}

const SUBJECT_LABEL: Record<CurriculumSubject, string> = {
  MATH: 'Toán',
  VIETNAMESE: 'Tiếng Việt',
  LIFE_SKILLS: 'Tự nhiên & Xã hội',
  SCIENCE: 'Khoa học',
  ENGLISH: 'Tiếng Anh',
};

const SUBJECT_TO_ENUM: Record<CurriculumSubject, Subject> = {
  MATH: Subject.MATH,
  VIETNAMESE: Subject.VIETNAMESE,
  LIFE_SKILLS: Subject.LIFE_SKILLS,
  SCIENCE: Subject.SCIENCE,
  ENGLISH: Subject.ENGLISH,
};

const GRADE_TO_ENUM: Record<number, Grade> = {
  1: Grade.GRADE_1,
  2: Grade.GRADE_2,
  3: Grade.GRADE_3,
  4: Grade.GRADE_4,
  5: Grade.GRADE_5,
};

const SUBJECT_ORDER: Record<CurriculumSubject, number> = {
  MATH: 1,
  VIETNAMESE: 2,
  LIFE_SKILLS: 3,
  SCIENCE: 3,
  ENGLISH: 4,
};

const SUBJECT_SLUG: Record<CurriculumSubject, string> = {
  MATH: 'math',
  VIETNAMESE: 'vietnamese',
  LIFE_SKILLS: 'nature-social',
  SCIENCE: 'science',
  ENGLISH: 'english',
};

const LEGACY_SLUG_OVERRIDES: Partial<Record<string, string>> = {
  '1-MATH': 'toan-lop-1-hoc-dem-va-phep-tinh-co-ban',
  '1-VIETNAMESE': 'tieng-viet-lop-1-bang-chu-cai-va-van',
  '1-LIFE_SKILLS': 'tu-nhien-xa-hoi-lop-1',
};

const DEFAULT_PERIODS = 2;
const SECONDS_PER_PERIOD = 10 * 60;

function normalizeLine(line: string): string {
  return line.replace(/\u00a0/g, ' ').trim();
}

function detectSubject(line: string): CurriculumSubject | null | undefined {
  const upper = line.toUpperCase();

  if (upper.includes('TIẾNG ANH')) {
    if (upper.includes('KHÔNG HỌC')) {
      return null;
    }
    return 'ENGLISH';
  }

  if (upper.includes('TOÁN')) {
    return 'MATH';
  }

  if (upper.includes('TIẾNG VIỆT')) {
    return 'VIETNAMESE';
  }

  if (upper.includes('TỰ NHIÊN') && upper.includes('XÃ HỘI')) {
    return 'LIFE_SKILLS';
  }

  if (upper.includes('KHOA HỌC')) {
    return 'SCIENCE';
  }

  return undefined;
}

function extractPeriods(line: string, fallback = DEFAULT_PERIODS): number {
  const inParentheses = line.match(/\((\d+)\s*tiết\)/iu);
  if (inParentheses?.[1]) {
    return Number.parseInt(inParentheses[1], 10);
  }

  const afterColon = line.match(/:\s*(\d+)\s*tiết/iu);
  if (afterColon?.[1]) {
    return Number.parseInt(afterColon[1], 10);
  }

  const firstMatch = line.match(/(\d+)\s*tiết/iu);
  if (firstMatch?.[1]) {
    return Number.parseInt(firstMatch[1], 10);
  }

  return fallback;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getCourseLevel(grade: number): CourseLevel {
  if (grade <= 2) {
    return CourseLevel.BEGINNER;
  }

  if (grade <= 4) {
    return CourseLevel.INTERMEDIATE;
  }

  return CourseLevel.ADVANCED;
}

function findNextMeaningfulLine(lines: string[], startIndex: number): { index: number; value: string } | null {
  for (let i = startIndex; i < lines.length; i += 1) {
    const value = normalizeLine(lines[i]);
    if (!value) {
      continue;
    }

    if (value.startsWith('export const ')) {
      return null;
    }

    if (value === 'UnitChủ đề chínhNội dung') {
      continue;
    }

    return { index: i, value };
  }

  return null;
}

function resolveLessonDataPath(): string {
  const candidates = [
    path.resolve(process.cwd(), '../Lesson.data.md'),
    path.resolve(process.cwd(), 'Lesson.data.md'),
    path.resolve(__dirname, '../../../Lesson.data.md'),
    path.resolve(__dirname, '../../../../Lesson.data.md'),
  ];

  const existingPath = candidates.find((candidate) => fs.existsSync(candidate));

  if (!existingPath) {
    throw new Error('Cannot find Lesson.data.md. Make sure curriculum source file exists at project root.');
  }

  return existingPath;
}

function buildCourseSlug(grade: number, subject: CurriculumSubject): string {
  const key = `${grade}-${subject}`;
  const legacySlug = LEGACY_SLUG_OVERRIDES[key];

  if (legacySlug) {
    return legacySlug;
  }

  return slugify(`${SUBJECT_LABEL[subject]} lop ${grade} gdpt 2018`);
}

function parseCurriculumFromLessonData(rawContent: string): CurriculumCourse[] {
  const lines = rawContent.split(/\r?\n/);
  const courseMap = new Map<string, CurriculumCourse>();

  let currentGrade: number | null = null;
  let currentSubject: CurriculumSubject | null = null;
  let currentChapter: string | undefined;
  let currentCourse: CurriculumCourse | null = null;

  const ensureCourse = (grade: number, subject: CurriculumSubject): CurriculumCourse => {
    const key = `${grade}-${subject}`;
    const existing = courseMap.get(key);

    if (existing) {
      return existing;
    }

    const created: CurriculumCourse = {
      grade,
      subject,
      subjectLabel: SUBJECT_LABEL[subject],
      lectures: [],
    };

    courseMap.set(key, created);
    return created;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = normalizeLine(lines[i]);

    if (!line) {
      continue;
    }

    if (line.startsWith('export const ')) {
      break;
    }

    const isGradeHeader =
      /LỚP\s*[1-5]$/iu.test(line) &&
      (line.startsWith('📘') || line.startsWith('📗') || line.startsWith('📕') || line.startsWith('📙') || /^LỚP\s*[1-5]$/iu.test(line));

    if (isGradeHeader) {
      const gradeMatch = line.match(/LỚP\s*([1-5])$/iu);
      currentGrade = gradeMatch?.[1] ? Number.parseInt(gradeMatch[1], 10) : null;
      currentSubject = null;
      currentCourse = null;
      currentChapter = undefined;
      continue;
    }

    const detectedSubject = detectSubject(line);
    if (detectedSubject !== undefined) {
      if (!currentGrade) {
        continue;
      }

      if (detectedSubject === null) {
        currentSubject = null;
        currentCourse = null;
        currentChapter = undefined;
        continue;
      }

      currentSubject = detectedSubject;
      currentCourse = ensureCourse(currentGrade, detectedSubject);
      currentChapter = undefined;
      continue;
    }

    if (!currentCourse || !currentSubject || !currentGrade) {
      continue;
    }

    if (/^Chương\s+\d+/iu.test(line) || /^Unit\s+\d+\s*→\s*Unit\s+\d+/iu.test(line)) {
      currentChapter = line;
      continue;
    }

    if (line === 'UnitChủ đề chínhNội dung') {
      continue;
    }

    if (/^Unit\s+\d+\s*$/iu.test(line)) {
      const topicLine = findNextMeaningfulLine(lines, i + 1);
      if (!topicLine) {
        continue;
      }

      if (/^Unit\s+\d+/iu.test(topicLine.value)) {
        continue;
      }

      const nextLine = findNextMeaningfulLine(lines, topicLine.index + 1);
      const hasDescription = Boolean(nextLine && !/^Unit\s+\d+/iu.test(nextLine.value) && !/^Cấu trúc/iu.test(nextLine.value));

      currentCourse.lectures.push({
        title: `${line}: ${topicLine.value}`,
        chapter: currentChapter,
        periods: 3,
        description: hasDescription && nextLine ? nextLine.value : undefined,
      });

      i = hasDescription && nextLine ? nextLine.index : topicLine.index;
      continue;
    }

    if (/^Unit\s+\d+\s*[–-]\s*\d+/iu.test(line)) {
      const rangeMatch = line.match(/^Unit\s+(\d+)\s*[–-]\s*(\d+)/iu);
      const start = rangeMatch?.[1] ? Number.parseInt(rangeMatch[1], 10) : 1;
      const end = rangeMatch?.[2] ? Number.parseInt(rangeMatch[2], 10) : start;
      const periods = Math.max(3, (end - start + 1) * 3);

      const topicLine = findNextMeaningfulLine(lines, i + 1);
      const title = topicLine ? `${line}: ${topicLine.value}` : line;

      currentCourse.lectures.push({
        title,
        chapter: currentChapter,
        periods,
      });

      if (topicLine) {
        i = topicLine.index;
      }
      continue;
    }

    if (/^Bài\s+\d+/iu.test(line)) {
      const cleanTitle = line.replace(/\(\d+\s*tiết\)/iu, '').trim();
      currentCourse.lectures.push({
        title: cleanTitle,
        chapter: currentChapter,
        periods: extractPeriods(line),
      });
      continue;
    }

    if (/^Ôn tập/iu.test(line)) {
      const title = line.split(':')[0].trim();
      currentCourse.lectures.push({
        title,
        chapter: currentChapter,
        periods: extractPeriods(line),
      });
      continue;
    }

    if (/^Cấu trúc/iu.test(line) && currentSubject === 'ENGLISH') {
      const reviewMatch = line.match(/(\d+)\s*tiết\s*Ôn tập/iu);
      const testMatch = line.match(/(\d+)\s*tiết\s*Kiểm tra/iu);

      if (reviewMatch?.[1]) {
        currentCourse.lectures.push({
          title: 'Ôn tập tiếng Anh',
          chapter: currentChapter,
          periods: Number.parseInt(reviewMatch[1], 10),
        });
      }

      if (testMatch?.[1]) {
        currentCourse.lectures.push({
          title: 'Kiểm tra tiếng Anh',
          chapter: currentChapter,
          periods: Number.parseInt(testMatch[1], 10),
        });
      }
    }
  }

  return Array.from(courseMap.values())
    .filter((course) => course.lectures.length > 0)
    .sort((a, b) => {
      if (a.grade !== b.grade) {
        return a.grade - b.grade;
      }

      return SUBJECT_ORDER[a.subject] - SUBJECT_ORDER[b.subject];
    });
}

function buildSeedCourses(curriculumCourses: CurriculumCourse[]): CourseData[] {
  return curriculumCourses.map((course, index) => {
    const lectures: LectureData[] = course.lectures.map((lecture, lectureIndex) => {
      const descriptionParts = [
        lecture.chapter ? `Thuộc ${lecture.chapter}.` : '',
        lecture.description || '',
        `Thời lượng dự kiến ${lecture.periods} tiết.`,
      ].filter(Boolean);

      return {
        title: lecture.title,
        description: descriptionParts.join(' ').trim(),
        duration: Math.max(300, lecture.periods * SECONDS_PER_PERIOD),
        order: lectureIndex + 1,
        isPreview: lectureIndex < 2,
      };
    });

    const totalDuration = lectures.reduce((sum, lecture) => sum + lecture.duration, 0);
    const slug = buildCourseSlug(course.grade, course.subject);

    return {
      title: `${course.subjectLabel} Lớp ${course.grade} - Chương trình GDPT 2018`,
      slug,
      description: `Khóa học ${course.subjectLabel} lớp ${course.grade} được seed tự động từ Lesson.data.md theo khung chương trình GDPT 2018. Tổng số bài: ${lectures.length}.`,
      thumbnail: `/images/courses/${SUBJECT_SLUG[course.subject]}-grade${course.grade}.jpg`,
      subject: SUBJECT_TO_ENUM[course.subject],
      grade: GRADE_TO_ENUM[course.grade],
      level: getCourseLevel(course.grade),
      duration: totalDuration,
      isPublished: true,
      isFree: true,
      order: index + 1,
      lectures,
    };
  });
}

async function upsertCourseWithLectures(courseData: CourseData): Promise<void> {
  const course = await prisma.course.upsert({
    where: { slug: courseData.slug },
    update: {
      title: courseData.title,
      description: courseData.description,
      thumbnail: courseData.thumbnail,
      subject: courseData.subject,
      grade: courseData.grade,
      level: courseData.level,
      duration: courseData.duration,
      isPublished: courseData.isPublished,
      isFree: courseData.isFree,
      order: courseData.order,
      deletedAt: null,
    },
    create: {
      title: courseData.title,
      slug: courseData.slug,
      description: courseData.description,
      thumbnail: courseData.thumbnail,
      subject: courseData.subject,
      grade: courseData.grade,
      level: courseData.level,
      duration: courseData.duration,
      isPublished: courseData.isPublished,
      isFree: courseData.isFree,
      order: courseData.order,
    },
  });

  const expectedLectureSlugs: string[] = [];

  for (const lectureData of courseData.lectures) {
    const lectureSlug = `${courseData.slug}-lesson-${lectureData.order}`;
    expectedLectureSlugs.push(lectureSlug);

    await prisma.lecture.upsert({
      where: { slug: lectureSlug },
      update: {
        title: lectureData.title,
        description: lectureData.description,
        duration: lectureData.duration,
        order: lectureData.order,
        isPreview: lectureData.isPreview,
        videoUrl: lectureData.videoUrl || null,
      },
      create: {
        courseId: course.id,
        title: lectureData.title,
        slug: lectureSlug,
        description: lectureData.description,
        duration: lectureData.duration,
        order: lectureData.order,
        isPreview: lectureData.isPreview,
        videoUrl: lectureData.videoUrl || null,
      },
    });
  }

  await prisma.lecture.deleteMany({
    where: {
      courseId: course.id,
      slug: {
        notIn: expectedLectureSlugs,
      },
    },
  });

  // Seed theo Lesson.data.md chưa chứa ngân hàng câu hỏi chi tiết, nên làm sạch quiz cũ để tránh lệch dữ liệu.
  await prisma.quiz.deleteMany({
    where: {
      courseId: course.id,
    },
  });

  const totalDuration = await prisma.lecture.aggregate({
    where: { courseId: course.id },
    _sum: { duration: true },
  });

  await prisma.course.update({
    where: { id: course.id },
    data: {
      duration: totalDuration._sum.duration || 0,
    },
  });

  console.log(`✅ Synced course: ${courseData.title} (${courseData.lectures.length} bài)`);
}

export async function seedCourses() {
  console.log('🌱 Seeding courses from Lesson.data.md ...');

  const sourcePath = resolveLessonDataPath();
  const rawContent = fs.readFileSync(sourcePath, 'utf-8');

  const curriculumCourses = parseCurriculumFromLessonData(rawContent);
  if (curriculumCourses.length === 0) {
    throw new Error('No course data parsed from Lesson.data.md');
  }

  const coursesData = buildSeedCourses(curriculumCourses);

  console.log(`📚 Parsed ${coursesData.length} courses from source: ${sourcePath}`);

  for (const courseData of coursesData) {
    await upsertCourseWithLectures(courseData);
  }

  console.log('✅ Courses seeding completed and synced with Lesson.data.md');
}

export default seedCourses;
