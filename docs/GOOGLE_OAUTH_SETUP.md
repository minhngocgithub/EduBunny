# Google OAuth 2.0 Setup Guide

## ✅ Đã implement:

### Backend:
- ✅ Passport.js với Google OAuth Strategy
- ✅ Auth routes: `/api/auth/google` và `/api/auth/google/callback`
- ✅ Tự động tạo user mới khi đăng nhập lần đầu
- ✅ Link Google account với existing user
- ✅ Database schema với `googleId` field

### Endpoints:
```
POST /api/auth/register - Đăng ký thông thường
POST /api/auth/login - Đăng nhập thông thường
GET  /api/auth/google - Bắt đầu OAuth flow
GET  /api/auth/google/callback - Google callback
GET  /api/auth/profile - Lấy profile user
```

## 📋 Cần setup Google Cloud Console:

### 1. Tạo Google Cloud Project
1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project existing
3. Enable **Google+ API**

### 2. Tạo OAuth 2.0 Credentials
1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Chọn **Application type**: Web application
4. Điền thông tin:
   - **Name**: EduForKids Backend
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3001
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3001/api/auth/google/callback
     ```
5. Click **Create**
6. Copy **Client ID** và **Client Secret**

### 3. Cập nhật .env
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

## 🎨 Frontend Implementation

### Tạo nút "Sign in with Google":
```vue
<template>
  <div>
    <button @click="signInWithGoogle" class="google-signin-btn">
      <img src="/google-icon.svg" alt="Google" />
      Sign in with Google
    </button>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();

const signInWithGoogle = () => {
  // Redirect to backend OAuth endpoint
  window.location.href = `${config.public.apiBaseUrl}/auth/google`;
};
</script>
```

### Tạo callback page `/auth/callback`:
```vue
<!-- pages/auth/callback.vue -->
<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p>Đang xác thực...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

onMounted(() => {
  const token = route.query.token as string;
  const error = route.query.error as string;

  if (token) {
    // Save token to localStorage or cookie
    localStorage.setItem('auth_token', token);
    
    // Redirect to dashboard
    router.push('/dashboard');
  } else if (error) {
    // Handle error
    router.push('/login?error=' + error);
  }
});
</script>
```

## 🧪 Testing

### 1. Start backend:
```bash
cd backend
npm run dev
```

### 2. Test Google OAuth flow:
1. Click nút "Sign in with Google"
2. Chọn Google account
3. Cho phép quyền truy cập
4. Backend tự động tạo user và redirect về frontend với token

## 🔒 Security Notes

- Token được truyền qua URL query param (production nên dùng httpOnly cookie)
- CORS đã cấu hình cho localhost
- Production cần update HTTPS endpoints
- Session secret cần thay đổi trong production

## 🚀 Production Deployment

### Backend (.env):
```env
GOOGLE_CLIENT_ID=prod-client-id
GOOGLE_CLIENT_SECRET=prod-client-secret
GOOGLE_CALLBACK_URL=https://api.eduforkids.com/api/auth/google/callback
FRONTEND_URL=https://eduforkids.com
```

### Google Console - Add production URIs:
```
https://api.eduforkids.com/api/auth/google/callback
https://eduforkids.com
```
