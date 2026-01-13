<template>
  <div class="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex font-body transition-colors duration-300">
    <!-- Admin Sidebar -->
    <aside class="w-72 bg-[#2C3E50] dark:bg-slate-900 text-white flex flex-col fixed inset-y-0 z-50 transition-colors">
      <div class="p-8 flex items-center gap-3">
        <div class="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
          <span class="material-symbols-outlined font-bold">settings_suggest</span>
        </div>
        <span class="font-display text-2xl font-bold tracking-tight">AdminHub</span>
      </div>

      <nav class="flex-1 px-4 space-y-2 mt-4">
        <NuxtLink v-for="item in sidebarItems" :key="item.path" :to="item.path"
          class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all" :class="isActive(item.path)
            ? 'bg-primary text-white shadow-xl shadow-primary/20'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'">
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="p-6">
        <button @click="handleLogout"
          class="w-full py-4 bg-slate-800 dark:bg-slate-800/50 rounded-2xl font-bold text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-all">
          <span class="material-symbols-outlined">logout</span>
          Đăng xuất Admin
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-72 p-10">
      <header class="flex justify-between items-center mb-10">
        <div>
          <h1 class="text-3xl font-display font-bold text-slate-800 dark:text-white">
            {{ currentPageTitle }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Hệ thống quản trị EduFun Ecosystem</p>
        </div>
        <div class="flex items-center gap-4">
          <button @click="themeStore.toggleTheme()"
            class="size-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
            <span class="material-symbols-outlined text-xl">{{ themeStore.isDark ? 'light_mode' : 'dark_mode' }}</span>
          </button>
          <div class="size-12 rounded-full overflow-hidden border-2 border-primary shadow-lg">
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
