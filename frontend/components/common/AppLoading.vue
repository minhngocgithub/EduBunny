<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const messages = [
  'Thỏ Ngọc đang chuẩn bị bài học... 🐰',
  'Chờ chút nhé, phép thuật đang diễn ra! ✨',
  'Đang thu thập những ngôi sao may mắn... ⭐',
  'Cà rốt kiến thức đang được nạp vào... 🥕',
  'Sắp tới giờ phiêu lưu rồi bạn ơi! 🚀'
]

const currentMessageIndex = ref(0)
const progress = ref(0)

let messageInterval: ReturnType<typeof setInterval>
let progressInterval: ReturnType<typeof setInterval>

onMounted(() => {
  messageInterval = setInterval(() => {
    currentMessageIndex.value =
      (currentMessageIndex.value + 1) % messages.length
  }, 2500)

  progressInterval = setInterval(() => {
    if (progress.value < 95) {
      progress.value += Math.random() * 12
    }
  }, 400)
})

onUnmounted(() => {
  clearInterval(messageInterval)
  clearInterval(progressInterval)
})
</script>

<template>
  <div
    class="fixed inset-0 z-[9999] bg-background-light dark:bg-background-dark flex flex-col items-center justify-center overflow-hidden">

    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-10 left-[10%] text-6xl animate-float opacity-20">🎨</div>
      <div class="absolute top-1/4 right-[15%] text-4xl animate-bounce-slow opacity-20">⭐</div>
      <div class="absolute bottom-20 left-[15%] text-5xl animate-float opacity-20 delay-1000">🥕</div>
      <div class="absolute bottom-1/4 right-[10%] text-6xl animate-bounce-slow opacity-20 delay-500">🚀</div>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]">
      </div>
    </div>

    <div class="relative mb-12">
      <div
        class="size-48 bg-white dark:bg-slate-800 rounded-[4rem] shadow-2xl flex items-center justify-center border-8 border-white dark:border-slate-700 animate-bounce-slow">
        <span class="text-[100px] select-none">🐰</span>
      </div>

      <div
        class="absolute flex items-center justify-center shadow-xl -top-4 -right-4 size-16 bg-warning rounded-2xl rotate-12 animate-float">
        <span class="text-3xl">⭐</span>
      </div>
    </div>

    <div class="max-w-sm px-6 space-y-6 text-center">
      <h2 class="text-3xl font-bold tracking-tight text-gray-800 dark:text-white font-display">
        Đang tải...
      </h2>

      <div class="h-10">
        <Transition name="fade" mode="out-in">
          <p :key="currentMessageIndex" class="text-lg font-medium text-gray-500 dark:text-slate-400">
            {{ messages[currentMessageIndex] }}
          </p>
        </Transition>
      </div>

      <div
        class="relative w-64 h-4 mx-auto mt-8 overflow-hidden bg-gray-200 border-2 border-white rounded-full shadow-inner dark:bg-slate-700 dark:border-slate-600">
        <div
          class="h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-primary to-orange-400"
          :style="{ width: `${progress}%` }">

          <div
            class="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]">
          </div>
        </div>
      </div>
    </div>

    <div class="absolute flex items-center gap-2 bottom-10 opacity-40">
      <div class="size-6 bg-primary rounded-lg flex items-center justify-center text-white text-[10px]">
        <span class="text-sm font-bold material-symbols-outlined">school</span>
      </div>
      <span class="text-lg font-bold text-gray-800 dark:text-white font-display">
        EduFun
      </span>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%,100% { transform: translateY(0) }
  50% { transform: translateY(-20px) }
}

@keyframes bounce-slow {
  0%,100% { transform: translateY(0) }
  50% { transform: translateY(-10px) }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: all .5s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
