/* eslint-disable no-console */
import { PrismaClient, Subject, Grade, CourseLevel } from '@prisma/client';

const prisma = new PrismaClient();

interface LectureData {
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in minutes
  order: number;
  isPreview: boolean;
}

// ============================================
// LỚP 1 - TỰ NHIÊN & XÃ HỘI
// Dựa trên chương trình GDPT 2018
// ============================================
const natureSocialGrade1Lectures: LectureData[] = [
  // CHƯƠNG 1: Gia đình (5 tiết)
  {
    title: 'Bài 1: Em là ai?',
    description: 'Giúp các em nhận biết bản thân, tên, tuổi, giới tính và những đặc điểm riêng của mình. Học cách giới thiệu bản thân với bạn bè.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo1',
    duration: 5,
    order: 1,
    isPreview: true,
  },
  {
    title: 'Bài 2: Người thân của em',
    description: 'Tìm hiểu về các thành viên trong gia đình: bố, mẹ, ông, bà, anh, chị, em. Học cách yêu thương và chăm sóc gia đình.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo2',
    duration: 7,
    order: 2,
    isPreview: true,
  },
  {
    title: 'Bài 3: Nhà ở của gia đình',
    description: 'Nhận biết các loại nhà ở: nhà cấp 4, nhà tầng, chung cư. Tìm hiểu về các phòng trong nhà và công dụng của từng phòng.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo3',
    duration: 7,
    order: 3,
    isPreview: false,
  },

  // CHƯƠNG 2: Trường học (5 tiết)
  {
    title: 'Bài 4: Giới thiệu trường học',
    description: 'Làm quen với trường học: phòng học, sân chơi, thư viện, phòng y tế. Học cách di chuyển an toàn trong trường.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo4',
    duration: 5,
    order: 4,
    isPreview: false,
  },
  {
    title: 'Bài 5: Học sinh và giáo viên',
    description: 'Tìm hiểu về vai trò của giáo viên và học sinh. Học cách chào hỏi, tôn trọng thầy cô và bạn bè.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo5',
    duration: 7,
    order: 5,
    isPreview: false,
  },
  {
    title: 'Bài 6: Hoạt động ở trường',
    description: 'Các hoạt động trong ngày học: vào lớp, học bài, giờ ra chơi, ăn trưa. Học cách tham gia các hoạt động tập thể.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo6',
    duration: 7,
    order: 6,
    isPreview: false,
  },

  // CHƯƠNG 3: Cộng đồng địa phương (5 tiết)
  {
    title: 'Bài 7: Làng xóm xung quanh',
    description: 'Tìm hiểu về khu vực sống xung quanh: hàng xóm, con đường, cửa hàng gần nhà. Học cách tương tác với cộng đồng.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo7',
    duration: 5,
    order: 7,
    isPreview: false,
  },
  {
    title: 'Bài 8: Các nghề và việc làm',
    description: 'Nhận biết các nghề nghiệp phổ biến: bác sĩ, giáo viên, nông dân, công nhân. Hiểu được công việc của từng nghề.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo8',
    duration: 7,
    order: 8,
    isPreview: false,
  },
  {
    title: 'Bài 9: An toàn trên đường',
    description: 'Học các quy tắc an toàn giao thông: qua đường đúng chỗ, nhận biết đèn giao thông, đi bộ an toàn.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo9',
    duration: 7,
    order: 9,
    isPreview: false,
  },

  // CHƯƠNG 4: Thực vật và Động vật (6 tiết)
  {
    title: 'Bài 10: Thực vật xung quanh',
    description: 'Nhận biết các loại cây cối xung quanh: cây ăn trái, cây cảnh, cây rừng. Tìm hiểu về bộ phận của cây: rễ, thân, lá, hoa, quả.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo10',
    duration: 7,
    order: 10,
    isPreview: false,
  },
  {
    title: 'Bài 11: Động vật xung quanh',
    description: 'Nhận biết các loại động vật quen thuộc: thú cưng (chó, mèo), gia cầm (gà, vịt), động vật hoang dã. Tìm hiểu đặc điểm và nơi sống của chúng.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo11',
    duration: 7,
    order: 11,
    isPreview: false,
  },
  {
    title: 'Bài 12: Chăm sóc cây và vật nuôi',
    description: 'Học cách chăm sóc cây: tưới nước, bón phân. Cách nuôi vật nuôi: cho ăn, vệ sinh. Hiểu được trách nhiệm khi chăm sóc sinh vật.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo12',
    duration: 7,
    order: 12,
    isPreview: false,
  },

  // CHƯƠNG 5: Con người và Sức khỏe (6 tiết)
  {
    title: 'Bài 13: Các bộ phận cơ thể',
    description: 'Nhận biết các bộ phận trên cơ thể: đầu, tay, chân, bụng, lưng. Hiểu được chức năng cơ bản của từng bộ phận.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo13',
    duration: 7,
    order: 13,
    isPreview: false,
  },
  {
    title: 'Bài 14: Giữ vệ sinh và sức khỏe',
    description: 'Học cách giữ vệ sinh cá nhân: đánh răng, rửa tay, tắm rửa. Hiểu tại sao phải giữ vệ sinh để khỏe mạnh.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo14',
    duration: 7,
    order: 14,
    isPreview: false,
  },
  {
    title: 'Bài 15: Giác quan của con người',
    description: 'Tìm hiểu 5 giác quan: thị giác (mắt), thính giác (tai), khứu giác (mũi), vị giác (lưỡi), xúc giác (da). Thực hành sử dụng các giác quan.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo15',
    duration: 7,
    order: 15,
    isPreview: false,
  },

  // CHƯƠNG 6: Trái Đất và Bầu trời (4 tiết)
  {
    title: 'Bài 16: Bầu trời ban ngày, ban đêm',
    description: 'Quan sát sự khác biệt giữa ban ngày và ban đêm. Tìm hiểu về Mặt Trời (ban ngày) và Mặt Trăng, các vì sao (ban đêm).',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo16',
    duration: 7,
    order: 16,
    isPreview: false,
  },
  {
    title: 'Bài 17: Thời tiết',
    description: 'Nhận biết các hiện tượng thời tiết: nắng, mưa, gió, mây. Học cách quan sát thời tiết hàng ngày.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo17',
    duration: 5,
    order: 17,
    isPreview: false,
  },
  {
    title: 'Bài 18: Mặt Trời và Mặt Trăng',
    description: 'Tìm hiểu về Mặt Trời - nguồn sáng và nhiệt của Trái Đất. Quan sát Mặt Trăng và các hình dạng khác nhau của nó.',
    videoUrl: 'https://www.youtube.com/watch?v=SampleVideo18',
    duration: 5,
    order: 18,
    isPreview: false,
  },
];

async function seedNatureSocialGrade1Course() {
  console.log('🌱 Seeding Tự Nhiên & Xã Hội Lớp 1 course...\n');

  try {
    // Check if course already exists
    const existingCourse = await prisma.course.findFirst({
      where: {
        slug: 'tu-nhien-xa-hoi-lop-1',
      },
    });

    if (existingCourse) {
      console.log('⚠️  Course "Tự Nhiên & Xã Hội Lớp 1" already exists. Skipping...\n');
      return;
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title: 'Tự Nhiên & Xã Hội Lớp 1 - Khám Phá Thế Giới Xung Quanh',
        slug: 'tu-nhien-xa-hoi-lop-1',
        description: 'Khóa học Tự Nhiên & Xã Hội dành cho học sinh lớp 1, giúp các em khám phá và hiểu biết về thế giới xung quanh: gia đình, trường học, cộng đồng, thiên nhiên và cơ thể con người.',
        thumbnail: '/images/courses/nature-social-grade1.jpg',
        subject: Subject.LIFE_SKILLS,
        grade: Grade.GRADE_1,
        level: CourseLevel.BEGINNER,
        duration: 0, // Will be auto-calculated from lectures
        isPublished: true,
        isFree: true,
        order: 3,
      },
    });

    console.log(`✅ Created course: ${course.title}`);
    console.log(`   ID: ${course.id}\n`);

    // Create lectures
    let createdLecturesCount = 0;
    for (const lectureData of natureSocialGrade1Lectures) {
      const lecture = await prisma.lecture.create({
        data: {
          courseId: course.id,
          title: lectureData.title,
          slug: lectureData.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim(),
          description: lectureData.description,
          videoUrl: lectureData.videoUrl,
          duration: lectureData.duration,
          order: lectureData.order,
          isPreview: lectureData.isPreview,
        },
      });

      createdLecturesCount++;
      console.log(`   📝 Created lecture ${lectureData.order}: ${lecture.title}`);
    }

    // Recalculate course duration (sum of all lectures)
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

    console.log(`\n✅ Successfully created ${createdLecturesCount} lectures`);
    console.log(`✅ Total course duration: ${totalDuration._sum.duration || 0} minutes\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Tự Nhiên & Xã Hội Lớp 1 course seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error seeding Tự Nhiên & Xã Hội Lớp 1 course:', error);
    throw error;
  }
}

// Run the seed
seedNatureSocialGrade1Course()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
