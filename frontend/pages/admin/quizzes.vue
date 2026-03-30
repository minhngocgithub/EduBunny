<template>
  <div class="grid lg:grid-cols-4 gap-8">
    <!-- Quiz Bank Sidebar -->
    <div class="lg:col-span-1 space-y-6">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm">
        <h4 class="font-display font-bold text-slate-800 dark:text-white mb-4">Ngân hàng câu hỏi</h4>
        <div class="space-y-3">
          <div v-for="(category, i) in questionBank" :key="i"
            class="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span class="text-xs font-bold text-slate-600 dark:text-slate-400">{{ category.label }}</span>
            <span :class="`text-xs font-black ${category.color}`">{{ category.count }}</span>
          </div>
        </div>
        <button
          class="w-full mt-6 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-700 dark:hover:bg-slate-600 transition-all">
          Quản lý kho câu hỏi
        </button>
      </div>

      <div class="bg-gradient-to-br from-accent to-purple-700 p-6 rounded-[2.5rem] text-white shadow-xl">
        <h4 class="font-display font-bold mb-2">Đố vui AI 🐰</h4>
        <p class="text-xs opacity-80 mb-6">Thỏ Ngọc đã tạo 1,200 câu đố thông minh trong tuần này.</p>
        <button
          class="w-full py-3 bg-white/20 backdrop-blur-md rounded-xl font-bold text-sm hover:bg-white/30 transition-all">
          Xem lịch sử AI
        </button>
      </div>
    </div>

    <!-- Quiz Performance -->
    <div class="lg:col-span-3 space-y-8">
      <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-white dark:border-white/5 shadow-sm">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-xl font-display font-bold text-slate-800 dark:text-white">Hiệu suất Đố vui</h3>
          <button @click="showCreateQuizModal = true"
            class="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all">
            <span class="material-symbols-outlined">add</span> Tạo Quiz mới
          </button>
        </div>

        <div class="space-y-8">
          <div v-for="(quiz, i) in quizzes" :key="i" class="group">
            <div class="flex justify-between items-end mb-3">
              <div>
                <h4 class="font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{{
                  quiz.title }}</h4>
                <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  {{ quiz.attempts.toLocaleString() }} lượt tham gia | {{ quiz.questionCount }} câu hỏi
                </p>
              </div>
              <div class="flex items-center gap-4">
                <span :class="`text-xl font-display font-bold ${quiz.avgScore < 70 ? 'text-primary' : 'text-success'}`">
                  {{ quiz.avgScore }}%
                </span>
                <button @click="editQuiz(quiz.id)"
                  class="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <span class="material-symbols-outlined text-xl">edit</span>
                </button>
              </div>
            </div>
            <div class="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
              <div
                :class="`h-full rounded-full transition-all duration-1000 ${quiz.avgScore < 70 ? 'bg-primary' : 'bg-success'}`"
                :style="{ width: `${quiz.avgScore}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Statistics -->
      <div class="grid md:grid-cols-3 gap-6">
        <div
          class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-white dark:border-white/5 text-center">
          <div class="size-16 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl font-bold">quiz</span>
          </div>
          <p class="text-3xl font-bold text-slate-800 dark:text-white">{{ totalQuizzes }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng số Quiz</p>
        </div>
        <div
          class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-white dark:border-white/5 text-center">
          <div class="size-16 mx-auto mb-4 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl font-bold">question_mark</span>
          </div>
          <p class="text-3xl font-bold text-slate-800 dark:text-white">{{ totalQuestions }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Câu hỏi</p>
        </div>
        <div
          class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-white dark:border-white/5 text-center">
          <div class="size-16 mx-auto mb-4 rounded-2xl bg-success/10 text-success flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl font-bold">trending_up</span>
          </div>
          <p class="text-3xl font-bold text-slate-800 dark:text-white">{{ avgCompletionRate }}%</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Tỷ lệ hoàn thành</p>
        </div>
      </div>
    </div>

    <!-- Create Quiz Modal -->
    <AppModal v-if="showCreateQuizModal" @close="showCreateQuizModal = false">
      <template #title>Tạo Quiz mới</template>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tiêu đề Quiz</label>
          <input type="text" v-model="newQuiz.title" class="input w-full" placeholder="VD: Kiểm tra Toán học" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mô tả</label>
          <textarea v-model="newQuiz.description" class="input w-full" rows="3" placeholder="Mô tả quiz..."></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Khóa học</label>
            <select v-model="newQuiz.courseId" class="input w-full">
              <option value="">Chọn khóa học</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thời gian (phút)</label>
            <input type="number" v-model="newQuiz.timeLimit" class="input w-full" placeholder="30" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Điểm qua môn (%)</label>
          <input type="number" v-model="newQuiz.passingScore" class="input w-full" placeholder="70" />
        </div>
      </div>
      <template #actions>
        <button @click="showCreateQuizModal = false" class="btn-secondary">Hủy</button>
        <button @click="createQuiz" class="btn-primary">Tạo Quiz</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { API_ENDPOINTS } from '~/types/api';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

type AdminQuizItem = {
  id: string;
  title: string;
  attempts: number;
  questionCount: number;
  avgScore: number;
};

type AdminCourseItem = {
  id: string;
  title: string;
};

const { apiClient } = useApiClient();
const { toast } = useSweetAlert();

const showCreateQuizModal = ref(false);
const loading = ref(false);
const courses = ref<AdminCourseItem[]>([]);

// Placeholder data - Sẽ được thay thế bằng API call khi backend sẵn sàng
const questionBank = ref([
  { label: 'Dễ (Grade 1-2)', count: 450, color: 'text-success' },
  { label: 'Trung bình (Grade 3-4)', count: 820, color: 'text-secondary' },
  { label: 'Khó (Grade 5)', count: 310, color: 'text-primary' },
]);

const quizzes = ref<AdminQuizItem[]>([]);

const newQuiz = ref({
  courseId: '',
  title: '',
  description: '',
  timeLimit: 30,
  passingScore: 70,
});

const totalQuizzes = computed(() => quizzes.value.length);
const totalQuestions = computed(() => quizzes.value.reduce((sum, quiz) => sum + quiz.questionCount, 0));
const avgCompletionRate = computed(() => {
  if (quizzes.value.length === 0) {
    return 0;
  }

  const total = quizzes.value.reduce((sum, quiz) => sum + quiz.avgScore, 0);
  return Math.round(total / quizzes.value.length);
});

const fetchCourses = async () => {
  try {
    const response = await apiClient.get<{ courses: AdminCourseItem[] }>(
      API_ENDPOINTS.COURSE.ADMIN.LIST
    );

    if (response.success && response.data?.courses) {
      courses.value = response.data.courses;
    }
  } catch {
    toast('Không thể tải danh sách khóa học', 'error');
  }
};

const fetchQuizzes = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get<{ quizzes: AdminQuizItem[] }>(API_ENDPOINTS.ADMIN.QUIZ.LIST);
    if (response.success && response.data?.quizzes) {
      quizzes.value = response.data.quizzes;
    } else {
      quizzes.value = [];
    }
  } catch {
    quizzes.value = [];
    toast('Không thể tải danh sách quiz', 'error');
  } finally {
    loading.value = false;
  }
};

const createQuiz = async () => {
  if (!newQuiz.value.title.trim()) {
    toast('Vui lòng nhập tiêu đề quiz', 'warning');
    return;
  }

  if (!newQuiz.value.courseId) {
    toast('Vui lòng chọn khóa học', 'warning');
    return;
  }

  try {
    loading.value = true;
    await apiClient.post(API_ENDPOINTS.ADMIN.QUIZ.CREATE, {
      courseId: newQuiz.value.courseId,
      title: newQuiz.value.title,
      description: newQuiz.value.description || null,
      duration: Number(newQuiz.value.timeLimit),
      passingScore: Number(newQuiz.value.passingScore),
    });

    toast('Tạo quiz thành công', 'success');
    showCreateQuizModal.value = false;
    newQuiz.value = {
      courseId: '',
      title: '',
      description: '',
      timeLimit: 30,
      passingScore: 70,
    };

    await fetchQuizzes();
  } catch {
    toast('Không thể tạo quiz', 'error');
  } finally {
    loading.value = false;
  }
};

const editQuiz = (quizId: string) => {
  toast(`Quiz ${quizId} - màn hình chỉnh sửa sẽ được bổ sung`, 'info');
};

onMounted(async () => {
  await Promise.all([fetchCourses(), fetchQuizzes()]);
});

useHead({
  title: 'Quản lý Quiz - Admin',
});
</script>
