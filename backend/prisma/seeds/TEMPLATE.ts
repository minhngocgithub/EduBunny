/* 
 * TEMPLATE: Thêm Course, Lecture, Quiz mới
 * Copy template này và điền thông tin để tạo khóa học mới
 */

import { Subject, Grade, CourseLevel, QuestionType } from '@prisma/client';
import { CourseData, LectureData, QuizData, QuestionData } from './courses.seed';

// ============================================
// TEMPLATE: QUESTIONS (Câu hỏi)
// ============================================
export const templateQuestions: QuestionData[] = [
  // Multiple Choice Question
  {
    type: QuestionType.MULTIPLE_CHOICE,
    question: 'Đây là câu hỏi trắc nghiệm?',
    options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
    correctAnswer: 'Đáp án B',
    explanation: 'Giải thích tại sao đáp án B là đúng...',
    points: 10,
    order: 1,
  },

  // True/False Question
  {
    type: QuestionType.TRUE_FALSE,
    question: 'Đây là câu hỏi đúng/sai?',
    correctAnswer: 'Đúng', // hoặc 'Sai'
    explanation: 'Giải thích tại sao đúng hoặc sai...',
    points: 10,
    order: 2,
  },

  // Fill in the Blank
  {
    type: QuestionType.FILL_BLANK,
    question: 'Điền vào chỗ trống: 2 + 2 = ___',
    correctAnswer: '4',
    explanation: '2 cộng 2 bằng 4',
    points: 10,
    order: 3,
  },

  // Matching Question (sử dụng JSON cho options)
  {
    type: QuestionType.MATCHING,
    question: 'Nối các cặp từ phù hợp',
    options: ['Dog', 'Cat', 'Bird'],
    correctAnswer: JSON.stringify({
      'Dog': 'Chó',
      'Cat': 'Mèo',
      'Bird': 'Chim'
    }),
    explanation: 'Nối đúng các từ tiếng Anh với tiếng Việt',
    points: 15,
    order: 4,
  },
];

// ============================================
// TEMPLATE: QUIZ (Bài kiểm tra)
// ============================================
export const templateQuiz: QuizData = {
  title: 'Kiểm tra: [Tên chủ đề]',
  description: 'Bài kiểm tra giúp củng cố kiến thức về [chủ đề]',
  duration: 10, // phút
  passingScore: 70, // % điểm để đạt
  maxAttempts: 3, // số lần làm bài tối đa
  order: 1, // thứ tự quiz trong course
  isActive: true,
  questions: templateQuestions,
};

// ============================================
// TEMPLATE: LECTURES (Bài giảng)
// ============================================
export const templateLectures: LectureData[] = [
  // Lecture không có quiz
  {
    title: 'Bài 1: [Tên bài học]',
    description: 'Mô tả nội dung bài học...',
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
    duration: 600, // giây (10 phút)
    order: 1,
    isPreview: true, // true = cho xem miễn phí
  },

  // Lecture có quiz
  {
    title: 'Bài 2: [Tên bài học có kiểm tra]',
    description: 'Mô tả nội dung bài học...',
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
    duration: 900, // 15 phút
    order: 2,
    isPreview: false,
    quiz: {
      title: 'Kiểm tra: Bài 2',
      description: 'Bài kiểm tra sau bài học',
      duration: 5,
      passingScore: 70,
      maxAttempts: 3,
      order: 1,
      isActive: true,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Câu hỏi 1?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
          explanation: 'Giải thích...',
          points: 10,
          order: 1,
        },
        // Thêm câu hỏi khác...
      ],
    },
  },

  // Lecture kiểu bài đọc (không có video)
  {
    title: 'Bài 3: [Bài đọc]',
    description: 'Đọc và tìm hiểu về [chủ đề]',
    // Không có videoUrl
    duration: 300, // thời gian đọc ước tính
    order: 3,
    isPreview: false,
  },
];

// ============================================
// TEMPLATE: COURSE (Khóa học hoàn chỉnh)
// ============================================
export const templateCourse: CourseData = {
  title: '[Môn học] Lớp [X] - [Chủ đề chính]',
  slug: 'mon-hoc-lop-x-chu-de-chinh', // lowercase, dấu gạch ngang
  description: `
    Khóa học [môn học] dành cho học sinh lớp [X], 
    giúp các em [mục tiêu học tập].
    
    Nội dung được thiết kế phù hợp với chương trình 
    Giáo dục Phổ thông 2018.
  `.trim(),
  thumbnail: '/images/courses/course-thumbnail.jpg',

  // Môn học: MATH, VIETNAMESE, ENGLISH, SCIENCE, HISTORY, GEOGRAPHY, ART, MUSIC, PE, LIFE_SKILLS
  subject: Subject.MATH,

  // Lớp học: GRADE_1, GRADE_2, GRADE_3, GRADE_4, GRADE_5
  grade: Grade.GRADE_1,

  // Mức độ: BEGINNER, INTERMEDIATE, ADVANCED
  level: CourseLevel.BEGINNER,

  // Tổng thời lượng (phút) - tính tổng duration của tất cả lectures
  duration: 3000,

  isPublished: true, // true = hiển thị cho học sinh
  isFree: true, // true = miễn phí
  order: 1, // thứ tự hiển thị

  lectures: templateLectures,
};

// ============================================
// EXAMPLES: Các ví dụ cụ thể
// ============================================

// Example 1: Khóa Toán Lớp 2
export const mathGrade2Course: CourseData = {
  title: 'Toán Lớp 2 - Phép Cộng Trừ Nâng Cao',
  slug: 'toan-lop-2-phep-cong-tru-nang-cao',
  description: 'Học phép cộng trừ có nhớ, bảng nhân 2-5, và giải toán có lời văn',
  thumbnail: '/images/courses/math-grade2.jpg',
  subject: Subject.MATH,
  grade: Grade.GRADE_2,
  level: CourseLevel.BEGINNER,
  duration: 2500,
  isPublished: true,
  isFree: true,
  order: 3,
  lectures: [
    {
      title: 'Bài 1: Cộng có nhớ',
      description: 'Học cách cộng hai số có nhớ',
      videoUrl: 'https://www.youtube.com/embed/xxx',
      duration: 600,
      order: 1,
      isPreview: true,
      quiz: {
        title: 'Kiểm tra: Cộng có nhớ',
        description: 'Bài tập về phép cộng có nhớ',
        duration: 5,
        passingScore: 70,
        maxAttempts: 3,
        order: 1,
        isActive: true,
        questions: [
          {
            type: QuestionType.MULTIPLE_CHOICE,
            question: '15 + 8 = ?',
            options: ['21', '22', '23', '24'],
            correctAnswer: '23',
            explanation: '15 + 8 = 23 (5 + 8 = 13, viết 3 nhớ 1, 1 + 1 = 2)',
            points: 10,
            order: 1,
          },
        ],
      },
    },
  ],
};

// Example 2: Khóa Tiếng Anh Lớp 4
export const englishGrade4Course: CourseData = {
  title: 'Tiếng Anh Lớp 4 - English Fun',
  slug: 'tieng-anh-lop-4-english-fun',
  description: 'Những chủ đề tiếng Anh thú vị: gia đình, bạn bè, sở thích, thời tiết',
  thumbnail: '/images/courses/english-grade4.jpg',
  subject: Subject.ENGLISH,
  grade: Grade.GRADE_4,
  level: CourseLevel.INTERMEDIATE,
  duration: 3600,
  isPublished: true,
  isFree: true,
  order: 10,
  lectures: [
    {
      title: 'Unit 1: My Family',
      description: 'Learn vocabulary about family members',
      videoUrl: 'https://www.youtube.com/embed/xxx',
      duration: 720,
      order: 1,
      isPreview: true,
      quiz: {
        title: 'Quiz: Family Vocabulary',
        description: 'Test your knowledge about family',
        duration: 5,
        passingScore: 70,
        maxAttempts: 3,
        order: 1,
        isActive: true,
        questions: [
          {
            type: QuestionType.MULTIPLE_CHOICE,
            question: "What is 'bố' in English?",
            options: ['Mother', 'Father', 'Brother', 'Sister'],
            correctAnswer: 'Father',
            explanation: "'Bố' means 'Father' in English",
            points: 10,
            order: 1,
          },
          {
            type: QuestionType.MATCHING,
            question: 'Match the family members',
            options: ['Father', 'Mother', 'Brother', 'Sister'],
            correctAnswer: JSON.stringify({
              'Father': 'Bố',
              'Mother': 'Mẹ',
              'Brother': 'Anh/Em trai',
              'Sister': 'Chị/Em gái'
            }),
            explanation: 'Matching family vocabulary',
            points: 20,
            order: 2,
          },
        ],
      },
    },
  ],
};

// ============================================
// EXPORT: Thêm courses mới vào đây
// ============================================
export const newCoursesData: CourseData[] = [
  // Thêm các courses mới vào mảng này
  // mathGrade2Course,
  // englishGrade4Course,
];

// ============================================
// CHECKLIST KHI TẠO COURSE MỚI
// ============================================
/*
✅ COURSE:
  - [ ] Title rõ ràng, có môn học + lớp + chủ đề
  - [ ] Slug unique, lowercase, dấu gạch ngang
  - [ ] Description chi tiết, dễ hiểu
  - [ ] Thumbnail: /images/courses/[slug].jpg
  - [ ] Subject phù hợp với môn học
  - [ ] Grade đúng với lớp học
  - [ ] Level phù hợp (Lớp 1-2: BEGINNER, Lớp 3-4: INTERMEDIATE, Lớp 5: ADVANCED)
  - [ ] Duration = tổng duration của tất cả lectures
  - [ ] Order: số thứ tự tăng dần
  
✅ LECTURES:
  - [ ] Title có format: "Bài X: [Tên]" hoặc "Unit X: [Tên]"
  - [ ] Description ngắn gọn, súc tích
  - [ ] VideoUrl là YouTube embed URL (hoặc bỏ trống nếu là bài đọc)
  - [ ] Duration tính bằng GIÂY (không phải phút)
  - [ ] Order tăng dần từ 1
  - [ ] isPreview = true cho 1-2 bài đầu
  
✅ QUIZZES:
  - [ ] Title có format: "Kiểm tra: [Chủ đề]" hoặc "Quiz: [Topic]"
  - [ ] Description giải thích mục đích bài kiểm tra
  - [ ] Duration tính bằng PHÚT
  - [ ] passingScore thường là 70
  - [ ] maxAttempts thường là 3
  - [ ] Order unique trong course
  
✅ QUESTIONS:
  - [ ] Type phù hợp với dạng câu hỏi
  - [ ] Question rõ ràng, dễ hiểu
  - [ ] Options đủ 4 lựa chọn (cho MULTIPLE_CHOICE)
  - [ ] correctAnswer chính xác
  - [ ] Explanation chi tiết, giải thích tại sao đúng
  - [ ] Points hợp lý (thường 10-20 điểm/câu)
  - [ ] Order tăng dần từ 1
  
✅ VIDEO URLs:
  - Format: https://www.youtube.com/embed/VIDEO_ID
  - Không dùng: https://www.youtube.com/watch?v=VIDEO_ID
  - Có thể bỏ trống nếu là bài đọc
  
✅ TESTING:
  - [ ] Chạy seed và kiểm tra database
  - [ ] Test trên frontend xem hiển thị đúng không
  - [ ] Kiểm tra quiz hoạt động đúng
  - [ ] Verify video URLs hoạt động
*/
