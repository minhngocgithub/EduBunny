/* eslint-disable no-console */
import { PrismaClient, Subject, Grade, CourseLevel, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

export interface QuestionData {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
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
  videoUrl?: string;
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

// ============================================
// LỚP 1 - TOÁN HỌC (Chương trình đầy đủ)
// ============================================
const mathGrade1Lectures: LectureData[] = [
  // CHƯƠNG 1: Các số từ 0 đến 10
  {
    title: 'Bài 1: Làm quen với số 0',
    description: 'Tìm hiểu về số 0 - con số đặc biệt đại diện cho "không có gì". Các em sẽ học cách nhận biết và viết số 0 đúng cách.',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-1',
    duration: 360,
    order: 1,
    isPreview: true,
  },
  {
    title: 'Bài 2: Các số từ 1 đến 5',
    description: 'Học cách đếm, nhận biết và viết các số từ 1 đến 5. Thực hành đếm các đồ vật xung quanh.',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-2',
    duration: 720,
    order: 2,
    isPreview: true,
  },
  {
    title: 'Bài 3: Luyện tập đếm từ 1 đến 5',
    description: 'Thực hành đếm số với các bài tập vui nhộn, trò chơi đếm số cùng bạn bè.',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-3',
    duration: 480,
    order: 3,
    isPreview: false,
    quiz: {
      title: 'Kiểm tra: Đếm số từ 1 đến 5',
      description: 'Bài kiểm tra giúp các em củng cố kỹ năng đếm và nhận biết số từ 1 đến 5',
      duration: 5,
      passingScore: 70,
      maxAttempts: 3,
      order: 1,
      isActive: true,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Đếm số quả táo trong hình. Có bao nhiêu quả táo? 🍎🍎🍎',
          options: ['2 quả', '3 quả', '4 quả', '5 quả'],
          correctAnswer: '3 quả',
          explanation: 'Trong hình có 3 quả táo màu đỏ. Hãy đếm từng quả: 1, 2, 3!',
          points: 10,
          order: 1,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Số nào đứng sau số 3?',
          options: ['2', '4', '5', '1'],
          correctAnswer: '4',
          explanation: 'Thứ tự các số là: 1, 2, 3, 4, 5. Vậy số đứng sau số 3 là số 4.',
          points: 10,
          order: 2,
        },
        {
          type: QuestionType.FILL_BLANK,
          question: 'Điền số còn thiếu: 1, 2, ___, 4, 5',
          correctAnswer: '3',
          explanation: 'Số còn thiếu là 3. Chuỗi số hoàn chỉnh là: 1, 2, 3, 4, 5',
          points: 10,
          order: 3,
        },
        {
          type: QuestionType.TRUE_FALSE,
          question: 'Đúng hay Sai: Số 5 lớn hơn số 2',
          correctAnswer: 'Đúng',
          explanation: 'Đúng! Số 5 đứng sau số 2 trong dãy số nên 5 lớn hơn 2.',
          points: 10,
          order: 4,
        },
      ],
    },
  },
  {
    title: 'Bài 4: Các số từ 6 đến 10',
    description: 'Tiếp tục hành trình khám phá các số từ 6 đến 10. Học cách đếm và viết các số này.',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-4',
    duration: 720,
    order: 4,
    isPreview: false,
  },
  {
    title: 'Bài 5: Luyện tập đếm từ 6 đến 10',
    description: 'Thực hành đếm các số từ 6 đến 10 với nhiều ví dụ thực tế.',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-5',
    duration: 540,
    order: 5,
    isPreview: false,
    quiz: {
      title: 'Kiểm tra: Đếm số từ 6 đến 10',
      description: 'Bài kiểm tra về các số từ 6 đến 10',
      duration: 5,
      passingScore: 70,
      maxAttempts: 3,
      order: 2,
      isActive: true,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Đếm số ngôi sao: ⭐⭐⭐⭐⭐⭐⭐⭐',
          options: ['6 ngôi sao', '7 ngôi sao', '8 ngôi sao', '9 ngôi sao'],
          correctAnswer: '8 ngôi sao',
          explanation: 'Có 8 ngôi sao trong hình.',
          points: 10,
          order: 1,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Số nào đứng trước số 10?',
          options: ['7', '8', '9', '11'],
          correctAnswer: '9',
          explanation: 'Số đứng trước số 10 là số 9.',
          points: 10,
          order: 2,
        },
        {
          type: QuestionType.FILL_BLANK,
          question: 'Điền số: 6, 7, 8, ___, 10',
          correctAnswer: '9',
          explanation: 'Số còn thiếu là 9.',
          points: 10,
          order: 3,
        },
      ],
    },
  },
  {
    title: 'Bài 6: Ôn tập các số từ 0 đến 10',
    description: 'Ôn tập tổng hợp các số từ 0 đến 10. Đếm ngược và đếm thuận.',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-6',
    duration: 600,
    order: 6,
    isPreview: false,
  },

  // CHƯƠNG 2: So sánh số
  {
    title: 'Bài 7: So sánh lớn hơn, nhỏ hơn',
    description: 'Học cách so sánh hai số: số nào lớn hơn, số nào nhỏ hơn. Sử dụng dấu >, <',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-7',
    duration: 600,
    order: 7,
    isPreview: false,
  },
  {
    title: 'Bài 8: So sánh bằng nhau',
    description: 'Học về khái niệm "bằng nhau" và dấu =. Tìm các nhóm có số lượng bằng nhau.',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-8',
    duration: 480,
    order: 8,
    isPreview: false,
    quiz: {
      title: 'Kiểm tra: So sánh các số',
      description: 'Bài kiểm tra về so sánh lớn hơn, nhỏ hơn, bằng nhau',
      duration: 8,
      passingScore: 70,
      maxAttempts: 3,
      order: 3,
      isActive: true,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Số nào lớn hơn: 5 hay 8?',
          options: ['5', '8', 'Bằng nhau', 'Không so sánh được'],
          correctAnswer: '8',
          explanation: '8 lớn hơn 5 vì 8 đứng sau 5 trong dãy số. Ta viết: 8 > 5',
          points: 10,
          order: 1,
        },
        {
          type: QuestionType.TRUE_FALSE,
          question: 'Đúng hay Sai: Số 10 là số lớn nhất từ 0 đến 10',
          correctAnswer: 'Đúng',
          explanation: 'Đúng! 10 là số lớn nhất trong dãy từ 0 đến 10.',
          points: 10,
          order: 2,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Số nào nhỏ nhất trong các số sau: 3, 7, 1, 5?',
          options: ['3', '7', '1', '5'],
          correctAnswer: '1',
          explanation: 'Số 1 là số nhỏ nhất vì nó đứng đầu trong các số đã cho.',
          points: 10,
          order: 3,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Dấu nào đúng: 6 ___ 4',
          options: ['>', '<', '='],
          correctAnswer: '>',
          explanation: '6 lớn hơn 4, vậy ta viết: 6 > 4',
          points: 10,
          order: 4,
        },
      ],
    },
  },

  // CHƯƠNG 3: Phép cộng trong phạm vi 10
  {
    title: 'Bài 9: Làm quen với phép cộng',
    description: 'Giới thiệu về phép cộng: gộp hai nhóm lại với nhau. Sử dụng dấu +',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-9',
    duration: 660,
    order: 9,
    isPreview: false,
  },
  {
    title: 'Bài 10: Phép cộng hai số có tổng không quá 5',
    description: 'Thực hành phép cộng với tổng từ 0 đến 5. Ví dụ: 1+1, 2+2, 2+3...',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-10',
    duration: 600,
    order: 10,
    isPreview: false,
  },
  {
    title: 'Bài 11: Phép cộng hai số có tổng không quá 10',
    description: 'Mở rộng phép cộng với tổng từ 6 đến 10. Ví dụ: 5+3, 4+6, 7+2...',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-11',
    duration: 720,
    order: 11,
    isPreview: false,
    quiz: {
      title: 'Kiểm tra: Phép cộng cơ bản',
      description: 'Bài kiểm tra về phép cộng trong phạm vi 10',
      duration: 10,
      passingScore: 70,
      maxAttempts: 3,
      order: 4,
      isActive: true,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: '3 + 2 = ?',
          options: ['4', '5', '6', '7'],
          correctAnswer: '5',
          explanation: '3 cộng 2 bằng 5. Ta có thể đếm: 3, 4 (thêm 1), 5 (thêm 2).',
          points: 10,
          order: 1,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: '4 + 5 = ?',
          options: ['7', '8', '9', '10'],
          correctAnswer: '9',
          explanation: '4 cộng 5 bằng 9.',
          points: 10,
          order: 2,
        },
        {
          type: QuestionType.FILL_BLANK,
          question: '5 + ___ = 9',
          correctAnswer: '4',
          explanation: '5 cộng 4 bằng 9. Vậy số cần điền là 4.',
          points: 10,
          order: 3,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: '1 + 1 + 1 = ?',
          options: ['2', '3', '4', '1'],
          correctAnswer: '3',
          explanation: '1 + 1 + 1 = 3. Ba số 1 cộng lại bằng 3.',
          points: 10,
          order: 4,
        },
        {
          type: QuestionType.TRUE_FALSE,
          question: 'Đúng hay Sai: 6 + 2 = 8',
          correctAnswer: 'Đúng',
          explanation: 'Đúng! 6 cộng 2 bằng 8.',
          points: 10,
          order: 5,
        },
      ],
    },
  },

  // CHƯƠNG 4: Phép trừ trong phạm vi 10
  {
    title: 'Bài 12: Làm quen với phép trừ',
    description: 'Giới thiệu về phép trừ: lấy đi một phần từ tổng thể. Sử dụng dấu -',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-12',
    duration: 660,
    order: 12,
    isPreview: false,
  },
  {
    title: 'Bài 13: Phép trừ trong phạm vi 5',
    description: 'Thực hành phép trừ với các số không quá 5. Ví dụ: 3-1, 5-2, 4-3...',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-13',
    duration: 600,
    order: 13,
    isPreview: false,
  },
  {
    title: 'Bài 14: Phép trừ trong phạm vi 10',
    description: 'Mở rộng phép trừ với các số từ 6 đến 10. Ví dụ: 10-3, 8-5, 9-4...',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-14',
    duration: 720,
    order: 14,
    isPreview: false,
    quiz: {
      title: 'Kiểm tra: Phép trừ cơ bản',
      description: 'Bài kiểm tra về phép trừ trong phạm vi 10',
      duration: 10,
      passingScore: 70,
      maxAttempts: 3,
      order: 5,
      isActive: true,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: '7 - 3 = ?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          explanation: '7 trừ 3 bằng 4. Từ 7 lấy đi 3 còn lại 4.',
          points: 10,
          order: 1,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: '10 - 6 = ?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          explanation: '10 trừ 6 bằng 4.',
          points: 10,
          order: 2,
        },
        {
          type: QuestionType.FILL_BLANK,
          question: '8 - ___ = 5',
          correctAnswer: '3',
          explanation: '8 trừ 3 bằng 5. Vậy số cần điền là 3.',
          points: 10,
          order: 3,
        },
        {
          type: QuestionType.TRUE_FALSE,
          question: 'Đúng hay Sai: 9 - 4 = 5',
          correctAnswer: 'Đúng',
          explanation: 'Đúng! 9 trừ 4 bằng 5.',
          points: 10,
          order: 4,
        },
      ],
    },
  },

  // CHƯƠNG 5: Luyện tập tổng hợp
  {
    title: 'Bài 15: Luyện tập cộng và trừ',
    description: 'Ôn tập và thực hành cả phép cộng và phép trừ. Bài tập đa dạng và thú vị.',
    videoUrl: 'https://www.youtube.com/embed/sample-math-1-15',
    duration: 900,
    order: 15,
    isPreview: false,
    quiz: {
      title: 'Bài tập tổng hợp: Cộng và Trừ',
      description: 'Bài kiểm tra tổng hợp cả phép cộng và phép trừ',
      duration: 15,
      passingScore: 70,
      maxAttempts: 3,
      order: 6,
      isActive: true,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: '2 + 3 = ?',
          options: ['4', '5', '6', '7'],
          correctAnswer: '5',
          explanation: '2 + 3 = 5',
          points: 10,
          order: 1,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: '6 - 2 = ?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          explanation: '6 - 2 = 4',
          points: 10,
          order: 2,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: '3 + 4 = ?',
          options: ['5', '6', '7', '8'],
          correctAnswer: '7',
          explanation: '3 + 4 = 7',
          points: 10,
          order: 3,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: '9 - 5 = ?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          explanation: '9 - 5 = 4',
          points: 10,
          order: 4,
        },
        {
          type: QuestionType.FILL_BLANK,
          question: '7 + ___ = 10',
          correctAnswer: '3',
          explanation: '7 + 3 = 10',
          points: 10,
          order: 5,
        },
        {
          type: QuestionType.FILL_BLANK,
          question: '10 - ___ = 7',
          correctAnswer: '3',
          explanation: '10 - 3 = 7',
          points: 10,
          order: 6,
        },
        {
          type: QuestionType.TRUE_FALSE,
          question: 'Đúng hay Sai: 4 + 4 = 8',
          correctAnswer: 'Đúng',
          explanation: 'Đúng! 4 + 4 = 8',
          points: 10,
          order: 7,
        },
        {
          type: QuestionType.TRUE_FALSE,
          question: 'Đúng hay Sai: 5 - 2 = 4',
          correctAnswer: 'Sai',
          explanation: 'Sai! 5 - 2 = 3, không phải 4.',
          points: 10,
          order: 8,
        },
      ],
    },
  },
];

// ============================================
// LỚP 1 - TIẾNG VIỆT (Chương trình đầy đủ)
// ============================================
const vietnameseGrade1Lectures: LectureData[] = [
  // CHƯƠNG 1: Bảng chữ cái tiếng Việt
  {
    title: 'Bài 1: Giới thiệu bảng chữ cái tiếng Việt',
    description: 'Làm quen với 29 chữ cái trong bảng chữ cái tiếng Việt. Học cách đọc và viết chữ in hoa và chữ thường.',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-1',
    duration: 720,
    order: 1,
    isPreview: true,
  },
  {
    title: 'Bài 2: Học các nguyên âm đơn (a, e, i, o, u, y)',
    description: 'Nhận biết và phát âm 6 nguyên âm đơn cơ bản trong tiếng Việt',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-2',
    duration: 600,
    order: 2,
    isPreview: true,
  },
  {
    title: 'Bài 3: Học các nguyên âm (ă, â, ê, ô, ơ, ư)',
    description: 'Nhận biết và phát âm các nguyên âm có dấu đặc biệt',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-3',
    duration: 660,
    order: 3,
    isPreview: false,
    quiz: {
      title: 'Kiểm tra: Nhận biết nguyên âm',
      description: 'Bài kiểm tra giúp em nhận biết và phát âm các nguyên âm',
      duration: 5,
      passingScore: 70,
      maxAttempts: 3,
      order: 1,
      isActive: true,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Từ "mẹ" có nguyên âm nào?',
          options: ['a', 'e', 'i', 'o'],
          correctAnswer: 'e',
          explanation: 'Từ "mẹ" có nguyên âm "e".',
          points: 10,
          order: 1,
        },
        {
          type: QuestionType.TRUE_FALSE,
          question: 'Đúng hay Sai: "y" là một nguyên âm',
          correctAnswer: 'Đúng',
          explanation: 'Đúng, "y" là một trong 12 nguyên âm tiếng Việt.',
          points: 10,
          order: 2,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Có bao nhiêu nguyên âm trong tiếng Việt?',
          options: ['10', '11', '12', '13'],
          correctAnswer: '12',
          explanation: 'Tiếng Việt có 12 nguyên âm: a, ă, â, e, ê, i, o, ô, ơ, u, ư, y',
          points: 10,
          order: 3,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Từ "ơi" có nguyên âm nào?',
          options: ['o', 'ô', 'ơ', 'u'],
          correctAnswer: 'ơ',
          explanation: 'Từ "ơi" có nguyên âm "ơ".',
          points: 10,
          order: 4,
        },
      ],
    },
  },

  // CHƯƠNG 2: Phụ âm
  {
    title: 'Bài 4: Các phụ âm đơn (b, c, d, đ, g, h)',
    description: 'Học phát âm và viết các phụ âm đơn đầu tiên: b, c, d, đ, g, h',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-4',
    duration: 660,
    order: 4,
    isPreview: false,
  },
  {
    title: 'Bài 5: Các phụ âm đơn (k, l, m, n, p, q)',
    description: 'Tiếp tục học các phụ âm đơn: k, l, m, n, p, q',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-5',
    duration: 660,
    order: 5,
    isPreview: false,
  },
  {
    title: 'Bài 6: Các phụ âm đơn (r, s, t, v, x)',
    description: 'Hoàn thành 17 phụ âm đơn với: r, s, t, v, x',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-6',
    duration: 600,
    order: 6,
    isPreview: false,
    quiz: {
      title: 'Kiểm tra: Nhận biết phụ âm',
      description: 'Bài kiểm tra về các phụ âm đơn',
      duration: 5,
      passingScore: 70,
      maxAttempts: 3,
      order: 2,
      isActive: true,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Từ "ba" bắt đầu bằng phụ âm nào?',
          options: ['b', 'p', 'd', 'm'],
          correctAnswer: 'b',
          explanation: 'Từ "ba" bắt đầu bằng phụ âm "b".',
          points: 10,
          order: 1,
        },
        {
          type: QuestionType.TRUE_FALSE,
          question: 'Đúng hay Sai: Tiếng Việt có 17 phụ âm đơn',
          correctAnswer: 'Đúng',
          explanation: 'Đúng! Tiếng Việt có 17 phụ âm đơn.',
          points: 10,
          order: 2,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Chữ nào là phụ âm?',
          options: ['a', 'm', 'e', 'o'],
          correctAnswer: 'm',
          explanation: 'Chữ "m" là phụ âm, các chữ còn lại là nguyên âm.',
          points: 10,
          order: 3,
        },
      ],
    },
  },

  // CHƯƠNG 3: Ghép vần
  {
    title: 'Bài 7: Ghép vần đơn giản (ba, bo, bi)',
    description: 'Học cách ghép phụ âm với nguyên âm để tạo thành tiếng đơn giản',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-7',
    duration: 720,
    order: 7,
    isPreview: false,
  },
  {
    title: 'Bài 8: Đọc tiếng có vần (ma, me, mi, mo, mu)',
    description: 'Thực hành đọc các tiếng có vần đơn giản với phụ âm m',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-8',
    duration: 600,
    order: 8,
    isPreview: false,
  },
  {
    title: 'Bài 9: Đọc từ đơn giản (2-3 tiếng)',
    description: 'Học đọc các từ đơn giản: mama, baba, caca...',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-9',
    duration: 720,
    order: 9,
    isPreview: false,
    quiz: {
      title: 'Kiểm tra: Ghép vần và đọc từ',
      description: 'Bài kiểm tra về ghép vần và đọc từ đơn giản',
      duration: 8,
      passingScore: 70,
      maxAttempts: 3,
      order: 3,
      isActive: true,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Ghép phụ âm "b" với nguyên âm "a" được tiếng gì?',
          options: ['ba', 'ab', 'pa', 'ap'],
          correctAnswer: 'ba',
          explanation: 'Phụ âm "b" ghép với nguyên âm "a" được tiếng "ba".',
          points: 10,
          order: 1,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Từ "mẹ" có mấy tiếng?',
          options: ['1 tiếng', '2 tiếng', '3 tiếng'],
          correctAnswer: '1 tiếng',
          explanation: 'Từ "mẹ" chỉ có 1 tiếng.',
          points: 10,
          order: 2,
        },
        {
          type: QuestionType.TRUE_FALSE,
          question: 'Đúng hay Sai: Từ "mama" có 2 tiếng',
          correctAnswer: 'Đúng',
          explanation: 'Đúng! Từ "mama" có 2 tiếng giống nhau: "ma" + "ma".',
          points: 10,
          order: 3,
        },
        {
          type: QuestionType.FILL_BLANK,
          question: 'Điền chữ: b + o = ___',
          correctAnswer: 'bo',
          explanation: 'Phụ âm "b" ghép với nguyên âm "o" được tiếng "bo".',
          points: 10,
          order: 4,
        },
      ],
    },
  },

  // CHƯƠNG 4: Dấu thanh
  {
    title: 'Bài 10: Làm quen với dấu thanh',
    description: 'Giới thiệu 5 dấu thanh trong tiếng Việt: sắc, huyền, hỏi, ngã, nặng',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-10',
    duration: 660,
    order: 10,
    isPreview: false,
  },
  {
    title: 'Bài 11: Đọc tiếng có dấu thanh',
    description: 'Thực hành đọc các tiếng có các dấu thanh khác nhau',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-11',
    duration: 720,
    order: 11,
    isPreview: false,
    quiz: {
      title: 'Kiểm tra: Dấu thanh',
      description: 'Bài kiểm tra về các dấu thanh tiếng Việt',
      duration: 5,
      passingScore: 70,
      maxAttempts: 3,
      order: 4,
      isActive: true,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Tiếng Việt có bao nhiêu dấu thanh?',
          options: ['4 dấu', '5 dấu', '6 dấu', '7 dấu'],
          correctAnswer: '5 dấu',
          explanation: 'Tiếng Việt có 5 dấu thanh: sắc, huyền, hỏi, ngã, nặng.',
          points: 10,
          order: 1,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Từ "mẹ" có dấu gì?',
          options: ['Dấu sắc', 'Dấu huyền', 'Dấu hỏi', 'Dấu nặng'],
          correctAnswer: 'Dấu huyền',
          explanation: 'Từ "mẹ" có dấu huyền (̀).',
          points: 10,
          order: 2,
        },
        {
          type: QuestionType.TRUE_FALSE,
          question: 'Đúng hay Sai: "má" có dấu sắc',
          correctAnswer: 'Đúng',
          explanation: 'Đúng! "má" có dấu sắc (́).',
          points: 10,
          order: 3,
        },
      ],
    },
  },

  // CHƯƠNG 5: Đọc câu đơn giản
  {
    title: 'Bài 12: Đọc câu ngắn (3-4 từ)',
    description: 'Học đọc các câu đơn giản: "Mẹ đi chợ", "Ba đọc báo"...',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-12',
    duration: 780,
    order: 12,
    isPreview: false,
  },
  {
    title: 'Bài 13: Viết từ đơn giản',
    description: 'Thực hành viết các từ đơn giản đã học',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-13',
    duration: 720,
    order: 13,
    isPreview: false,
  },
  {
    title: 'Bài 14: Kể chuyện bằng tranh',
    description: 'Học cách kể lại câu chuyện đơn giản thông qua hình ảnh',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-14',
    duration: 840,
    order: 14,
    isPreview: false,
  },
  {
    title: 'Bài 15: Ôn tập tổng hợp',
    description: 'Ôn tập toàn bộ kiến thức Tiếng Việt lớp 1: bảng chữ cái, ghép vần, dấu thanh',
    videoUrl: 'https://www.youtube.com/embed/sample-vietnamese-1-15',
    duration: 900,
    order: 15,
    isPreview: false,
    quiz: {
      title: 'Bài kiểm tra tổng hợp Tiếng Việt Lớp 1',
      description: 'Bài kiểm tra tổng hợp toàn bộ kiến thức Tiếng Việt lớp 1',
      duration: 15,
      passingScore: 70,
      maxAttempts: 3,
      order: 5,
      isActive: true,
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Tiếng Việt có bao nhiêu chữ cái?',
          options: ['27', '28', '29', '30'],
          correctAnswer: '29',
          explanation: 'Tiếng Việt có 29 chữ cái.',
          points: 10,
          order: 1,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Có bao nhiêu nguyên âm?',
          options: ['10', '11', '12', '13'],
          correctAnswer: '12',
          explanation: 'Có 12 nguyên âm trong tiếng Việt.',
          points: 10,
          order: 2,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Có bao nhiêu phụ âm đơn?',
          options: ['15', '16', '17', '18'],
          correctAnswer: '17',
          explanation: 'Có 17 phụ âm đơn trong tiếng Việt.',
          points: 10,
          order: 3,
        },
        {
          type: QuestionType.TRUE_FALSE,
          question: 'Đúng hay Sai: Tiếng Việt có 5 dấu thanh',
          correctAnswer: 'Đúng',
          explanation: 'Đúng! Có 5 dấu thanh: sắc, huyền, hỏi, ngã, nặng.',
          points: 10,
          order: 4,
        },
        {
          type: QuestionType.MULTIPLE_CHOICE,
          question: 'Từ "học" có mấy tiếng?',
          options: ['1 tiếng', '2 tiếng', '3 tiếng'],
          correctAnswer: '1 tiếng',
          explanation: 'Từ "học" chỉ có 1 tiếng.',
          points: 10,
          order: 5,
        },
        {
          type: QuestionType.FILL_BLANK,
          question: 'Ghép: m + a = ___',
          correctAnswer: 'ma',
          explanation: 'Phụ âm "m" ghép với nguyên âm "a" được tiếng "ma".',
          points: 10,
          order: 6,
        },
      ],
    },
  },
];

// ============================================
// LỚP 2 - TOÁN HỌC (CHƯA SỬ DỤNG - SAU KHI TEST LỚP 1 THÀNH CÔNG)
// ============================================
/* 
const mathGrade2Lectures: LectureData[] = [
  {
    title: 'Bài 1: Cộng không nhớ trong phạm vi 20',
    description: 'Học phép cộng các số trong phạm vi 20 không có nhớ',
    videoUrl: 'https://www.youtube.com/embed/sample-math2-1',
    duration: 450,
    order: 1,
    isPreview: true,
  },
  // ... more lectures
];
*/

// ============================================
// LỚP 3 - TOÁN HỌC (CHƯA SỬ DỤNG - SAU KHI TEST LỚP 1 THÀNH CÔNG)
// ============================================
/*
const mathGrade3Lectures: LectureData[] = [
  // ... lectures
];
*/

// ============================================
// LỚP 3 - TIẾNG ANH (CHƯA SỬ DỤNG - SAU KHI TEST LỚP 1 THÀNH CÔNG)
// ============================================
/*
const englishGrade3Lectures: LectureData[] = [
  // ... lectures
];
*/

// ============================================
// LỚP 4 - KHOA HỌC (CHƯA SỬ DỤNG - SAU KHI TEST LỚP 1 THÀNH CÔNG)
// ============================================
/*
const scienceGrade4Lectures: LectureData[] = [
  // ... lectures
];
*/

// ============================================
// LỚP 5 - KHOA HỌC (CHƯA SỬ DỤNG - SAU KHI TEST LỚP 1 THÀNH CÔNG)
// ============================================
/*
const scienceGrade5Lectures: LectureData[] = [
  // ... lectures
];
*/

// ============================================
// DANH SÁCH KHÓA HỌC - CHỈ LỚP 1 (Testing Phase)
// ============================================
const coursesData: CourseData[] = [
  // ==================== LỚP 1 ====================
  {
    title: 'Toán Lớp 1 - Học Đếm và Phép Tính Cơ Bản',
    slug: 'toan-lop-1-hoc-dem-va-phep-tinh-co-ban',
    description:
      'Khóa học toán dành cho học sinh lớp 1, giúp các em làm quen với số học cơ bản, đếm số từ 0 đến 10, và các phép tính cộng trừ đơn giản. Nội dung được thiết kế phù hợp với chương trình Giáo dục Phổ thông 2018.',
    thumbnail: '/images/courses/math-grade1.jpg',
    subject: Subject.MATH,
    grade: Grade.GRADE_1,
    level: CourseLevel.BEGINNER,
    duration: 3000, // Tổng thời lượng ước tính (phút)
    isPublished: true,
    isFree: true,
    order: 1,
    lectures: mathGrade1Lectures,
  },
  {
    title: 'Tiếng Việt Lớp 1 - Bảng Chữ Cái và Vần',
    slug: 'tieng-viet-lop-1-bang-chu-cai-va-van',
    description:
      'Khóa học Tiếng Việt lớp 1 giúp các em làm quen với bảng chữ cái, phát âm chuẩn, học các nguyên âm, phụ âm và cách ghép vần cơ bản.',
    thumbnail: '/images/courses/vietnamese-grade1.jpg',
    subject: Subject.VIETNAMESE,
    grade: Grade.GRADE_1,
    level: CourseLevel.BEGINNER,
    duration: 2500,
    isPublished: true,
    isFree: true,
    order: 2,
    lectures: vietnameseGrade1Lectures,
  },
];

/*
// ==================== LỚP 2-5 (COMMENT ĐỂ SAU KHI TEST LỚP 1 THÀNH CÔNG) ====================
// Uncomment và thêm vào coursesData[] array phía trên sau khi test thành công lớp 1

{
  title: 'Toán Lớp 2 - Phép Cộng Trừ và Bảng Nhân',
  slug: 'toan-lop-2-phep-cong-tru-va-bang-nhan',
  description: '...',
  subject: Subject.MATH,
  grade: Grade.GRADE_2,
  level: CourseLevel.BEGINNER,
  duration: 2800,
  isPublished: true,
  isFree: true,
  order: 3,
  lectures: mathGrade2Lectures,
},
... (other grades)
*/

// ============================================
// HÀM SEED COURSES
// ============================================
export async function seedCourses() {
  console.log('🌱 Seeding courses...');

  for (const courseData of coursesData) {
    console.log(`\n📚 Creating course: ${courseData.title}`);

    // Create or update course
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

    console.log(`✅ Course created: ${course.title} (${course.id})`);

    // Create lectures
    for (const lectureData of courseData.lectures) {
      const lectureSlug = `${courseData.slug}-${lectureData.order}`;

      const lecture = await prisma.lecture.upsert({
        where: { slug: lectureSlug },
        update: {
          title: lectureData.title,
          description: lectureData.description,
          videoUrl: lectureData.videoUrl,
          duration: lectureData.duration,
          order: lectureData.order,
          isPreview: lectureData.isPreview,
        },
        create: {
          courseId: course.id,
          title: lectureData.title,
          slug: lectureSlug,
          description: lectureData.description,
          videoUrl: lectureData.videoUrl,
          duration: lectureData.duration,
          order: lectureData.order,
          isPreview: lectureData.isPreview,
        },
      });

      console.log(`  📖 Lecture created: ${lecture.title}`);

      // Create quiz if exists
      if (lectureData.quiz) {
        const quizData = lectureData.quiz;

        // Find existing quiz with same courseId and order
        let quiz = await prisma.quiz.findFirst({
          where: {
            courseId: course.id,
            order: quizData.order,
          },
        });

        if (quiz) {
          // Update existing quiz
          quiz = await prisma.quiz.update({
            where: { id: quiz.id },
            data: {
              title: quizData.title,
              description: quizData.description,
              duration: quizData.duration,
              passingScore: quizData.passingScore,
              maxAttempts: quizData.maxAttempts,
              isActive: quizData.isActive,
            },
          });
        } else {
          // Create new quiz
          quiz = await prisma.quiz.create({
            data: {
              courseId: course.id,
              title: quizData.title,
              description: quizData.description,
              duration: quizData.duration,
              passingScore: quizData.passingScore,
              maxAttempts: quizData.maxAttempts,
              order: quizData.order,
              isActive: quizData.isActive,
            },
          });
        }

        console.log(`    ❓ Quiz created: ${quiz.title}`);

        // Create questions
        for (const questionData of quizData.questions) {
          // Find existing question with same quizId and order
          const existingQuestion = await prisma.question.findFirst({
            where: {
              quizId: quiz.id,
              order: questionData.order,
            },
          });

          if (existingQuestion) {
            // Update existing question
            await prisma.question.update({
              where: { id: existingQuestion.id },
              data: {
                type: questionData.type,
                question: questionData.question,
                options: questionData.options || undefined,
                correctAnswer: questionData.correctAnswer,
                explanation: questionData.explanation,
                points: questionData.points,
              },
            });
          } else {
            // Create new question
            await prisma.question.create({
              data: {
                quizId: quiz.id,
                type: questionData.type,
                question: questionData.question,
                options: questionData.options || undefined,
                correctAnswer: questionData.correctAnswer,
                explanation: questionData.explanation,
                points: questionData.points,
                order: questionData.order,
              },
            });
          }
        }

        console.log(`      ✅ ${quizData.questions.length} questions created`);
      }
    }
  }

  console.log('\n✅ Courses seeding completed!');
}

// Export for use in main seed file
export default seedCourses;
