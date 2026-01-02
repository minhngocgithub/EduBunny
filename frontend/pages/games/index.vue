<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">🎮 Trò chơi học tập</h1>
    
    <div class="grid md:grid-cols-3 gap-6">
      <div v-for="game in games" :key="game.id" class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <div class="h-48 flex items-center justify-center" :class="game.bgColor">
          <span class="text-7xl">{{ game.icon }}</span>
        </div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-bold text-gray-900">{{ game.title }}</h3>
            <span class="px-2 py-1 text-xs font-semibold rounded" :class="game.levelColor">
              {{ game.level }}
            </span>
          </div>
          <p class="text-gray-600 mb-4">{{ game.description }}</p>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">⭐ {{ game.stars }} sao</span>
            <button class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Chơi ngay
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
  title: 'Trò chơi - EduForKids',
});

const games = [
  {
    id: 1,
    title: 'Đếm số vui',
    description: 'Học đếm số từ 1 đến 100',
    icon: '🔢',
    level: 'Dễ',
    levelColor: 'bg-green-100 text-green-800',
    bgColor: 'bg-gradient-to-br from-green-300 to-green-400',
    stars: 150,
  },
  {
    id: 2,
    title: 'Ghép chữ thần kỳ',
    description: 'Ghép các chữ cái thành từ',
    icon: '✏️',
    level: 'Trung bình',
    levelColor: 'bg-yellow-100 text-yellow-800',
    bgColor: 'bg-gradient-to-br from-yellow-300 to-yellow-400',
    stars: 200,
  },
  {
    id: 3,
    title: 'Toán học nhanh',
    description: 'Tính toán nhanh các phép tính',
    icon: '➕',
    level: 'Khó',
    levelColor: 'bg-red-100 text-red-800',
    bgColor: 'bg-gradient-to-br from-red-300 to-red-400',
    stars: 300,
  },
  {
    id: 4,
    title: 'Học tiếng Anh',
    description: 'Học từ vựng tiếng Anh qua game',
    icon: '🗣️',
    level: 'Dễ',
    levelColor: 'bg-green-100 text-green-800',
    bgColor: 'bg-gradient-to-br from-blue-300 to-blue-400',
    stars: 180,
  },
  {
    id: 5,
    title: 'Xếp hình thông minh',
    description: 'Phát triển tư duy logic',
    icon: '🧩',
    level: 'Trung bình',
    levelColor: 'bg-yellow-100 text-yellow-800',
    bgColor: 'bg-gradient-to-br from-purple-300 to-purple-400',
    stars: 220,
  },
  {
    id: 6,
    title: 'Khám phá khoa học',
    description: 'Học khoa học qua thí nghiệm',
    icon: '🔬',
    level: 'Trung bình',
    levelColor: 'bg-yellow-100 text-yellow-800',
    bgColor: 'bg-gradient-to-br from-pink-300 to-pink-400',
    stars: 250,
  },
];
</script>
