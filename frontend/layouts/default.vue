<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <NuxtLink to="/" class="flex items-center space-x-2">
            <span class="text-2xl">🎓</span>
            <span class="text-xl font-bold text-blue-600">EduForKids</span>
          </NuxtLink>

          <div class="hidden md:flex items-center space-x-6">
            <NuxtLink to="/courses" class="text-gray-700 hover:text-blue-600 transition-colors">
              Khóa học
            </NuxtLink>
            <NuxtLink to="/games" class="text-gray-700 hover:text-blue-600 transition-colors">
              Trò chơi
            </NuxtLink>
            <NuxtLink to="/dashboard" class="text-gray-700 hover:text-blue-600 transition-colors">
              Dashboard
            </NuxtLink>
            <NuxtLink to="/profile" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Đăng nhập
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-8 mt-auto">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <div class="flex items-center space-x-2 mb-4">
              <span class="text-2xl">🎓</span>
              <span class="text-xl font-bold">EduForKids</span>
            </div>
            <p class="text-gray-400">
              Nền tảng học tập trực tuyến dành cho học sinh tiểu học
            </p>
          </div>

          <div>
            <h3 class="font-bold mb-4">Liên kết nhanh</h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/courses" class="text-gray-400 hover:text-white transition-colors">
                  Khóa học
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/games" class="text-gray-400 hover:text-white transition-colors">
                  Trò chơi
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/dashboard" class="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-bold mb-4">Liên hệ</h3>
            <ul class="space-y-2 text-gray-400">
              <li>Email: contact@eduforkids.com</li>
              <li>Hotline: 1900-xxxx</li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {{ new Date().getFullYear() }} EduForKids. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Default layout setup
</script>
