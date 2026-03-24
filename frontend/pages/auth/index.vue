<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest',
});

import { Form, Field, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import type { LoginRequest, RegisterRequest } from '~/types/auth';
const showPassword = ref(false)
const showRegisterPassword = ref(false)       
const showConfirmPassword = ref(false) 
// Check if we're accidentally on callback URL (routing issue)
if (process.client && window.location.pathname === '/auth/callback') {
  console.warn('Auth page detected callback URL, forcing router navigation');
  const router = useRouter();
  router.push(window.location.pathname + window.location.search);
}

const { login, register } = useAuth();
const { showToast } = useToast();

// State
const isRegister = ref(false);
const selectedRole = ref<'STUDENT' | 'PARENT' | 'TEACHER'>('STUDENT');
const loading = ref(false);

// Login Schema
const loginSchema = toTypedSchema(
  z.object({
    email: z
      .string({ required_error: 'Email là bắt buộc' })
      .email('Email không hợp lệ'),
    password: z
      .string({ required_error: 'Mật khẩu là bắt buộc' })
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(12, 'Mật khẩu không được quá 12 ký tự'),
    rememberMe: z.boolean().optional().default(false),
  })
);

// Register Schema
const registerSchema = toTypedSchema(
  z.object({
    firstName: z
      .string({ required_error: 'Họ là bắt buộc' })
      .min(1, 'Họ là bắt buộc')
      .max(50, 'Họ không được quá 50 ký tự'),
    lastName: z
      .string({ required_error: 'Tên là bắt buộc' })
      .min(1, 'Tên là bắt buộc')
      .max(50, 'Tên không được quá 50 ký tự'),
    email: z
      .string({ required_error: 'Email là bắt buộc' })
      .email('Email không hợp lệ'),
    password: z
      .string({ required_error: 'Mật khẩu là bắt buộc' })
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(12, 'Mật khẩu không được quá 12 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
      ),
    confirmPassword: z
      .string({ required_error: 'Xác nhận mật khẩu là bắt buộc' }),
    agreeTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Bạn phải đồng ý với điều khoản',
      }),
  })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Mật khẩu không khớp',
      path: ['confirmPassword'],
    })
);

const loginFormRef = ref();
const registerFormRef = ref();

// Legal modal state
const showLegalModal = ref(false);
const legalModalTab = ref<'terms' | 'privacy'>('terms');

const openLegalModal = (tab: 'terms' | 'privacy') => {
  legalModalTab.value = tab;
  showLegalModal.value = true;
};

const closeLegalModal = () => {
  showLegalModal.value = false;
};

// Handle login
const onLoginSubmit = async (values: any) => {
  loading.value = true;
  try {
    console.log('Login form values:', values);

    const result = await login({
      email: values.email,
      password: values.password,
    });

    if (result.success) {
      showToast({
        type: 'success',
        message: 'Đăng nhập thành công!',
      });
    } else {
      showToast({
        type: 'error',
        message: result.message || 'Đăng nhập thất bại',
      });
    }
  } catch (error: any) {
    console.error('Login error details:', error);

    if (error.errors && Array.isArray(error.errors)) {
      const errorMessages = error.errors.map((err: any) =>
        `${err.field}: ${err.message}`
      ).join(', ');

      showToast({
        type: 'error',
        message: errorMessages || error.message || 'Có lỗi xảy ra',
      });
    } else {
      showToast({
        type: 'error',
        message: error.message || 'Có lỗi xảy ra',
      });
    }
  } finally {
    loading.value = false;
  }
};

// Handle register
const onRegisterSubmit = async (values: any) => {
  loading.value = true;
  try {
    console.log('Register form values:', values);
    console.log('Selected role:', selectedRole.value);

    const result = await register({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      role: selectedRole.value === 'TEACHER' ? 'STUDENT' : selectedRole.value,
    });

    if (result.success) {
      showToast({
        type: 'success',
        message: 'Đăng ký thành công!',
      });
    } else {
      showToast({
        type: 'error',
        message: result.message || 'Đăng ký thất bại',
      });
    }
  } catch (error: any) {
    console.error('Register error details:', error);

    if (error.errors && Array.isArray(error.errors)) {
      const errorMessages = error.errors.map((err: any) =>
        `${err.field}: ${err.message}`
      ).join(', ');

      showToast({
        type: 'error',
        message: errorMessages || error.message || 'Có lỗi xảy ra',
      });
    } else {
      showToast({
        type: 'error',
        message: error.message || 'Có lỗi xảy ra',
      });
    }
  } finally {
    loading.value = false;
  }
};

// Handle Google login
const handleGoogleLogin = (event?: Event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  console.log('Google login clicked');
  // Redirect to backend Google OAuth endpoint
  const backendUrl = 'http://localhost:3001/api';
  const redirectUrl = `${backendUrl}/auth/google`;
  console.log('Redirecting to:', redirectUrl);

  // Use setTimeout to ensure console logs before redirect
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 100);
};

// Toggle between login and register
const toggleMode = () => {
  isRegister.value = !isRegister.value;
  loginFormRef.value?.resetForm();
  registerFormRef.value?.resetForm();
};
</script>

<template>
  <div class="min-h-screen w-full bg-[#F0F4F8] flex items-center justify-center p-4 lg:p-10 overflow-hidden relative">
    <!-- Decorations - Client Only to avoid hydration mismatch -->
    <ClientOnly>
      <div class="absolute top-10 left-10 text-8xl animate-bounce-slow opacity-20">🥕</div>
      <div class="absolute bottom-20 right-20 text-8xl animate-float opacity-20">⭐</div>
    </ClientOnly>

    <!-- Main Container -->
    <div
      class="relative w-full max-w-[1100px] min-h-[720px] bg-white rounded-[4rem] shadow-2xl overflow-hidden border-8 border-white">

      <!-- Section 1: Form -->
      <div :class="[
        'absolute top-0 w-full lg:w-1/2 h-full bg-white transition-all duration-700 ease-in-out px-6 lg:px-12 flex flex-col py-6 overflow-y-auto custom-scrollbar',
        isRegister ? 'lg:left-1/2 left-0 z-20' : 'left-0 z-20',
        isRegister ? 'justify-start pt-8' : 'justify-center'
      ]">
        <div :class="[
          'w-full mx-auto',
          isRegister ? 'max-w-sm' : 'max-w-md my-auto'
        ]">
          <h2 class="mb-2 text-2xl font-bold text-gray-800 lg:text-3xl font-display">
            {{ isRegister ? 'Tạo tài khoản mới' : 'Chào mừng quay lại!' }}
          </h2>
          <p class="mb-4 text-sm font-medium text-gray-500 lg:mb-6">
            Thỏ Ngọc đã đợi bạn rất lâu rồi đó! 🐰
          </p>

          <!-- Role Selector -->
          <div class="flex gap-1 p-1 mb-4 lg:mb-6 bg-gray-50 rounded-2xl">
            <button v-for="role in [
              { value: 'STUDENT', label: 'Học sinh' },
              { value: 'PARENT', label: 'Phụ huynh' },
              { value: 'TEACHER', label: 'Giáo viên' }
            ]" :key="role.value" @click="selectedRole = role.value as any" :class="[
              'flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center',
              selectedRole === role.value ? 'bg-white text-primary shadow-sm' : 'text-gray-400'
            ]">
              <span>{{ role.value === 'STUDENT' ? 'Học sinh' : role.value === 'PARENT' ? 'Phụ huynh' : 'Giáo viên'
              }}</span>
            </button>
          </div>

          <!-- Login Form -->
          <Form v-if="!isRegister" ref="loginFormRef" :validation-schema="loginSchema" @submit="onLoginSubmit"
            class="space-y-4" v-slot="{ errors }">
            <div>
              <Field name="email" type="email" placeholder="Email"
                class="w-full p-4 text-gray-700 transition-all border-2 border-transparent bg-gray-50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                :class="{ 'ring-2 ring-red-500 border-red-500': errors.email }" />
              <ErrorMessage name="email" class="block mt-1 text-sm text-red-600" />
            </div>

            <div>
              <Field name="password" v-slot="{ field, errors: fieldErrors }">
                <div class="relative">
                  <input v-bind="field" :type="showPassword ? 'text' : 'password'" placeholder="Mật khẩu"
                    class="w-full p-4 pr-12 text-gray-700 transition-all border-2 border-transparent bg-gray-50 rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none" />
                  <button type="button" @click="showPassword = !showPassword"
                    class="absolute text-gray-400 transition-colors -translate-y-1/2 right-4 top-1/2 hover:text-primary">
                    <!-- Eye open -->
                    <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
             -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <!-- Eye off -->
                    <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
             a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878
             l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59
             m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0
             01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
              </Field>
              <ErrorMessage name="password" class="block mt-1 text-sm text-red-600" />
            </div>

            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 cursor-pointer">
                <Field name="rememberMe" type="checkbox" :value="true" :unchecked-value="false"
                  class="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary" />
                <span class="text-gray-600">Ghi nhớ</span>
              </label>
              <NuxtLink to="/forgot-password" class="font-medium text-primary hover:underline">
                Quên mật khẩu?
              </NuxtLink>
            </div>

            <button type="submit" :disabled="loading"
              class="w-full bg-primary text-white font-display font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="loading">Đang đăng nhập...</span>
              <span v-else>Vào học thôi! 🚀</span>
            </button>

            <!-- Google Login -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 text-gray-500 bg-white">Hoặc</span>
              </div>
            </div>

            <button type="button" @click="handleGoogleLogin"
              class="flex items-center justify-center w-full gap-3 p-4 font-medium transition-all border-2 border-gray-200 rounded-2xl hover:bg-gray-50">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span class="text-gray-700">Đăng nhập với Google</span>
            </button>
          </Form>

          <!-- Register Form -->
          <Form v-else ref="registerFormRef" :validation-schema="registerSchema" @submit="onRegisterSubmit"
            class="space-y-2.5 pb-4" v-slot="{ errors }">
            <div class="grid grid-cols-2 gap-3">
              <div class="min-h-[90px]">
                <Field name="firstName" type="text" placeholder="Họ"
                  class="w-full p-4 transition-all border-2 border-transparent bg-gray-50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                  :class="{ 'ring-2 ring-red-500 border-red-500': errors.firstName }" />
                <ErrorMessage name="firstName" class="block mt-1 text-xs text-red-600 min-h-[16px]" />
              </div>

              <div class="min-h-[90px]">
                <Field name="lastName" type="text" placeholder="Tên"
                  class="w-full p-4 transition-all border-2 border-transparent bg-gray-50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                  :class="{ 'ring-2 ring-red-500 border-red-500': errors.lastName }" />
                <ErrorMessage name="lastName" class="block mt-1 text-xs text-red-600 min-h-[16px]" />
              </div>
            </div>

            <div class="min-h-[90px]">
              <Field name="email" type="email" placeholder="Email"
                class="w-full p-4 transition-all border-2 border-transparent bg-gray-50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                :class="{ 'ring-2 ring-red-500 border-red-500': errors.email }" />
              <ErrorMessage name="email" class="block mt-1 text-xs text-red-600 min-h-[16px]" />
            </div>

            <div class="min-h-[90px]">
              <Field name="password" type="password" placeholder="Mật khẩu (A-Z, a-z, 0-9, 6-12 ký tự)"
                class="w-full p-4 transition-all border-2 border-transparent bg-gray-50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                :class="{ 'ring-2 ring-red-500 border-red-500': errors.password }" />
              <ErrorMessage name="password" class="block mt-1 text-xs text-red-600 min-h-[16px]" />
            </div>

            <div class="min-h-[90px]">
              <Field name="confirmPassword" type="password" placeholder="Xác nhận mật khẩu"
                class="w-full p-4 transition-all border-2 border-transparent bg-gray-50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                :class="{ 'ring-2 ring-red-500 border-red-500': errors.confirmPassword }" />
              <ErrorMessage name="confirmPassword" class="block mt-1 text-xs text-red-600 min-h-[16px]" />
            </div>

            <div class="min-h-[55px]">
              <label class="flex items-start gap-2 cursor-pointer">
                <Field name="agreeTerms" type="checkbox" :value="true" :unchecked-value="false"
                  class="w-4 h-4 mt-0.5 border-gray-300 rounded text-primary focus:ring-primary flex-shrink-0" />
                <span class="text-xs leading-tight text-gray-600">
                  Tôi đồng ý với
                  <a href="#" @click.prevent="openLegalModal('terms')" class="font-medium text-primary hover:underline">
                    điều khoản sử dụng
                  </a>
                  và
                  <a href="#" @click.prevent="openLegalModal('privacy')"
                    class="font-medium text-primary hover:underline">
                    chính sách bảo mật
                  </a>
                </span>
              </label>
              <ErrorMessage name="agreeTerms" class="block mt-1 text-xs text-red-600 min-h-[16px]" />
            </div>

            <button type="submit" :disabled="loading || selectedRole === 'TEACHER'"
              class="w-full bg-primary text-white font-display font-bold py-3.5 text-sm rounded-2xl shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="loading">Đang đăng ký...</span>
              <span v-else-if="selectedRole === 'TEACHER'">Giáo viên chưa được hỗ trợ</span>
              <span v-else>Đăng ký ngay 🚀</span>
            </button>
          </Form>

          <p class="mt-3 text-sm font-medium text-center text-gray-500">
            {{ isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?' }}
            <button @click="toggleMode" class="ml-1 font-bold text-primary hover:underline">
              {{ isRegister ? 'Đăng nhập' : 'Tham gia ngay' }}
            </button>
          </p>
        </div>
      </div>

      <!-- Section 2: Visual -->
      <div :class="[
        'hidden lg:flex absolute top-0 w-1/2 h-full bg-gradient-to-br from-primary to-orange-400 z-10 transition-all duration-700 ease-in-out flex-col items-center justify-center p-16 text-white',
        isRegister ? 'left-0' : 'left-1/2'
      ]">
        <div class="space-y-8 text-center">
          <div class="flex items-center justify-center w-48 h-48 mx-auto rounded-full bg-white/20 animate-float">
            <span class="text-[100px] leading-none flex items-center justify-center">🐰</span>

            <!-- Legal Modal -->
            <ModalLegalModal :is-open="showLegalModal" :default-tab="legalModalTab" :show-accept-button="false"
              @close="closeLegalModal" />
          </div>
          <h2 class="text-4xl font-bold font-display">
            {{ isRegister ? 'Chào mừng bạn!' : 'Học tập thật vui!' }}
          </h2>
          <p class="text-lg opacity-90">
            Chinh phục kiến thức cùng EduBunny và tích lũy những ngôi sao may mắn mỗi ngày.
          </p>
          <div class="flex justify-center gap-4 text-4xl">
            <span class="animate-bounce-slow">📚</span>
            <span class="animate-float" style="animation-delay: 0.2s">🎮</span>
            <span class="animate-bounce-slow" style="animation-delay: 0.4s">🏆</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-20px);
  }
}

@keyframes bounce-slow {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}
</style>