<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <!-- Hero Section -->
    <div class="container mx-auto px-4 py-16">
      <div class="text-center max-w-4xl mx-auto">
        <h1 class="text-5xl font-bold text-gray-900 mb-6">
          🎓 Chào mừng đến với EduForKids
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Nền tảng học tập trực tuyến dành cho học sinh tiểu học
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/dashboard"
            class="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Bắt đầu học
          </NuxtLink>
          <NuxtLink
            to="/courses"
            class="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Khám phá khóa học
          </NuxtLink>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="grid md:grid-cols-3 gap-8 mt-20">
        <div class="bg-white p-6 rounded-xl shadow-lg">
          <div class="text-4xl mb-4">📚</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Khóa học đa dạng</h3>
          <p class="text-gray-600">
            Toán, Tiếng Việt, Tiếng Anh và nhiều môn học khác cho các em học sinh tiểu học
          </p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-lg">
          <div class="text-4xl mb-4">🎮</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Học qua trò chơi</h3>
          <p class="text-gray-600">
            Các trò chơi giáo dục hấp dẫn giúp các em học tập hiệu quả và vui vẻ
          </p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-lg">
          <div class="text-4xl mb-4">🏆</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Theo dõi tiến độ</h3>
          <p class="text-gray-600">
            Phụ huynh có thể theo dõi quá trình học tập và tiến bộ của con em mình
          </p>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="mt-20 bg-white rounded-2xl shadow-xl p-12">
        <div class="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-4xl font-bold text-blue-600 mb-2">100+</div>
            <div class="text-gray-600">Bài học</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-purple-600 mb-2">50+</div>
            <div class="text-gray-600">Trò chơi</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-green-600 mb-2">1000+</div>
            <div class="text-gray-600">Học sinh</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-orange-600 mb-2">24/7</div>
            <div class="text-gray-600">Hỗ trợ</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page meta
definePageMeta({
  layout: 'default',
});

// Set page title
useHead({
  title: 'Trang chủ - EduForKids',
  meta: [
    { name: 'description', content: 'Nền tảng học tập trực tuyến dành cho học sinh tiểu học' },
  ],
});
</script>
