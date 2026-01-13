<template>
  <div
    class="min-h-screen overflow-x-hidden transition-colors duration-300 selection:bg-primary/30 bg-background-light dark:bg-background-dark">
    <!-- Background Decor -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div
        class="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 dark:bg-secondary/5 rounded-full blur-[120px]">
      </div>
      <div
        class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[100px]">
      </div>
    </div>

    <!-- Navigation -->
    <LayoutAppNavbar />

    <!-- Hero Section -->
    <section class="relative px-6 pt-48 pb-24 mx-auto max-w-7xl">
      <div class="grid items-center gap-16 lg:grid-cols-2">
        <div class="space-y-8 text-center lg:text-left">
          <div
            class="inline-flex items-center gap-3 px-6 py-2 text-sm font-bold text-yellow-800 border rounded-full shadow-sm bg-warning/20 border-warning/40 dark:text-yellow-200 animate-bounce-slow">
            <span class="text-lg material-symbols-outlined">celebration</span>
            Nền tảng học tập vui nhộn nhất cho bé!
          </div>

          <h1
            class="font-display text-5xl md:text-7xl font-bold leading-[1.1] text-[#2C3E50] dark:text-white transition-colors duration-300">
            Học tập là <br />
            một <br />
            <span class="relative inline-block italic text-primary">
              Cuộc Phiêu Lưu!
              <svg class="absolute left-0 w-full h-5 -bottom-3 text-secondary/30" viewBox="0 0 100 10"
                preserveAspectRatio="none">
                <path d="M0 5 Q 50 12 100 5" fill="none" stroke="currentColor" stroke-width="5" />
              </svg>
            </span>
          </h1>

          <p
            class="max-w-md mx-auto text-lg font-medium leading-relaxed text-gray-600 transition-colors duration-300 dark:text-slate-400 lg:mx-0">
            Biến mỗi bài giảng thành một trò chơi kỳ thú. Đồng hành cùng bé là trợ lý Thỏ Ngọc AI thông minh và hàng
            ngàn thử thách hấp dẫn.
          </p>

          <div class="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <NuxtLink to="/auth"
              class="px-10 py-5 bg-primary text-white font-display text-xl font-bold rounded-[2rem] shadow-[0_12px_40px_-10px_rgba(255,107,107,0.5)] hover:-translate-y-1 active:translate-y-1 transition-all flex items-center justify-center gap-3">
              Khám phá ngay 🚀
            </NuxtLink>
            <button
              class="px-8 py-5 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-display text-lg font-bold rounded-[2rem] border-2 border-gray-200 dark:border-slate-700 hover:border-secondary transition-all flex items-center justify-center gap-2">
              Xem Demo 🎥
            </button>
          </div>

          <div class="flex items-center justify-center gap-5 pt-4 lg:justify-start">
            <div class="flex -space-x-3">
              <img v-for="i in 5" :key="i"
                class="border-white rounded-full shadow-lg size-11 border-3 dark:border-slate-800"
                :src="`https://picsum.photos/100/100?random=${i + 10}`" alt="user" />
            </div>
            <div>
              <p class="text-sm font-bold text-gray-700 dark:text-slate-300">Hơn <span
                  class="text-base font-black text-primary">15,000+</span> bạn nhỏ</p>
              <p class="text-xs font-semibold text-gray-500 dark:text-slate-400">Đang cùng học tập mỗi ngày!</p>
            </div>
          </div>
        </div>

        <div class="relative">
          <div class="absolute inset-0 bg-secondary/10 dark:bg-secondary/5 rounded-full blur-[80px]"></div>
          <div
            class="relative animate-float p-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-[4rem] shadow-inner border border-white/60 dark:border-white/10">
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop"
              alt="Bé học tập"
              class="rounded-[3.5rem] shadow-xl border-3 border-white dark:border-slate-700 w-full object-cover aspect-[4/3]" />

            <!-- Floating Badge - Achievement -->
            <div
              class="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.12)] flex items-center gap-3 animate-bounce-slow ring-1 ring-black/5 dark:ring-white/5">
              <div class="flex items-center justify-center size-12 bg-success/20 text-success rounded-2xl">
                <span class="text-2xl font-bold material-symbols-outlined">military_tech</span>
              </div>
              <div>
                <p class="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider">Thành tích
                  mới</p>
                <p class="text-lg font-bold text-gray-800 font-display dark:text-white">Siêu Anh Hùng!</p>
              </div>
            </div>

            <!-- Floating Badge - AI Assistant -->
            <div
              class="absolute -top-4 -right-4 bg-white dark:bg-slate-800 p-4 rounded-[2rem] shadow-xl flex items-center gap-3 border border-primary/10 ring-1 ring-black/5 dark:ring-white/5">
              <div class="text-3xl">🐰</div>
              <div class="text-left">
                <p class="text-xs font-black text-gray-800 dark:text-white">Thỏ Ngọc AI</p>
                <p class="text-[10px] text-primary font-bold">"Bạn giỏi quá đi!"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Subjects Section -->
    <section class="relative py-32 transition-colors duration-300 bg-white dark:bg-slate-900">
      <div class="px-6 mx-auto max-w-7xl">
        <div class="max-w-2xl mx-auto mb-20 space-y-4 text-center">
          <h2 class="font-display text-5xl font-bold text-[#2C3E50] dark:text-white">Chương trình học đa dạng</h2>
          <p class="text-lg font-medium text-gray-500 dark:text-slate-400">Bé được rèn luyện toàn diện các kỹ năng theo
            chương trình chuẩn quốc tế và Bộ GD&ĐT.</p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div v-for="(subject, i) in subjects" :key="i"
            class="group relative p-8 rounded-[3rem] bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-primary/30 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
            <div
              :class="`size-16 ${subject.color} text-white rounded-[1.75rem] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`">
              <span class="text-3xl font-bold material-symbols-outlined">{{ subject.icon }}</span>
            </div>
            <h3 class="font-display text-xl font-bold mb-3 text-[#2C3E50] dark:text-white">{{ subject.name }}</h3>
            <p class="text-sm font-medium leading-relaxed text-gray-600 dark:text-slate-400">{{ subject.desc }}</p>
            <div
              class="flex items-center gap-2 mt-6 text-xs font-bold transition-opacity opacity-0 text-primary group-hover:opacity-100">
              Xem chi tiết <span class="text-xs material-symbols-outlined">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Section -->
    <section class="py-24 bg-[#2C3E50] dark:bg-slate-950 text-white transition-colors duration-300">
      <div class="px-6 mx-auto text-center max-w-7xl">
        <p class="text-secondary font-black uppercase tracking-[0.3em] text-xs mb-10">Được tin dùng bởi các tổ chức uy
          tín</p>
        <div
          class="flex flex-wrap items-center justify-center gap-16 transition-all duration-500 opacity-40 grayscale hover:grayscale-0">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Logo.svg"
            class="h-8 invert dark:invert-0" alt="Partner" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Microsoft_Logo.svg"
            class="h-8 invert dark:invert-0" alt="Partner" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
            class="h-6 invert dark:invert-0" alt="Partner" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
            class="h-6 invert dark:invert-0" alt="Partner" />
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer
      class="py-24 transition-colors duration-300 bg-white border-t border-gray-100 dark:bg-slate-900 dark:border-slate-800">
      <div class="grid gap-16 px-6 mx-auto max-w-7xl md:grid-cols-4">
        <div class="col-span-1 space-y-8 lg:col-span-1">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center text-white shadow-lg size-10 bg-primary rounded-xl">
              <span class="font-bold material-symbols-outlined">school</span>
            </div>
            <span class="font-display text-2xl font-bold text-[#2C3E50] dark:text-white">EduFun</span>
          </div>
          <p class="font-medium leading-relaxed text-gray-500 dark:text-slate-400">
            Nền tảng học tập thông minh sử dụng trí tuệ nhân tạo để cá nhân hóa hành trình tri thức của mỗi bạn nhỏ.
          </p>
          <div class="flex gap-4">
            <button v-for="social in ['facebook', 'youtube', 'tiktok', 'instagram']" :key="social"
              class="flex items-center justify-center text-gray-400 transition-all size-12 rounded-2xl bg-gray-50 dark:bg-slate-800 hover:bg-primary hover:text-white">
              <span class="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>

        <div class="md:pl-10">
          <h4 class="font-display text-xl font-bold mb-8 text-[#2C3E50] dark:text-white">Học tập</h4>
          <ul class="space-y-4 font-medium text-gray-500 dark:text-slate-400">
            <li><a href="#" class="transition-colors hover:text-primary">Toán học lớp 1-5</a></li>
            <li><a href="#" class="transition-colors hover:text-primary">Tiếng Việt sáng tạo</a></li>
            <li><a href="#" class="transition-colors hover:text-primary">Tiếng Anh chuẩn Giao tiếp</a></li>
            <li><a href="#" class="transition-colors hover:text-primary">Kỹ năng sống</a></li>
          </ul>
        </div>

        <div>
          <h4 class="font-display text-xl font-bold mb-8 text-[#2C3E50] dark:text-white">EduFun</h4>
          <ul class="space-y-4 font-medium text-gray-500 dark:text-slate-400">
            <li><a href="#" class="transition-colors hover:text-primary">Về chúng tôi</a></li>
            <li><a href="#" class="transition-colors hover:text-primary">Góc phụ huynh</a></li>
            <li><a href="#" class="transition-colors hover:text-primary">Chính sách bảo mật</a></li>
            <li><a href="#" class="transition-colors hover:text-primary">Liên hệ hợp tác</a></li>
          </ul>
        </div>

        <div
          class="bg-background-light dark:bg-slate-800 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-700">
          <h4 class="font-display text-xl font-bold mb-4 text-[#2C3E50] dark:text-white">Newsletter 🥕</h4>
          <p class="mb-6 text-sm font-medium text-gray-500 dark:text-slate-400">Nhận ngay cẩm nang học tập cùng con miễn
            phí hàng tuần.</p>
          <div class="space-y-3">
            <input type="email" placeholder="Email của ba mẹ"
              class="w-full px-5 py-4 text-sm bg-white border-none shadow-sm outline-none rounded-2xl dark:bg-slate-900 focus:ring-2 focus:ring-primary dark:text-white" />
            <button
              class="w-full py-4 bg-[#2C3E50] dark:bg-slate-700 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors">Đăng
              ký</button>
          </div>
        </div>
      </div>
      <div
        class="flex flex-col items-center justify-between gap-6 px-6 pt-16 mx-auto mt-16 text-xs font-black tracking-widest text-gray-400 uppercase border-t max-w-7xl border-gray-50 dark:border-slate-800 md:flex-row">
        <p>© 2024 EduBunny Ecosystem. All Rights Reserved.</p>
        <div class="flex gap-8">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// No middleware - home page is accessible to everyone

const subjects = [
  { name: 'Toán học', icon: 'calculate', color: 'bg-primary', desc: 'Làm quen với những con số kỳ thú thông qua trò chơi.' },
  { name: 'Tiếng Việt', icon: 'menu_book', color: 'bg-secondary', desc: 'Khám phá vẻ đẹp tiếng mẹ đẻ qua các câu chuyện cổ tích.' },
  { name: 'Tiếng Anh', icon: 'language', color: 'bg-accent', desc: 'Tự tin giao tiếp với bạn bè quốc tế cùng Thỏ Ngọc.' },
  { name: 'Khoa học', icon: 'science', color: 'bg-success', desc: 'Tìm hiểu về thiên nhiên và vũ trụ bao la.' },
];

// Page title
useHead({
  title: 'Trang chủ - EduFun | Học tập là cuộc phiêu lưu',
  meta: [
    { name: 'description', content: 'Nền tảng học tập thông minh sử dụng AI để cá nhân hóa hành trình tri thức cho học sinh tiểu học. Đồng hành cùng Thỏ Ngọc AI.' },
  ],
});
</script>

<style scoped>
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
  animation: float 6s ease-in-out infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.dark .glass-effect {
  background: rgba(15, 23, 42, 0.8);
}
</style>