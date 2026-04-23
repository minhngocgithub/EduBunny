<template>
  <div
    class="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
    <!-- AppNavbar -->
    <LayoutAppNavbar />

    <!-- Main Content -->
    <div class="container px-4 pt-24 pb-20 mx-auto max-w-7xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <NuxtLink to="/dashboard"
            class="flex items-center justify-center transition-all border-2 border-gray-200 rounded-2xl size-12 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800">
            <span class="text-2xl material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back</span>
          </NuxtLink>
          <h1 class="text-3xl font-bold font-display text-slate-800 dark:text-white">
            Khóa học
          </h1>
        </div>
        <button
          class="flex items-center justify-center transition-all border-2 border-gray-200 rounded-2xl size-12 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800">
          <span class="text-2xl material-symbols-outlined text-slate-700 dark:text-slate-300">notifications</span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="relative mb-6">
        <span class="absolute text-2xl text-orange-500 -translate-y-1/2 material-symbols-outlined left-5 top-1/2">
          search
        </span>
        <input v-model="searchQuery" type="text" placeholder="Tìm kiếm khóa học thú vị..."
          class="w-full py-4 pl-16 pr-6 text-lg font-medium transition-all border-2 border-gray-200 text-slate-700 dark:text-white bg-white/80 dark:bg-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:border-slate-700" />
      </div>

      <!-- Grade Filter Pills -->
      <div class="mb-6">
        <h2 class="mb-3 text-lg font-bold text-slate-800 dark:text-white">Chọn lớp học</h2>
        <div class="flex flex-wrap gap-3">
          <button @click="selectedGrade = ''"
            :class="selectedGrade === ''
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-gray-200 dark:border-slate-700'"
            class="px-6 py-3 text-base font-bold transition-all rounded-full hover:scale-105 active:scale-95">
            Tất cả
          </button>
          <button v-for="grade in grades" :key="grade.value" @click="selectedGrade = grade.value"
            :class="selectedGrade === grade.value
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-gray-200 dark:border-slate-700'"
            class="px-6 py-3 text-base font-bold transition-all rounded-full hover:scale-105 active:scale-95">
            {{ grade.label }}
          </button>
        </div>
      </div>

      <!-- Subject Filter Pills -->
      <div class="mb-8">
        <h2 class="mb-3 text-lg font-bold text-slate-800 dark:text-white">Môn học</h2>
        <div class="flex flex-wrap gap-3">
          <button @click="selectedSubject = ''"
            :class="selectedSubject === ''
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-gray-200 dark:border-slate-700'"
            class="flex items-center gap-2 px-5 py-3 text-base font-bold transition-all rounded-2xl hover:scale-105 active:scale-95">
            <span>Tất cả</span>
          </button>
          <button v-for="subject in subjects" :key="subject.value" @click="selectedSubject = subject.value"
            :class="selectedSubject === subject.value
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-gray-200 dark:border-slate-700'"
            class="flex items-center gap-2 px-5 py-3 text-base font-bold transition-all rounded-2xl hover:scale-105 active:scale-95">
            <span>{{ subject.label }}</span>
          </button>
        </div>
      </div>



      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i"
          class="overflow-hidden border-2 border-gray-200 shadow-lg dark:border-slate-700 bg-white/80 dark:bg-slate-800 rounded-3xl animate-pulse">
          <div class="h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800"></div>
          <div class="p-5 space-y-3">
            <div class="h-6 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
            <div class="h-4 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
            <div class="w-2/3 h-4 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredCourses.length === 0"
        class="py-20 text-center border-2 border-gray-200 shadow-lg dark:border-slate-700 bg-white/80 dark:bg-slate-800 rounded-3xl">
        <span class="block mb-4 text-8xl">🔍</span>
        <h3 class="mb-2 text-2xl font-bold text-slate-700 dark:text-slate-300">
          Không tìm thấy khóa học
        </h3>
        <p class="text-lg text-slate-500 dark:text-slate-400">
          Thử thay đổi bộ lọc hoặc tìm kiếm khác nhé!
        </p>
      </div>

      <!-- Courses Grid -->
      <div v-else>
        <!-- Section Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-800 dark:text-white">
            {{ getSectionTitle() }}
          </h2>
          <p class="text-base font-semibold text-slate-500 dark:text-slate-400">
            {{ filteredCourses.length }} khóa học
          </p>
        </div>

        <!-- Course Cards Grid -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="course in paginatedCourses" :key="course.id" @click="handleCourseClick(course)"
            class="overflow-hidden transition-all duration-300 border-2 border-gray-200 cursor-pointer group dark:border-slate-700 bg-white/80 dark:bg-slate-800 rounded-3xl hover:shadow-2xl hover:-translate-y-2 hover:border-orange-500"
            :class="{
              'opacity-70': course.isPublished === false,
            }">
            <!-- Course Thumbnail -->
            <div
              class="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30">
              <img v-if="course.thumbnail" :src="course.thumbnail" :alt="course.title"
                class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
              <div v-else class="flex items-center justify-center w-full h-full text-7xl">
                {{ getSubjectIcon(course.subject) }}
              </div>

              <!-- Lock Overlay for Unpublished Courses -->
              <div v-if="course.isPublished === false"
                class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-sm">
                <span class="text-6xl text-white material-symbols-outlined drop-shadow-2xl">
                  lock
                </span>
                <span class="px-4 py-2 text-sm font-bold text-white rounded-full bg-black/60">
                  🔜 Sắp ra mắt
                </span>
              </div>

              <!-- Grade Badge -->
              <div class="absolute top-3 left-3">
                <span
                  class="px-4 py-2 text-xs font-black text-white uppercase rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-purple-600">
                  {{ getGradeName(course.grade) }}
                </span>
              </div>

              <!-- Free Badge -->
              <div v-if="course.isFree" class="absolute top-3 right-3">
                <span
                  class="px-4 py-2 text-xs font-black text-white uppercase rounded-full shadow-lg bg-gradient-to-r from-green-500 to-green-600">
                  ⭐ Miễn phí
                </span>
              </div>

              <!-- Progress Bar (if has real progress) -->
              <div v-if="hasLearningProgress(course)" class="absolute bottom-0 left-0 right-0 h-2 bg-white/30">
                <div class="h-full bg-gradient-to-r from-orange-500 to-orange-600" :style="{ width: `${getCourseProgress(course)}%` }"></div>
              </div>
            </div>

            <!-- Course Content -->
            <div class="p-5">
              <!-- Continue/Enroll Button -->
              <button v-if="course.isEnrolled && hasLearningProgress(course)"
                class="w-full px-4 py-2.5 mb-3 text-sm font-bold text-white transition-all rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/50">
                Tiếp tục học • {{ getCourseProgress(course) }}% hoàn thành
              </button>
              <button v-else-if="course.isEnrolled"
                class="w-full px-4 py-2.5 mb-3 text-sm font-bold text-white transition-all rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/50">
                Vào học ngay
              </button>
              <button v-else-if="course.isPublished !== false"
                class="w-full px-4 py-2.5 mb-3 text-sm font-bold transition-all border-2 border-orange-500 rounded-full text-orange-600 hover:bg-orange-500 hover:text-white dark:text-orange-400">
                Đăng ký học
              </button>

              <!-- Course Title -->
              <h3
                class="mb-2 text-xl font-bold leading-tight transition-colors text-slate-800 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                {{ course.title }}
              </h3>

              <!-- Rating -->
              <div v-if="course.avgRating" class="flex items-center gap-2 mb-3">
                <div class="flex items-center gap-1">
                  <span class="text-lg text-yellow-500 material-symbols-outlined">star</span>
                  <span class="text-base font-bold text-slate-800 dark:text-white">
                    {{ course.avgRating.toFixed(1) }}
                  </span>
                </div>
                <span class="text-sm text-slate-500 dark:text-slate-400">
                  ({{ course.reviewCount }})
                </span>
              </div>

              <!-- Stats -->
              <div class="flex items-center justify-between pt-3 border-t-2 border-gray-100 dark:border-slate-700">
                <div class="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <span class="text-lg material-symbols-outlined">schedule</span>
                  <span class="text-sm font-semibold">{{ formatDuration(course.duration) }}</span>
                </div>
                <div class="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <span class="text-lg material-symbols-outlined">people</span>
                  <span class="text-sm font-semibold">{{ course.enrollmentCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-12">
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="flex items-center justify-center transition-all border-2 border-gray-200 rounded-2xl size-12 dark:border-slate-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-700 dark:disabled:hover:text-slate-300">
            <span class="text-2xl material-symbols-outlined">chevron_left</span>
          </button>

          <div class="flex gap-2">
            <button v-for="page in visiblePages" :key="page" @click="currentPage = page"
              class="flex items-center justify-center text-base font-bold transition-all border-2 rounded-2xl size-12"
              :class="page === currentPage
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-lg shadow-orange-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-orange-500'
                ">
              {{ page }}
            </button>
          </div>

          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="flex items-center justify-center transition-all border-2 border-gray-200 rounded-2xl size-12 dark:border-slate-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-700 dark:disabled:hover:text-slate-300">
            <span class="text-2xl material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <!-- Featured Section (if no filters applied) -->
        <div v-if="selectedSubject === '' && selectedGrade === '' && searchQuery === '' && filteredCourses.length > 0"
          class="mt-16">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white">
              🌟 Dành riêng cho bạn
            </h2>
            <button class="text-base font-bold text-orange-600 dark:text-orange-400 hover:underline">
              Xem tất cả
            </button>
          </div>

          <!-- Featured Course Card -->
          <div @click="handleCourseClick(filteredCourses[0])"
            class="flex items-center gap-6 p-6 transition-all border-2 border-gray-200 cursor-pointer dark:border-slate-700 bg-white/80 dark:bg-slate-800 rounded-3xl hover:shadow-2xl">
            <div
              class="flex items-center justify-center text-4xl rounded-2xl size-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30">
              {{ getSubjectIcon(filteredCourses[0].subject) }}
            </div>
            <div class="flex-1">
              <h3 class="mb-1 text-xl font-bold text-slate-800 dark:text-white">
                {{ filteredCourses[0].title }}
              </h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                {{ getSubjectName(filteredCourses[0].subject) }} • {{ getGradeName(filteredCourses[0].grade) }}
              </p>
            </div>
            <button
              class="flex items-center justify-center transition-all rounded-2xl size-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/50">
              <span class="text-3xl text-white material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CourseListItem, Subject, Grade } from '~/types/course';
import { API_ENDPOINTS } from '~/types/api';

// Remove auth middleware - courses should be accessible to guest users
definePageMeta({
  middleware: [],
});

useHead({
  title: 'Khám phá Khóa học - EduBunny',
  meta: [
    {
      name: 'description',
      content: 'Khám phá các khóa học chất lượng cao cho học sinh tiểu học',
    },
  ],
});

const { apiClient } = useApiClient();
const { toast } = useSweetAlert();
const router = useRouter();

// State
const loading = ref(true);
const courses = ref<CourseListItem[]>([]);
const selectedSubject = ref<Subject | ''>('');
const selectedGrade = ref<Grade | ''>('');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 12;

// Subject options
const subjects = [
  { value: 'SCIENCE' as Subject, label: 'Khoa học', },
  { value: 'MATH' as Subject, label: 'Toán học', },
  { value: 'ART' as Subject, label: 'Mỹ thuật' },
  { value: 'ENGLISH' as Subject, label: 'Tiếng Anh' },
  { value: 'VIETNAMESE' as Subject, label: 'Tiếng Việt' },
  { value: 'MUSIC' as Subject, label: 'Âm nhạc' },
];

// Grade options
const grades = [
  { value: 'GRADE_1' as Grade, label: 'Lớp 1' },
  { value: 'GRADE_2' as Grade, label: 'Lớp 2' },
  { value: 'GRADE_3' as Grade, label: 'Lớp 3' },
  { value: 'GRADE_4' as Grade, label: 'Lớp 4' },
  { value: 'GRADE_5' as Grade, label: 'Lớp 5' },
];

// Computed
const filteredCourses = computed(() => {
  if (!courses.value || !Array.isArray(courses.value)) return [];

  let result = courses.value;

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((c) =>
      c.title.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query))
    );
  }

  // Filter by subject
  if (selectedSubject.value) {
    result = result.filter((c) => c.subject === selectedSubject.value);
  }

  // Filter by grade
  if (selectedGrade.value) {
    result = result.filter((c) => c.grade === selectedGrade.value);
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredCourses.value.length / itemsPerPage));

const paginatedCourses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredCourses.value.slice(start, end);
});

const visiblePages = computed(() => {
  const current = currentPage.value;
  const total = totalPages.value;
  const pages: number[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push(-1, total);
    } else if (current >= total - 3) {
      pages.push(1, -1);
      for (let i = total - 4; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, -1);
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i);
      }
      pages.push(-1, total);
    }
  }

  return pages.filter((p) => p > 0);
});

// Methods
const fetchCourses = async () => {
  loading.value = true;
  try {
    // Fetch courses with backend's max limit of 100
    // We'll do client-side pagination for better UX
    const response = await apiClient.get<CourseListItem[]>(
      API_ENDPOINTS.COURSE.LIST,
      {
        page: 1,
        limit: 100, // Backend max limit
      }
    );

    if (response.success && response.data) {
      courses.value = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Loaded courses:', courses.value.length);
    } else {
      courses.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    courses.value = [];
    toast('Không thể tải danh sách khóa học', 'error');
  } finally {
    loading.value = false;
  }
};

const handleCourseClick = (course: CourseListItem) => {
  if (course.isPublished === false) {
    toast('Khóa học sắp được ra mắt. Hãy quay lại sau nhé! 🎉', 'info');
    return;
  }

  // Navigate to course detail page
  router.push(`/courses/${course.id}`);
};

const getSectionTitle = () => {
  if (selectedSubject.value && selectedGrade.value) {
    const subject = subjects.find(s => s.value === selectedSubject.value);
    const grade = grades.find(g => g.value === selectedGrade.value);
    return `${subject?.label} - ${grade?.label}`;
  }
  if (selectedSubject.value) {
    const subject = subjects.find(s => s.value === selectedSubject.value);
    return `${subject?.label}`;
  }
  if (selectedGrade.value) {
    const grade = grades.find(g => g.value === selectedGrade.value);
    return `Khóa học ${grade?.label}`;
  }
  if (searchQuery.value.trim()) {
    return `Kết quả tìm kiếm: "${searchQuery.value}"`;
  }
  return 'Tất cả khóa học';
};

// Helper functions
const getSubjectIcon = (subject: Subject): string => {
  const icons: Record<Subject, string> = {
    MATH: '🔢',
    VIETNAMESE: '📖',
    ENGLISH: '🗣️',
    SCIENCE: '🔬',
    ART: '🎨',
    MUSIC: '🎵',
    PE: '⚽',
    HISTORY: '📜',
    GEOGRAPHY: '🗺️',
    LIFE_SKILLS: '🌱',
  };
  return icons[subject] || '📚';
};

const getSubjectName = (subject: Subject): string => {
  const names: Record<Subject, string> = {
    MATH: 'Toán học',
    VIETNAMESE: 'Tiếng Việt',
    ENGLISH: 'Tiếng Anh',
    SCIENCE: 'Khoa học',
    ART: 'Mỹ thuật',
    MUSIC: 'Âm nhạc',
    PE: 'Thể dục',
    HISTORY: 'Lịch sử',
    GEOGRAPHY: 'Địa lý',
    LIFE_SKILLS: 'Kỹ năng sống',
  };
  return names[subject] || subject;
};

const getGradeName = (grade: Grade): string => {
  const names: Record<Grade, string> = {
    GRADE_1: 'Lớp 1',
    GRADE_2: 'Lớp 2',
    GRADE_3: 'Lớp 3',
    GRADE_4: 'Lớp 4',
    GRADE_5: 'Lớp 5',
  };
  return names[grade] || grade;
};

const getCourseProgress = (course: CourseListItem): number => {
  if (typeof course.learningProgress !== 'number') {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(course.learningProgress)));
};

const hasLearningProgress = (course: CourseListItem): boolean => {
  return getCourseProgress(course) > 0;
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}p` : `${hours} giờ`;
};

// Lifecycle
onMounted(async () => {
  await fetchCourses();
});

// Watch filters and reset page
watch([selectedSubject, selectedGrade, searchQuery], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}
</style>
