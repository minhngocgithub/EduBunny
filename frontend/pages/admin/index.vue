<template>
  <div class="space-y-10">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(stat, i) in stats" :key="i"
        class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-white dark:border-white/5 group hover:shadow-xl transition-all">
        <div
          :class="`size-14 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 dark:bg-slate-800 ${stat.color}`">
          <span class="material-symbols-outlined text-3xl font-bold">{{ stat.icon }}</span>
        </div>
        <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{{
          stat.label }}</p>
        <h3 class="text-3xl font-display font-bold text-slate-800 dark:text-white">{{ stat.value }}</h3>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">{{ stat.change }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <!-- User Growth Chart -->
      <section
        class="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-white dark:border-white/5">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-xl font-display font-bold text-slate-800 dark:text-white">Tăng trưởng Người dùng</h3>
          <select v-model="chartPeriod"
            class="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold px-4 py-2 text-slate-600 dark:text-slate-300">
            <option value="7">7 ngày qua</option>
            <option value="30">30 ngày qua</option>
            <option value="90">90 ngày qua</option>
          </select>
        </div>
        <div class="h-64 w-full flex items-end gap-3 px-4">
          <div v-for="(height, i) in chartData" :key="i"
            class="flex-1 bg-secondary/10 dark:bg-secondary/5 rounded-t-xl relative group">
            <div
              class="absolute bottom-0 left-0 w-full bg-secondary rounded-t-xl transition-all duration-1000 group-hover:bg-primary"
              :style="{ height: `${height}%` }"></div>
          </div>
        </div>
        <div class="flex justify-between mt-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>
      </section>

      <!-- Subject Distribution -->
      <section class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-white dark:border-white/5">
        <h3 class="text-xl font-display font-bold text-slate-800 dark:text-white mb-6">Phân bổ nội dung</h3>
        <div class="space-y-6">
          <div v-for="(subject, i) in subjectDistribution" :key="i" class="space-y-2">
            <div class="flex justify-between text-xs font-bold">
              <span class="text-slate-600 dark:text-slate-400">{{ subject.label }}</span>
              <span class="text-slate-800 dark:text-white">{{ subject.percentage }}%</span>
            </div>
            <div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div :class="`h-full ${subject.color} rounded-full transition-all duration-1000`"
                :style="{ width: `${subject.percentage}%` }"></div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Recent Activity -->
    <div class="grid lg:grid-cols-2 gap-8">
      <section class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-white dark:border-white/5">
        <h3 class="text-xl font-display font-bold text-slate-800 dark:text-white mb-6">Hoạt động gần đây</h3>
        <div class="space-y-4">
          <div v-for="(activity, i) in recentActivities" :key="i"
            class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div :class="`size-10 rounded-xl flex items-center justify-center ${activity.color}`">
              <span class="material-symbols-outlined text-white text-xl">{{ activity.icon }}</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ activity.title }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-white dark:border-white/5">
        <h3 class="text-xl font-display font-bold text-slate-800 dark:text-white mb-6">Top khóa học</h3>
        <div class="space-y-4">
          <div v-for="(course, i) in topCourses" :key="i"
            class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
            <div class="flex items-center gap-4">
              <div
                class="size-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                {{ i + 1 }}
              </div>
              <div>
                <p class="font-bold text-slate-700 dark:text-slate-200">{{ course.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ course.students }} học sinh</p>
              </div>
            </div>
            <span class="text-sm font-black text-success">{{ course.completionRate }}%</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const chartPeriod = ref('7');

const stats = ref([
  { label: 'Tổng học sinh', value: '2,450', change: '+12% từ tháng trước', icon: 'school', color: 'text-primary' },
  { label: 'Khóa học hoạt động', value: '48', change: '+3 khóa mới', icon: 'auto_stories', color: 'text-secondary' },
  { label: 'Tỷ lệ hoàn thành', value: '78%', change: '+5% so với tuần trước', icon: 'task_alt', color: 'text-success' },
  { label: 'AI Chatbot', value: '45.2K', change: 'Hỏi đáp hôm nay', icon: 'psychology', color: 'text-accent' },
]);

const chartData = ref([40, 60, 45, 90, 65, 80, 100]);
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const subjectDistribution = ref([
  { label: 'Toán học', percentage: 35, color: 'bg-primary' },
  { label: 'Tiếng Việt', percentage: 28, color: 'bg-secondary' },
  { label: 'Tiếng Anh', percentage: 22, color: 'bg-accent' },
  { label: 'Khoa học', percentage: 15, color: 'bg-success' },
]);

const recentActivities = ref([
  { title: 'Học sinh mới đăng ký', time: '5 phút trước', icon: 'person_add', color: 'bg-primary' },
  { title: 'Khóa học "Toán 101" được phê duyệt', time: '1 giờ trước', icon: 'check_circle', color: 'bg-success' },
  { title: 'Quiz "Phép nhân" được tạo', time: '2 giờ trước', icon: 'quiz', color: 'bg-secondary' },
  { title: 'Báo cáo phụ huynh đã gửi', time: '3 giờ trước', icon: 'mail', color: 'bg-accent' },
]);

const topCourses = ref([
  { name: 'Toán học cơ bản', students: 1240, completionRate: 92 },
  { name: 'Tiếng Việt sáng tạo', students: 856, completionRate: 85 },
  { name: 'English for Kids', students: 743, completionRate: 78 },
  { name: 'Khoa học vui', students: 612, completionRate: 81 },
]);

useHead({
  title: 'Admin Dashboard - EduFun',
});
</script>
