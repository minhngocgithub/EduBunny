<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">📊 Dashboard</h1>
    
    <!-- Stats Grid -->
    <div class="grid md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Điểm XP</p>
            <p class="text-2xl font-bold text-blue-600">1,250</p>
          </div>
          <div class="text-4xl">⭐</div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Cấp độ</p>
            <p class="text-2xl font-bold text-purple-600">Level 5</p>
          </div>
          <div class="text-4xl">🏆</div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Bài học</p>
            <p class="text-2xl font-bold text-green-600">42/60</p>
          </div>
          <div class="text-4xl">📚</div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Streak</p>
            <p class="text-2xl font-bold text-orange-600">7 ngày</p>
          </div>
          <div class="text-4xl">🔥</div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
      <div class="space-y-4">
        <div v-for="activity in activities" :key="activity.id" class="flex items-center p-4 bg-gray-50 rounded-lg">
          <div class="text-3xl mr-4">{{ activity.icon }}</div>
          <div class="flex-1">
            <p class="font-semibold text-gray-900">{{ activity.title }}</p>
            <p class="text-sm text-gray-500">{{ activity.time }}</p>
          </div>
          <div class="text-green-600 font-bold">+{{ activity.xp }} XP</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid md:grid-cols-2 gap-6">
      <NuxtLink to="/courses" class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
        <h3 class="text-xl font-bold mb-2">Tiếp tục học</h3>
        <p class="text-blue-100">Khám phá các khóa học mới</p>
      </NuxtLink>
      
      <NuxtLink to="/games" class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
        <h3 class="text-xl font-bold mb-2">Chơi game</h3>
        <p class="text-purple-100">Học qua trò chơi vui nhộn</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
});

useHead({
  title: 'Dashboard - EduForKids',
});

const activities = [
  {
    id: 1,
    icon: '📖',
    title: 'Hoàn thành bài học Toán 3 - Phép cộng',
    time: '2 giờ trước',
    xp: 50,
  },
  {
    id: 2,
    icon: '🎮',
    title: 'Chơi game "Đếm số vui"',
    time: '5 giờ trước',
    xp: 30,
  },
  {
    id: 3,
    icon: '✅',
    title: 'Hoàn thành quiz Tiếng Việt',
    time: '1 ngày trước',
    xp: 40,
  },
];
</script>
