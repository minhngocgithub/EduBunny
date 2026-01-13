<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref<string | null>(null)

const processAuth = async () => {
  const errorParam = route.query.error as string | undefined

  if (errorParam) {
    error.value = 'Đăng nhập Google thất bại. Vui lòng thử lại.'
    showToast({ type: 'error', message: error.value })
    setTimeout(() => router.replace('/auth'), 2000)
    loading.value = false
    return
  }

  const token = route.query.token as string | undefined
  const refreshToken = route.query.refreshToken as string | undefined

  if (!token) {
    error.value = 'Không tìm thấy token xác thực.'
    showToast({ type: 'error', message: error.value })
    setTimeout(() => router.replace('/auth'), 2000)
    loading.value = false
    return
  }

  try {
    authStore.setTokens(token, refreshToken || '')

    const result = await authStore.fetchProfile()

    if (!result.success) {
      throw new Error(result.message || 'Fetch profile failed')
    }

    showToast({
      type: 'success',
      message: 'Đăng nhập Google thành công!',
    })

    setTimeout(() => router.replace('/dashboard'), 1000)
  } catch (err: any) {
    error.value = err?.message || 'Đã xảy ra lỗi khi đăng nhập.'
    showToast({ type: 'error', message: error.value || '' })

    authStore.clearAuthData()
    setTimeout(() => router.replace('/auth'), 2000)
  } finally {
    loading.value = false
  }
}

onMounted(processAuth)
</script>


<template>
    <div class="min-h-screen w-full bg-[#F0F4F8] flex items-center justify-center p-4">
        <div class="w-full max-w-md p-10 text-center bg-white shadow-2xl rounded-3xl">
            <!-- Loading -->
            <div v-if="loading && !error" class="space-y-6">
                <div class="flex items-center justify-center w-24 h-24 mx-auto rounded-full bg-primary/10 animate-pulse">
                    <span class="text-5xl">🐰</span>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 font-display">
                    Đang xác thực...
                </h2>
                <p class="text-gray-600">Vui lòng đợi trong giây lát</p>
                <div class="flex justify-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
                    <div class="w-3 h-3 rounded-full bg-primary animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-3 h-3 rounded-full bg-primary animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="space-y-6">
                <div class="flex items-center justify-center w-24 h-24 mx-auto bg-red-100 rounded-full">
                    <span class="text-5xl">❌</span>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 font-display">Có lỗi xảy ra</h2>
                <p class="text-gray-600">{{ error }}</p>
                <p class="text-sm text-gray-500">Đang chuyển hướng...</p>
            </div>

            <!-- Success -->
            <div v-else class="space-y-6">
                <div class="flex items-center justify-center w-24 h-24 mx-auto bg-green-100 rounded-full animate-bounce">
                    <span class="text-5xl">✅</span>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 font-display">Đăng nhập thành công!</h2>
                <p class="text-gray-600">Đang chuyển hướng...</p>
            </div>
        </div>
    </div>
</template>