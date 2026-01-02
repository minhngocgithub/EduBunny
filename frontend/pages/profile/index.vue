<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">👤 Hồ sơ của tôi</h1>
      
      <!-- Profile Card -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div class="flex items-center mb-6">
          <div class="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-4xl text-white font-bold mr-6">
            {{ profile.name.charAt(0) }}
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900">{{ profile.name }}</h2>
            <p class="text-gray-600">{{ profile.email }}</p>
            <div class="flex items-center mt-2">
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mr-2">
                Level {{ profile.level }}
              </span>
              <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                {{ profile.role }}
              </span>
            </div>
          </div>
          <button class="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            Chỉnh sửa
          </button>
        </div>

        <!-- Stats -->
        <div class="grid md:grid-cols-4 gap-4 pt-6 border-t">
          <div class="text-center">
            <p class="text-2xl font-bold text-blue-600">{{ profile.stats.xp }}</p>
            <p class="text-gray-600 text-sm">Điểm XP</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-purple-600">{{ profile.stats.courses }}</p>
            <p class="text-gray-600 text-sm">Khóa học</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-green-600">{{ profile.stats.completed }}</p>
            <p class="text-gray-600 text-sm">Hoàn thành</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-orange-600">{{ profile.stats.streak }}</p>
            <p class="text-gray-600 text-sm">Streak</p>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">🏆 Thành tích</h3>
        <div class="grid md:grid-cols-4 gap-4">
          <div v-for="achievement in achievements" :key="achievement.id" class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-4xl mb-2">{{ achievement.icon }}</div>
            <p class="font-semibold text-gray-900 text-sm">{{ achievement.title }}</p>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">⚙️ Cài đặt</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b">
            <span class="text-gray-700">Thông báo email</span>
            <button class="w-12 h-6 bg-blue-600 rounded-full relative">
              <span class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
            </button>
          </div>
          <div class="flex items-center justify-between py-3 border-b">
            <span class="text-gray-700">Chế độ tối</span>
            <button class="w-12 h-6 bg-gray-300 rounded-full relative">
              <span class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
            </button>
          </div>
          <div class="flex items-center justify-between py-3">
            <span class="text-gray-700">Âm thanh</span>
            <button class="w-12 h-6 bg-blue-600 rounded-full relative">
              <span class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
});

useHead({
  title: 'Hồ sơ - EduForKids',
});

const profile = {
  name: 'Nguyễn Văn An',
  email: 'student@example.com',
  level: 5,
  role: 'Học sinh',
  stats: {
    xp: 1250,
    courses: 8,
    completed: 42,
    streak: 7,
  },
};

const achievements = [
  { id: 1, icon: '🎓', title: 'Người học siêng' },
  { id: 2, icon: '⭐', title: 'Ngôi sao sáng' },
  { id: 3, icon: '🔥', title: 'Streak 7 ngày' },
  { id: 4, icon: '🏆', title: 'Vô địch toán' },
];
</script>
