<template>
  <div class="min-h-screen transition-colors duration-300 bg-background dark:bg-slate-950">
    <!-- Navigation -->
    <LayoutAppNavbar />

    <!-- Background Magical blobs -->
    <div class="fixed inset-0 pointer-events-none opacity-40 -z-10">
      <div class="absolute top-[-10%] left-[-10%] size-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-[-10%] right-[-10%] size-96 bg-secondary/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Loading State -->
    <ClientOnly>
      <div v-if="loading" class="flex items-center justify-center py-32">
        <div class="text-center">
          <div class="mb-4 text-6xl animate-bounce">🐰</div>
          <p class="font-bold text-gray-600 dark:text-slate-400">Đang tải...</p>
        </div>
      </div>
    </ClientOnly>

    <!-- Dashboard Content -->
    <div v-if="!loading" class="px-4 pt-24 pb-16 mx-auto sm:px-6 lg:px-8 max-w-7xl">
      <!-- Student Dashboard -->
      <div v-if="isStudent">
        <!-- Welcome Header -->
        <div class="mb-6 sm:mb-8">
          <h1 class="text-3xl font-bold text-gray-800 sm:text-4xl font-display dark:text-white">
            Chào mừng trở lại, {{ userName }}! 👋
          </h1>
          <p class="mt-2 text-base text-gray-600 sm:text-lg dark:text-slate-400">
            Hôm nay bạn muốn học gì nhỉ? Thỏ Ngọc sẵn sàng đồng hành cùng bạn rồi!
          </p>
        </div>

        <!-- Stats Cards Row -->
        <div class="grid grid-cols-2 gap-3 mb-6 sm:gap-4 md:gap-6 lg:grid-cols-4 sm:mb-8">
          <!-- Level Card -->
          <div
            class="relative overflow-hidden transition-all border border-white shadow-xl group rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm dark:border-white/5 hover:shadow-2xl hover:-translate-y-1">
            <div
              class="absolute top-0 right-0 transition-transform rounded-full opacity-20 size-24 sm:size-32 bg-primary -translate-y-1/2 translate-x-1/3 group-hover:scale-110">
            </div>
            <div class="relative p-4 sm:p-6">
              <div class="flex items-start justify-between mb-3 sm:mb-4">
                <div
                  class="flex items-center justify-center rounded-xl sm:rounded-2xl size-10 sm:size-14 bg-primary/10">
                  <span class="text-xl sm:text-3xl">⭐</span>
                </div>
                <div class="px-2 py-1 text-xs font-bold rounded-lg sm:px-3 bg-primary/10 text-primary">
                  Lv {{ studentLevel }}
                </div>
              </div>
              <p class="text-xs font-bold text-gray-500 uppercase sm:text-sm dark:text-slate-400">Cấp độ</p>
              <div class="flex items-baseline gap-1 mt-1 sm:gap-2 sm:mt-2">
                <p class="text-2xl font-bold sm:text-3xl text-primary font-display">{{ studentLevel }}</p>
                <p class="text-xs font-medium text-gray-400 sm:text-sm">/ 100</p>
              </div>
              <!-- XP Progress -->
              <div class="mt-3 sm:mt-4">
                <div class="flex justify-between mb-1 text-xs font-bold text-gray-400 sm:mb-2">
                  <span class="text-[10px] sm:text-xs">{{ studentXP }}</span>
                  <span class="text-[10px] sm:text-xs">{{ nextLevelXP }}</span>
                </div>
                <div class="h-1.5 sm:h-2 overflow-hidden bg-gray-100 rounded-full dark:bg-slate-800">
                  <div
                    class="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-primary to-orange-400"
                    :style="{ width: xpProgress + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Streak Card -->
          <div
            class="relative overflow-hidden transition-all border border-white shadow-xl group rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm dark:border-white/5 hover:shadow-2xl hover:-translate-y-1">
            <div
              class="absolute top-0 right-0 transition-transform rounded-full opacity-20 size-24 sm:size-32 bg-orange-500 -translate-y-1/2 translate-x-1/3 group-hover:scale-110">
            </div>
            <div class="relative p-4 sm:p-6">
              <div
                class="flex items-center justify-center mb-3 rounded-xl sm:rounded-2xl size-10 sm:size-14 sm:mb-4 bg-orange-500/10">
                <span class="text-xl sm:text-3xl animate-pulse">🔥</span>
              </div>
              <p class="text-xs font-bold text-gray-500 uppercase sm:text-sm dark:text-slate-400">Streak</p>
              <div class="flex items-baseline gap-1 mt-1 sm:gap-2 sm:mt-2">
                <p class="text-2xl font-bold text-orange-500 sm:text-3xl font-display">{{ studentStreak }}</p>
                <p class="text-xs font-medium text-gray-400 sm:text-sm">ngày</p>
              </div>
            </div>
          </div>

          <!-- Stars Card -->
          <div
            class="relative overflow-hidden transition-all border border-white shadow-xl group rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm dark:border-white/5 hover:shadow-2xl hover:-translate-y-1">
            <div
              class="absolute top-0 right-0 transition-transform rounded-full opacity-20 size-24 sm:size-32 bg-yellow-500 -translate-y-1/2 translate-x-1/3 group-hover:scale-110">
            </div>
            <div class="relative p-4 sm:p-6">
              <div
                class="flex items-center justify-center mb-3 rounded-xl sm:rounded-2xl size-10 sm:size-14 sm:mb-4 bg-yellow-500/10">
                <span class="text-xl sm:text-3xl animate-pulse">⭐</span>
              </div>
              <p class="text-xs font-bold text-gray-500 uppercase sm:text-sm dark:text-slate-400">Sao</p>
              <div class="flex items-baseline gap-1 mt-1 sm:gap-2 sm:mt-2">
                <p class="text-2xl font-bold text-yellow-500 sm:text-3xl font-display">{{ studentStars }}</p>
                <p class="text-xs font-medium text-gray-400 sm:text-sm">sao</p>
              </div>
            </div>
          </div>

          <!-- Coins Card -->
          <div
            class="relative overflow-hidden transition-all border border-white shadow-xl group rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm dark:border-white/5 hover:shadow-2xl hover:-translate-y-1">
            <div
              class="absolute top-0 right-0 transition-transform rounded-full opacity-20 size-24 sm:size-32 bg-amber-500 -translate-y-1/2 translate-x-1/3 group-hover:scale-110">
            </div>
            <div class="relative p-4 sm:p-6">
              <div
                class="flex items-center justify-center mb-3 rounded-xl sm:rounded-2xl size-10 sm:size-14 sm:mb-4 bg-amber-500/10">
                <span class="text-xl sm:text-3xl animate-pulse">🪙</span>
              </div>
              <p class="text-xs font-bold text-gray-500 uppercase sm:text-sm dark:text-slate-400">Xu</p>
              <div class="flex items-baseline gap-1 mt-1 sm:gap-2 sm:mt-2">
                <p class="text-2xl font-bold text-amber-500 sm:text-3xl font-display">{{ studentCoins }}</p>
                <p class="text-xs font-medium text-gray-400 sm:text-sm">xu</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid gap-6 sm:gap-8 lg:grid-cols-3">
          <!-- Left Column (2/3 width on desktop) -->
          <div class="space-y-6 sm:space-y-8 lg:col-span-2">
            <!-- Weekly Challenge Banner -->
            <div
              class="relative overflow-hidden transition-all border border-white shadow-xl group rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary to-orange-400 dark:border-white/5 hover:shadow-2xl">
              <div
                class="absolute top-0 right-0 transition-transform duration-700 rounded-full size-48 sm:size-64 bg-white/10 translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:scale-110">
              </div>
              <div class="relative p-6 sm:p-8 md:p-10">
                <div class="space-y-3 text-white sm:space-y-4 sm:max-w-md">
                  <div
                    class="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold uppercase bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                    <span class="text-sm material-symbols-outlined sm:text-base">emoji_events</span>
                    Thử thách tuần
                  </div>
                  <h2 class="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl font-display">
                    Phù thủy Toán học! 🧙‍♂️
                  </h2>
                  <p class="text-sm font-medium sm:text-base text-white/90">
                    Hoàn thành 5 bài tập toán để nhận bộ trang phục Phù thủy cho Thỏ Ngọc.
                  </p>
                  <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <button
                      class="px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base font-bold transition-all rounded-xl sm:rounded-2xl bg-white text-primary font-display shadow-xl shadow-black/10 hover:scale-105 active:scale-95">
                      THAM GIA NGAY
                    </button>
                    <div
                      class="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm">
                      2/5 hoàn thành
                    </div>
                  </div>
                </div>
                <div
                  class="absolute hidden text-[120px] sm:text-[200px] opacity-10 pointer-events-none -right-10 -bottom-10 md:block group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  🪄
                </div>
              </div>
            </div>

            <!-- Learning Map -->
            <div>
              <div class="flex items-center justify-between mb-4 sm:mb-6">
                <h2
                  class="flex items-center gap-2 text-xl font-bold text-gray-800 sm:gap-3 sm:text-2xl font-display dark:text-white">
                  <span class="text-xl font-bold sm:text-2xl material-symbols-outlined text-primary">explore</span>
                  Bản đồ Học tập
                </h2>
                <NuxtLink to="/courses"
                  class="flex items-center gap-1 text-sm font-bold transition-colors sm:text-base text-secondary hover:text-primary">
                  Xem tất cả
                  <span class="text-sm material-symbols-outlined sm:text-base">arrow_forward</span>
                </NuxtLink>
              </div>

              <div class="grid gap-4 sm:gap-6 md:grid-cols-2">
                <NuxtLink v-for="course in courses" :key="course.id" :to="`/courses/${course.id}`"
                  class="group relative border border-white shadow-xl rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm dark:border-white/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  <div
                    class="relative h-40 overflow-hidden sm:h-48 rounded-t-2xl sm:rounded-t-3xl bg-gray-100 dark:bg-slate-800">
                    <img :src="course.img" :alt="course.title"
                      class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div
                      class="absolute px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-black tracking-wider uppercase border rounded-xl sm:rounded-2xl top-3 left-3 sm:top-4 sm:left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur text-primary border-primary/10">
                      {{ course.subject }}
                    </div>
                    <div
                      class="absolute flex items-center justify-center transition-all rounded-full size-10 sm:size-12 bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur text-primary group-hover:bg-primary group-hover:text-white">
                      <span class="text-xl font-bold sm:text-2xl material-symbols-outlined">play_arrow</span>
                    </div>
                  </div>

                  <div class="p-4 sm:p-6">
                    <div class="mb-3 sm:mb-4">
                      <h3
                        class="mb-1 text-lg font-bold leading-tight text-gray-800 transition-colors sm:mb-2 sm:text-xl font-display dark:text-white group-hover:text-primary">
                        {{ course.title }}
                      </h3>
                      <p
                        class="text-[10px] sm:text-xs font-black text-gray-400 uppercase dark:text-slate-500 tracking-widest">
                        Level {{ course.level }} • {{ course.grade }}
                      </p>
                    </div>

                    <div class="space-y-1.5 sm:space-y-2">
                      <div
                        class="flex justify-between text-[10px] sm:text-xs font-bold text-gray-400 uppercase dark:text-slate-500 tracking-widest">
                        <span>Tiến độ</span>
                        <span class="text-primary">{{ course.progress }}%</span>
                      </div>
                      <div class="h-2 overflow-hidden bg-gray-100 rounded-full sm:h-3 dark:bg-slate-800">
                        <div
                          class="relative h-full transition-all duration-500 rounded-full bg-gradient-to-r from-primary to-orange-400"
                          :style="{ width: course.progress + '%' }">
                          <div
                            class="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-move-bg">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Right Column (1/3 width on desktop) -->
          <div class="space-y-4 sm:space-y-6">
            <!-- Quick Actions -->
            <div
              class="p-4 border border-white shadow-xl sm:p-6 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm dark:border-white/5">
              <h3 class="mb-3 text-base font-bold text-gray-800 sm:mb-4 sm:text-lg font-display dark:text-white">
                Hành động nhanh
              </h3>
              <div class="space-y-2 sm:space-y-3">
                <NuxtLink v-for="action in quickActions" :key="action.path" :to="action.path"
                  class="flex items-center gap-3 p-3 transition-all border border-transparent sm:gap-4 sm:p-4 rounded-xl sm:rounded-2xl hover:border-primary/30 hover:bg-primary/5 group">
                  <div
                    :class="`flex items-center justify-center rounded-xl sm:rounded-2xl size-10 sm:size-12 ${action.bgColor}`">
                    <span class="text-xl sm:text-2xl">{{ action.icon }}</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-gray-800 sm:text-base dark:text-white">{{ action.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-slate-400">{{ action.desc }}</p>
                  </div>
                  <span class="text-gray-400 transition-transform material-symbols-outlined group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </NuxtLink>
              </div>
            </div>

            <!-- Achievements Preview -->
            <div
              class="p-4 border border-white shadow-xl sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 dark:border-white/5">
              <div class="flex items-center justify-between mb-3 sm:mb-4">
                <h3 class="text-base font-bold text-gray-800 sm:text-lg font-display dark:text-white">
                  Thành tích
                </h3>
                <span class="text-2xl sm:text-3xl">🏆</span>
              </div>
              <div class="grid grid-cols-3 gap-2 sm:gap-3">
                <div v-for="i in 6" :key="i"
                  class="flex flex-col items-center justify-center p-2 transition-all bg-white border border-white shadow-sm sm:p-3 dark:bg-slate-800 dark:border-slate-700 rounded-xl sm:rounded-2xl hover:scale-105">
                  <span class="mb-1 text-xl sm:text-2xl">🏅</span>
                  <span class="text-[9px] sm:text-[10px] font-bold text-gray-600 dark:text-slate-400 text-center">Siêu
                    sao</span>
                </div>
              </div>
              <NuxtLink to="/profile#achievements"
                class="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 mt-3 sm:mt-4 text-sm sm:text-base font-bold text-center text-white transition-all rounded-xl sm:rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg">
                Xem tất cả
                <span class="text-sm material-symbols-outlined sm:text-base">arrow_forward</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Parent Dashboard -->
      <div v-else-if="isParent" class="max-w-4xl mx-auto">
        <div class="overflow-hidden border border-white shadow-xl dark:bg-slate-900 dark:border-white/5 rounded-3xl">
          <div class="py-12 text-center">
            <span class="block mb-4 text-6xl">👨‍👩‍👧</span>
            <h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Phụ huynh
            </h2>
            <p class="mb-6 text-gray-600 dark:text-slate-400">
              Theo dõi tiến độ học tập của con bạn
            </p>
            <button class="px-6 py-3 font-bold text-white transition-all rounded-2xl bg-primary hover:scale-105">
              Xem báo cáo học tập
            </button>
          </div>
        </div>
      </div>

      <!-- Default Dashboard -->
      <div v-else class="max-w-4xl mx-auto">
        <div class="overflow-hidden border border-white shadow-xl dark:bg-slate-900 dark:border-white/5 rounded-3xl">
          <div class="py-12 text-center">
            <span class="block mb-4 text-6xl">🎓</span>
            <h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Chào mừng đến với EduForKids!
            </h2>
            <p class="text-gray-600 dark:text-slate-400">
              Hãy bắt đầu hành trình học tập của bạn
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const { user, isStudent, isParent } = useAuth();
const userStore = useUserStore();

const loading = ref(true);
const stats = ref<any>(null);

// Computed properties
const userName = computed(() => {
  if (userStore.studentProfile) {
    return `${userStore.studentProfile.firstName} ${userStore.studentProfile.lastName}`;
  }
  if (userStore.profile) {
    return userStore.profile.email.split('@')[0];
  }
  return 'Bạn';
});

const studentLevel = computed(() => userStore.studentProfile?.level || 1);
const studentXP = computed(() => userStore.studentProfile?.xp || 0);
const studentStars = computed(() => userStore.studentProfile?.stars || 0);
const studentStreak = computed(() => userStore.studentProfile?.streak || 0);
const studentCoins = computed(() => userStore.studentProfile?.coins || 0);

// XP Progress calculation
const nextLevelXP = computed(() => studentLevel.value * 1000);
const xpProgress = computed(() => {
  if (nextLevelXP.value === 0) return 0;
  return Math.min((studentXP.value / nextLevelXP.value) * 100, 100);
});

// Quick Actions
const quickActions = [
  { name: 'Khóa học', desc: 'Xem tất cả khóa học', path: '/courses', icon: '📚', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'Trò chơi', desc: 'Học qua trò chơi', path: '/games', icon: '🎮', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  { name: 'AI Chat', desc: 'Trò chuyện với Thỏ Ngọc', path: '/chatbot', icon: '🐰', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  { name: 'Hồ sơ', desc: 'Xem thông tin cá nhân', path: '/profile', icon: '👤', bgColor: 'bg-gray-50 dark:bg-gray-900/20' },
];

// Mock courses data
const courses = ref([
  {
    id: '1',
    title: 'Khu rừng Phân số',
    subject: 'Toán học',
    level: 4,
    grade: 'Lớp 3',
    progress: 45,
    img: 'https://picsum.photos/400/300?random=10'
  },
  {
    id: '2',
    title: 'Đảo Sinh học',
    subject: 'Khoa học',
    level: 1,
    grade: 'Lớp 3',
    progress: 10,
    img: 'https://picsum.photos/400/300?random=11'
  }
]);

// Fetch user data
onMounted(async () => {
  try {
    await userStore.fetchProfile();

    if (isStudent.value) {
      await userStore.fetchStudentProfile();
      const result = await userStore.fetchStudentStats();
      if (result.success) {
        stats.value = result.data;
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    loading.value = false;
  }
});

useHead({
  title: 'Dashboard - EduFun',
});
</script>

<style scoped>
@keyframes move-bg {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 1rem 0;
  }
}

.animate-move-bg {
  animation: move-bg 2s linear infinite;
}
</style>
