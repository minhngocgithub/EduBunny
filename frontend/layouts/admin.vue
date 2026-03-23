<template>
  <div class="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex font-body transition-colors duration-300">
    <!-- Admin Sidebar -->
    <aside class="w-72 bg-[#2C3E50] dark:bg-slate-900 text-white flex flex-col fixed inset-y-0 z-50 transition-colors">
      <div class="flex items-center gap-3 p-8">
        <div class="flex items-center justify-center text-white shadow-lg size-10 bg-primary rounded-xl">
          <span class="font-bold material-symbols-outlined">settings_suggest</span>
        </div>
        <span class="text-2xl font-bold tracking-tight font-display">Admin Edu</span>
      </div>

      <nav class="flex-1 px-4 mt-4 space-y-2">
        <NuxtLink v-for="item in sidebarItems" :key="item.path" :to="item.path"
          class="flex items-center w-full gap-4 px-6 py-4 font-bold transition-all rounded-2xl" :class="isActive(item.path)
            ? 'bg-primary text-white shadow-xl shadow-primary/20'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'">
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="p-6">
        <button @click="handleLogout"
          class="flex items-center justify-center w-full gap-2 py-4 font-bold transition-all bg-slate-800 dark:bg-slate-800/50 rounded-2xl text-slate-400 hover:text-white">
          <span class="material-symbols-outlined">logout</span>
          Đăng xuất Admin
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-10 ml-72">
      <header class="flex items-center justify-between mb-10">
        <div>
          <h1 class="text-3xl font-bold font-display text-slate-800 dark:text-white">
            {{ currentPageTitle }}
          </h1>
          <p class="font-medium text-slate-500 dark:text-slate-400">Hệ thống quản trị EduFun Ecosystem</p>
        </div>
        <div class="flex items-center gap-4">
          <button @click="themeStore.toggleTheme()"
            class="flex items-center justify-center transition-transform bg-white shadow-sm size-12 rounded-xl dark:bg-slate-800 hover:scale-110">
            <span class="text-xl material-symbols-outlined">{{ themeStore.isDark ? 'light_mode' : 'dark_mode' }}</span>
          </button>
          <div class="overflow-hidden border-2 rounded-full shadow-lg size-12 border-primary">
            <img src="https://picsum.photos/100/100?random=admin" alt="Admin" />
          </div>
        </div>
      </header>

      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const sidebarItems = [
  { path: '/admin', label: 'Tổng quan', icon: 'dashboard' },
  { path: '/admin/courses', label: 'Khóa học & Bài giảng', icon: 'auto_stories' },
  { path: '/admin/users', label: 'Người dùng', icon: 'group' },
  { path: '/admin/quizzes', label: 'Đố vui & Câu hỏi', icon: 'quiz' },
  { path: '/admin/games', label: 'Trò chơi', icon: 'sports_esports' },
  { path: '/admin/achievements', label: 'Thành tích', icon: 'military_tech' },
  { path: '/admin/analytics', label: 'Phân tích', icon: 'analytics' },
];

const currentPageTitle = computed(() => {
  const item = sidebarItems.find(i => i.path === route.path);
  return item?.label || 'Dashboard';
});

const isActive = (path: string) => {
  if (path === '/admin') {
    return route.path === '/admin';
  }
  return route.path.startsWith(path);
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>
