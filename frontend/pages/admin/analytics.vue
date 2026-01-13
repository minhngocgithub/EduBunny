<template>
  <div class="space-y-8">
    <!-- Time Range Selector -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-display font-bold text-slate-800 dark:text-white">Phân tích & Báo cáo</h2>
      <select v-model="timeRange"
        class="px-6 py-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-slate-600 dark:text-slate-400 shadow-sm border border-white dark:border-white/5">
        <option value="7">7 ngày qua</option>
        <option value="30">30 ngày qua</option>
        <option value="90">90 ngày qua</option>
        <option value="365">1 năm qua</option>
      </select>
    </div>

    <!-- Key Metrics -->
    <div class="grid md:grid-cols-4 gap-6">
      <div v-for="(metric, i) in keyMetrics" :key="i"
        class="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-white dark:border-white/5">
        <div class="flex items-center justify-between mb-4">
          <div :class="`size-12 rounded-xl flex items-center justify-center ${metric.bgColor}`">
            <span class="material-symbols-outlined text-2xl">{{ metric.icon }}</span>
          </div>
          <span :class="`text-xs font-black ${metric.trend > 0 ? 'text-success' : 'text-red-500'}`">
            {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%
          </span>
        </div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ metric.label }}</p>
        <h3 class="text-2xl font-display font-bold text-slate-800 dark:text-white">{{ metric.value }}</h3>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- User Engagement -->
      <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-white dark:border-white/5">
        <h3 class="text-xl font-display font-bold text-slate-800 dark:text-white mb-6">Mức độ tương tác</h3>
        <div class="space-y-6">
          <div v-for="(item, i) in engagementData" :key="i">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ item.label }}</span>
              <span class="text-sm font-black text-slate-800 dark:text-white">{{ item.value }}</span>
            </div>
            <div class="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div :class="`h-full rounded-full ${item.color}`" :style="{ width: `${item.percentage}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Popular Content -->
      <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-white dark:border-white/5">
        <h3 class="text-xl font-display font-bold text-slate-800 dark:text-white mb-6">Nội dung phổ biến</h3>
        <div class="space-y-4">
          <div v-for="(content, i) in popularContent" :key="i"
            class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
            <div
              class="size-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
              {{ i + 1 }}
            </div>
            <div class="flex-1">
              <p class="font-bold text-slate-700 dark:text-slate-200">{{ content.title }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ content.type }} • {{ content.views }} lượt xem
              </p>
            </div>
            <span class="text-sm font-black text-success">{{ content.completionRate }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Learning Progress -->
    <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-white dark:border-white/5">
      <h3 class="text-xl font-display font-bold text-slate-800 dark:text-white mb-8">Tiến độ học tập theo môn</h3>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(subject, i) in subjectProgress" :key="i" class="text-center">
          <div class="relative inline-block mb-4">
            <svg class="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="8" fill="none"
                class="text-slate-100 dark:text-slate-800" />
              <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="8" fill="none" :class="subject.color"
                :stroke-dasharray="`${subject.percentage * 3.52} 352`" stroke-linecap="round" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-2xl font-display font-bold text-slate-800 dark:text-white">{{ subject.percentage
                }}%</span>
            </div>
          </div>
          <p class="font-bold text-slate-700 dark:text-slate-300 mb-1">{{ subject.name }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ subject.students }} học sinh</p>
        </div>
      </div>
    </div>

    <!-- Export Options -->
    <div class="flex gap-4">
      <button
        class="px-8 py-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-slate-600 dark:text-slate-400 shadow-sm border border-white dark:border-white/5 flex items-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
        <span class="material-symbols-outlined">download</span> Xuất PDF
      </button>
      <button
        class="px-8 py-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-slate-600 dark:text-slate-400 shadow-sm border border-white dark:border-white/5 flex items-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
        <span class="material-symbols-outlined">table_chart</span> Xuất Excel
      </button>
      <button
        class="px-8 py-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-slate-600 dark:text-slate-400 shadow-sm border border-white dark:border-white/5 flex items-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
        <span class="material-symbols-outlined">mail</span> Gửi báo cáo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const timeRange = ref('30');

const keyMetrics = ref([
  { label: 'Người dùng hoạt động', value: '2,450', trend: 12, icon: 'trending_up', bgColor: 'bg-primary/10 text-primary' },
  { label: 'Thời gian học TB', value: '45 phút', trend: 8, icon: 'schedule', bgColor: 'bg-secondary/10 text-secondary' },
  { label: 'Tỷ lệ hoàn thành', value: '78%', trend: 5, icon: 'task_alt', bgColor: 'bg-success/10 text-success' },
  { label: 'Điểm TB', value: '8.5', trend: -2, icon: 'star', bgColor: 'bg-warning/10 text-warning' },
]);

const engagementData = ref([
  { label: 'Đăng nhập hàng ngày', value: '85%', percentage: 85, color: 'bg-primary' },
  { label: 'Hoàn thành bài tập', value: '72%', percentage: 72, color: 'bg-secondary' },
  { label: 'Tham gia quiz', value: '68%', percentage: 68, color: 'bg-accent' },
  { label: 'Chơi game học tập', value: '91%', percentage: 91, color: 'bg-success' },
]);

const popularContent = ref([
  { title: 'Giải đố Phân số', type: 'Khóa học', views: 12400, completionRate: 92 },
  { title: 'Hệ Mặt Trời', type: 'Bài giảng', views: 8560, completionRate: 87 },
  { title: 'Săn Số học', type: 'Trò chơi', views: 15200, completionRate: 95 },
  { title: 'Toán học - Phép nhân', type: 'Quiz', views: 7800, completionRate: 84 },
]);

const subjectProgress = ref([
  { name: 'Toán học', percentage: 85, students: 1240, color: 'text-primary' },
  { name: 'Tiếng Việt', percentage: 78, students: 950, color: 'text-secondary' },
  { name: 'Tiếng Anh', percentage: 72, students: 880, color: 'text-accent' },
  { name: 'Khoa học', percentage: 81, students: 760, color: 'text-success' },
]);

useHead({
  title: 'Phân tích - Admin',
});
</script>
