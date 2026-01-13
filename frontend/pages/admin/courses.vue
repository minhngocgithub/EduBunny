<template>
  <div class="space-y-8">
    <!-- Action Bar -->
    <div class="flex justify-between items-center">
      <div class="flex gap-4">
        <button
          class="px-6 py-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-slate-600 dark:text-slate-400 shadow-sm border border-white dark:border-white/5 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <span class="material-symbols-outlined">file_download</span> Xuất CSV
        </button>
        <button
          class="px-6 py-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-slate-600 dark:text-slate-400 shadow-sm border border-white dark:border-white/5 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <span class="material-symbols-outlined">filter_list</span> Bộ lọc
        </button>
      </div>
      <button @click="showCreateModal = true"
        class="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all">
        <span class="material-symbols-outlined">add</span> Thêm khóa học mới
      </button>
    </div>

    <!-- Courses Table -->
    <div
      class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden border border-white dark:border-white/5">
      <table class="w-full text-left">
        <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5">
          <tr>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên khóa học</th>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Môn học</th>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cấp độ</th>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bài giảng</th>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Học sinh</th>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hành động</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-white/5">
          <tr v-for="course in courses" :key="course.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <td class="px-8 py-6">
              <div class="flex items-center gap-3">
                <div
                  class="size-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                  {{ course.title.charAt(0) }}
                </div>
                <div>
                  <p class="font-bold text-slate-800 dark:text-white">{{ course.title }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ course.description?.slice(0, 30) }}...</p>
                </div>
              </div>
            </td>
            <td class="px-8 py-6">
              <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary">
                {{ getSubjectName(course.subject) }}
              </span>
            </td>
            <td class="px-8 py-6">
              <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Lớp {{ course.grade }}</span>
            </td>
            <td class="px-8 py-6 font-medium text-slate-500 dark:text-slate-400">{{ course.lectureCount || 0 }} bài</td>
            <td class="px-8 py-6 font-medium text-slate-500 dark:text-slate-400">{{ course.enrollmentCount || 0 }}</td>
            <td class="px-8 py-6">
              <span
                :class="`px-3 py-1 rounded-full text-[10px] font-black uppercase ${course.isPublished ? 'bg-success/10 text-success' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`">
                {{ course.isPublished ? 'Công khai' : 'Nháp' }}
              </span>
            </td>
            <td class="px-8 py-6">
              <div class="flex gap-2">
                <NuxtLink :to="`/admin/courses/${course.id}`"
                  class="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <span class="material-symbols-outlined text-xl">edit</span>
                </NuxtLink>
                <button @click="deleteCourse(course.id)"
                  class="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                  <span class="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center">
      <p class="text-sm text-slate-500 dark:text-slate-400">Hiển thị {{ courses.length }} khóa học</p>
      <div class="flex gap-2">
        <button
          class="size-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <button class="size-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold">1</button>
        <button
          class="size-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all font-bold text-slate-600 dark:text-slate-400">2</button>
        <button
          class="size-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Create Modal -->
    <AppModal v-if="showCreateModal" @close="showCreateModal = false">
      <template #title>Tạo khóa học mới</template>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên khóa học</label>
          <input type="text" v-model="newCourse.title" class="input w-full" placeholder="VD: Toán học lớp 1" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mô tả</label>
          <textarea v-model="newCourse.description" class="input w-full" rows="3"
            placeholder="Mô tả khóa học..."></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Môn học</label>
            <select v-model="newCourse.subject" class="input w-full">
              <option value="MATH">Toán học</option>
              <option value="VIETNAMESE">Tiếng Việt</option>
              <option value="ENGLISH">Tiếng Anh</option>
              <option value="SCIENCE">Khoa học</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lớp</label>
            <select v-model="newCourse.grade" class="input w-full">
              <option value="GRADE_1">Lớp 1</option>
              <option value="GRADE_2">Lớp 2</option>
              <option value="GRADE_3">Lớp 3</option>
              <option value="GRADE_4">Lớp 4</option>
              <option value="GRADE_5">Lớp 5</option>
            </select>
          </div>
        </div>
      </div>
      <template #actions>
        <button @click="showCreateModal = false" class="btn-secondary">Hủy</button>
        <button @click="createCourse" class="btn-primary">Tạo khóa học</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const showCreateModal = ref(false);
const courses = ref([
  {
    id: 1,
    title: 'Giải đố Phân số',
    description: 'Học phân số qua các trò chơi vui nhộn',
    subject: 'MATH',
    grade: 'GRADE_3',
    lectureCount: 12,
    enrollmentCount: 1240,
    isPublished: true,
  },
  {
    id: 2,
    title: 'Kể chuyện Sáng tạo',
    description: 'Phát triển kỹ năng viết và sáng tạo',
    subject: 'VIETNAMESE',
    grade: 'GRADE_2',
    lectureCount: 8,
    enrollmentCount: 850,
    isPublished: false,
  },
  {
    id: 3,
    title: 'Hệ Mặt Trời',
    description: 'Khám phá vũ trụ và các hành tinh',
    subject: 'SCIENCE',
    grade: 'GRADE_4',
    lectureCount: 15,
    enrollmentCount: 2100,
    isPublished: true,
  },
  {
    id: 4,
    title: 'Giao tiếp Cơ bản',
    description: 'English conversation cho trẻ em',
    subject: 'ENGLISH',
    grade: 'GRADE_1',
    lectureCount: 10,
    enrollmentCount: 1560,
    isPublished: true,
  },
]);

const newCourse = ref({
  title: '',
  description: '',
  subject: 'MATH',
  grade: 'GRADE_1',
});

const getSubjectName = (subject: string) => {
  const subjects: Record<string, string> = {
    MATH: 'Toán',
    VIETNAMESE: 'Tiếng Việt',
    ENGLISH: 'Tiếng Anh',
    SCIENCE: 'Khoa học',
  };
  return subjects[subject] || subject;
};

const createCourse = async () => {
  // TODO: Call API to create course
  console.log('Creating course:', newCourse.value);
  showCreateModal.value = false;
};

const deleteCourse = async (id: number) => {
  if (confirm('Bạn có chắc muốn xóa khóa học này?')) {
    // TODO: Call API to delete course
    console.log('Deleting course:', id);
  }
};

useHead({
  title: 'Quản lý Khóa học - Admin',
});
</script>
