<template>
  <div
    class="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
    <div class="w-full max-w-2xl text-center">
      <!-- Error Illustration -->
      <div class="mb-8">
        <div class="inline-block p-8 bg-white rounded-full shadow-xl dark:bg-slate-800">
          <span class="text-8xl">{{ errorIcon }}</span>
        </div>
      </div>

      <!-- Error Code -->
      <h1 class="mb-4 text-6xl font-bold font-display text-slate-800 dark:text-white">
        {{ error?.statusCode || '500' }}
      </h1>

      <!-- Error Message -->
      <p class="mb-4 text-2xl font-bold text-slate-600 dark:text-slate-300">
        {{ errorTitle }}
      </p>

      <p class="max-w-md mx-auto mb-8 text-lg text-slate-500 dark:text-slate-400">
        {{ errorMessage }}
      </p>

      <!-- Actions -->
      <div class="flex flex-col justify-center gap-4 sm:flex-row">
        <NuxtLink to="/"
          class="px-8 py-4 font-bold text-white transition-all shadow-lg bg-primary rounded-2xl shadow-primary/30 hover:scale-105">
          🏠 Về trang chủ
        </NuxtLink>
        <button @click="handleError"
          class="px-8 py-4 font-bold transition-all bg-white border-2 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl border-slate-200 dark:border-slate-700 hover:border-primary">
          🔄 Thử lại
        </button>
      </div>

      <!-- Additional Help -->
      <div class="pt-8 mt-12 border-t border-slate-200 dark:border-slate-700">
        <p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ hỗ trợ:
        </p>
        <a href="mailto:support@edufun.vn" class="font-bold text-primary hover:underline">
          support@edufun.vn
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: Object
});

const errorIcon = computed(() => {
  const code = props.error?.statusCode;
  if (code === 404) return '🔍';
  if (code === 403) return '🔒';
  if (code === 401) return '🚫';
  return '⚠️';
});

const errorTitle = computed(() => {
  const code = props.error?.statusCode;
  if (code === 404) return 'Trang không tồn tại';
  if (code === 403) return 'Không có quyền truy cập';
  if (code === 401) return 'Chưa đăng nhập';
  return 'Đã có lỗi xảy ra';
});

const errorMessage = computed(() => {
  const code = props.error?.statusCode;
  if (code === 404) return 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.';
  if (code === 403) return 'Bạn không có quyền truy cập vào trang này.';
  if (code === 401) return 'Vui lòng đăng nhập để tiếp tục.';
  return 'Có lỗi xảy ra khi tải trang. Vui lòng thử lại sau.';
});

const handleError = () => clearError({ redirect: '/' });

// Set page title
useHead({
  title: `${errorTitle.value} - EduFun`,
});
</script>
