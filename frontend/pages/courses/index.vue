<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">📚 Khóa học</h1>
    
    <div class="grid md:grid-cols-3 gap-6">
      <div v-for="course in courses" :key="course.id" class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <span class="text-6xl">{{ course.icon }}</span>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">{{ course.title }}</h3>
          <p class="text-gray-600 mb-4">{{ course.description }}</p>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">{{ course.lessons }} bài học</span>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Học ngay
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
  title: 'Khóa học - EduForKids',
});

const courses = [
  {
    id: 1,
    title: 'Toán học lớp 3',
    description: 'Học toán cơ bản với các bài tập thú vị',
    icon: '🔢',
    lessons: 20,
  },
  {
    id: 2,
    title: 'Tiếng Việt lớp 3',
    description: 'Rèn luyện kỹ năng đọc và viết',
    icon: '📖',
    lessons: 15,
  },
  {
    id: 3,
    title: 'Tiếng Anh cơ bản',
    description: 'Học tiếng Anh qua trò chơi',
    icon: '🗣️',
    lessons: 25,
  },
];
</script>
