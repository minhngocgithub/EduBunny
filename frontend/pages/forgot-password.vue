<template>
  <div
    class="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 to-indigo-100 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="mb-2 text-4xl font-bold text-gray-900">
          🎓 EduForKids
        </h1>
        <h2 class="text-2xl font-semibold text-gray-700">
          Quên mật khẩu?
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
        </p>
      </div>

      <AppCard>
        <form v-if="!emailSent" @submit.prevent="handleSubmit" class="space-y-6">
          <AppInput v-model="email" type="email" label="Email" placeholder="ten@email.com" required :error="error" />

          <AppButton type="submit" :loading="loading" :disabled="loading" full-width>
            Gửi email đặt lại mật khẩu
          </AppButton>

          <div class="text-sm text-center">
            <NuxtLink to="/auth" class="font-medium text-blue-600 hover:text-blue-500">
              ← Quay lại đăng nhập
            </NuxtLink>
          </div>
        </form>

        <div v-else class="py-6 text-center">
          <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 class="mb-2 text-lg font-semibold text-gray-900">
            Email đã được gửi!
          </h3>
          <p class="mb-6 text-sm text-gray-600">
            Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
          </p>

          <AppButton variant="outline" @click="resetForm">
            Gửi lại email
          </AppButton>

          <div class="mt-4 text-sm">
            <NuxtLink to="/auth" class="font-medium text-blue-600 hover:text-blue-500">
              ← Quay lại đăng nhập
            </NuxtLink>
          </div>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
  layout: false,
});

const { forgotPassword } = useAuth();
const toast = useToast();

const loading = ref(false);
const emailSent = ref(false);
const email = ref('');
const error = ref('');

const validateEmail = () => {
  error.value = '';

  if (!email.value) {
    error.value = 'Vui lòng nhập email';
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Email không hợp lệ';
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateEmail()) return;

  loading.value = true;

  try {
    const result = await forgotPassword(email.value);

    if (result.success) {
      emailSent.value = true;
      toast.success('Email đã được gửi!');
    } else {
      toast.error(result.message || 'Gửi email thất bại');
    }
  } catch (err: any) {
    toast.error(err.message || 'Đã xảy ra lỗi');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  emailSent.value = false;
  error.value = '';
};
</script>
