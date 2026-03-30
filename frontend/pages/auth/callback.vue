<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref<string | null>(null)
const progress = ref(0)
const statusMessage = ref('Connecting to server...')
const statusStep = ref(0)

const steps = [
  'Connecting to server...',
  'Verifying your identity...',
  'Loading your profile...',
  'Preparing your adventure...',
]

let progressInterval: ReturnType<typeof setInterval> | null = null

const startProgressAnimation = () => {
  let step = 0
  progressInterval = setInterval(() => {
    if (progress.value < 85) {
      progress.value += Math.random() * 4 + 1
      if (progress.value > 85) progress.value = 85

      const newStep = Math.floor((progress.value / 85) * steps.length)
      if (newStep !== statusStep.value && newStep < steps.length) {
        statusStep.value = newStep
        statusMessage.value = steps[newStep]
      }
    }
  }, 120)
}

const completeProgress = async () => {
  if (progressInterval) clearInterval(progressInterval)
  statusMessage.value = 'Almost there!'
  progress.value = 95
  await new Promise(r => setTimeout(r, 300))
  progress.value = 100
}

const processAuth = async () => {
  startProgressAnimation()

  const errorParam = route.query.error as string | undefined

  if (errorParam) {
    if (progressInterval) clearInterval(progressInterval)
    error.value = 'Google login failed. Please try again.'
    showToast({ type: 'error', message: error.value })
    setTimeout(() => router.replace('/auth'), 2500)
    loading.value = false
    return
  }

  const token = route.query.token as string | undefined
  const refreshToken = route.query.refreshToken as string | undefined

  if (!token) {
    if (progressInterval) clearInterval(progressInterval)
    error.value = 'Authentication token not found.'
    showToast({ type: 'error', message: error.value })
    setTimeout(() => router.replace('/auth'), 2500)
    loading.value = false
    return
  }

  try {
    authStore.setTokens(token, refreshToken || '')
    const result = await authStore.fetchProfile()

    if (!result.success) throw new Error(result.message || 'Fetch profile failed')

    await completeProgress()

    showToast({ type: 'success', message: 'Đăng nhập Google thành công!' })
    setTimeout(() => router.replace('/dashboard'), 800)
  } catch (err: any) {
    if (progressInterval) clearInterval(progressInterval)
    error.value = err?.message || 'An error occurred during login.'
    showToast({ type: 'error', message: error.value || '' })
    authStore.clearAuthData()
    setTimeout(() => router.replace('/auth'), 2500)
  } finally {
    loading.value = false
  }
}

onMounted(processAuth)
onUnmounted(() => { if (progressInterval) clearInterval(progressInterval) })
</script>

<template>
  <div class="flex items-center justify-center w-full min-h-screen p-4 auth-bg">

    <!-- Loading State -->
    <div v-if="!error" class="text-center card">

      <!-- Mascot Avatar -->
      <div class="mx-auto mb-8 avatar-ring">
        <div class="avatar-inner">
          <span class="bunny-emoji">🐰</span>
        </div>
        <div class="ring-pulse ring-1"></div>
        <div class="ring-pulse ring-2"></div>
      </div>

      <!-- Heading -->
      <h1 class="heading">
        Getting your adventure<br />ready!
      </h1>
      <p class="subtitle">Thỏ Ngọc is hopping into your world...</p>

      <!-- Progress Section -->
      <div class="progress-section">
        <div class="progress-label-row">
          <span class="progress-label">{{ statusMessage.toUpperCase() }}</span>
          <span class="wand-icon">✨</span>
        </div>

        <!-- Icon Track -->
        <div class="icon-track">
          <span class="track-icon" :class="{ active: progress >= 25 }">⭐</span>
          <span class="track-icon" :class="{ active: progress >= 55 }">📚</span>
          <span class="track-icon" :class="{ active: progress >= 85 }">🎓</span>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar-wrapper">
          <div class="progress-bar-track">
            <div class="progress-bar-fill" :style="{ width: progress + '%' }">
              <div class="progress-shimmer"></div>
            </div>
            <!-- Milestone dots -->
            <div class="milestone" style="left: 25%"></div>
            <div class="milestone" style="left: 55%"></div>
            <div class="milestone" style="left: 85%"></div>
          </div>
        </div>

        <!-- Status dots -->
        <div class="dots-row">
          <span class="dots-text">Almost there!</span>
          <span class="dot" style="animation-delay: 0s"></span>
          <span class="dot" style="animation-delay: 0.2s"></span>
          <span class="dot" style="animation-delay: 0.4s"></span>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center card">
      <div class="mx-auto mb-8 error-avatar">
        <span class="text-5xl">😢</span>
      </div>
      <h1 class="heading">Oops! Something went wrong</h1>
      <p class="subtitle error-msg">{{ error }}</p>
      <p class="redirect-text">Redirecting you back...</p>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

* { font-family: 'Nunito', sans-serif; }

.auth-bg {
  background: #F0F2EF;
}

/* Card */
.card {
  width: 100%;
  max-width: 480px;
  padding: 3rem 2.5rem 2.5rem;
}

/* Avatar */
.avatar-ring {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-inner {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffe4e8 0%, #ffd6e0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 5px solid white;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.18);
  z-index: 2;
  position: relative;
  overflow: hidden;
}

.bunny-emoji {
  font-size: 72px;
  line-height: 1;
  animation: float 3s ease-in-out infinite;
}

.ring-pulse {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(255, 107, 107, 0.25);
  animation: pulse-ring 2.5s ease-out infinite;
}

.ring-1 {
  width: 158px;
  height: 158px;
  animation-delay: 0s;
}

.ring-2 {
  width: 170px;
  height: 170px;
  animation-delay: 0.8s;
}

/* Text */
.heading {
  font-size: 1.8rem;
  font-weight: 900;
  color: #1a1a2e;
  line-height: 1.25;
  margin-bottom: 0.6rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 2.5rem;
}

/* Progress Section */
.progress-section {
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
}

.progress-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.progress-label {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #FF6B6B;
}

.wand-icon {
  font-size: 1rem;
}

/* Icon track */
.icon-track {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
  margin-bottom: 0.35rem;
  height: 28px;
  align-items: flex-end;
}

.track-icon {
  font-size: 1.1rem;
  opacity: 0.25;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: translateY(0);
}

.track-icon.active {
  opacity: 1;
  transform: translateY(-4px);
  filter: drop-shadow(0 4px 8px rgba(255, 107, 107, 0.4));
}

/* Progress bar */
.progress-bar-wrapper {
  margin-bottom: 0.75rem;
}

.progress-bar-track {
  height: 10px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: visible;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF8A80 0%, #FF6B6B 50%, #FF5252 100%);
  border-radius: 99px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(255, 82, 82, 0.4);
}

.progress-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
  animation: shimmer 1.8s ease-in-out infinite;
}

.milestone {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #d1d5db;
  z-index: 1;
}

/* Dots */
.dots-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 0.5rem;
}

.dots-text {
  font-size: 0.78rem;
  color: #9ca3af;
  font-weight: 600;
  margin-right: 4px;
}

.dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #d1d5db;
  border-radius: 50%;
  animation: dot-pulse 1.4s ease-in-out infinite;
}

/* Error state */
.error-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-msg {
  color: #ef4444;
}

.redirect-text {
  font-size: 0.85rem;
  color: #9ca3af;
  font-weight: 600;
  margin-top: 0.5rem;
  animation: fade-pulse 1.5s ease-in-out infinite;
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); opacity: 0.7; }
  70% { transform: scale(1.15); opacity: 0; }
  100% { transform: scale(1.15); opacity: 0; }
}

@keyframes shimmer {
  0% { left: -60%; }
  100% { left: 150%; }
}

@keyframes dot-pulse {
  0%, 80%, 100% { transform: scale(0.8); background: #d1d5db; }
  40% { transform: scale(1.2); background: #FF6B6B; }
}

@keyframes fade-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>