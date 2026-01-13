<script setup lang="ts">
definePageMeta({
    middleware: 'auth',
});

useHead({
    title: 'Thành tích - EduForKids',
    meta: [
        { name: 'description', content: 'Xem tất cả thành tích và huy hiệu của bạn' },
    ],
});

const userStore = useUserStore();
const loading = ref(true);

// Mock achievements data (TODO: fetch from API)
const achievements = ref([
    {
        id: 1,
        icon: '🎓',
        title: 'Người học siêng',
        description: 'Hoàn thành 10 bài học',
        unlocked: true,
        unlockedAt: '2024-01-15',
        progress: 100,
    },
    {
        id: 2,
        icon: '⭐',
        title: 'Ngôi sao sáng',
        description: 'Đạt 100 sao',
        unlocked: true,
        unlockedAt: '2024-01-20',
        progress: 100,
    },
    {
        id: 3,
        icon: '🔥',
        title: 'Chiến binh bền bỉ',
        description: 'Duy trì streak 7 ngày liên tiếp',
        unlocked: false,
        progress: 57,
    },
    {
        id: 4,
        icon: '🏆',
        title: 'Vô địch toán',
        description: 'Hoàn thành khóa toán',
        unlocked: false,
        progress: 0,
    },
    {
        id: 5,
        icon: '📚',
        title: 'Thư viện sách',
        description: 'Hoàn thành 5 khóa học',
        unlocked: false,
        progress: 60,
    },
    {
        id: 6,
        icon: '🎯',
        title: 'Sát thủ Quiz',
        description: 'Đạt điểm tuyệt đối 10 lần',
        unlocked: false,
        progress: 70,
    },
]);

onMounted(async () => {
    try {
        await userStore.fetchProfile();
        if (userStore.isStudent) {
            await userStore.fetchStudentProfile();
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="min-h-screen transition-colors duration-300 bg-background dark:bg-slate-950">
        <!-- Navigation -->
        <LayoutAppNavbar />

        <div class="container px-4 py-8 mx-auto pt-24">
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-20">
                <div class="text-center">
                    <div class="mb-4 text-6xl animate-bounce">🐰</div>
                    <p class="font-bold text-gray-600 dark:text-slate-400">Đang tải...</p>
                </div>
            </div>

            <div v-else class="max-w-6xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <NuxtLink
                        to="/profile"
                        class="inline-flex items-center gap-2 mb-4 text-gray-600 dark:text-slate-400 hover:text-primary transition-colors"
                    >
                        <span class="material-symbols-outlined">arrow_back</span>
                        <span>Quay lại hồ sơ</span>
                    </NuxtLink>
                    <h1 class="text-4xl font-bold text-gray-900 dark:text-white font-display">
                        🏆 Thành tích của tôi
                    </h1>
                    <p class="mt-2 text-gray-600 dark:text-slate-400">
                        Xem tất cả huy hiệu và thành tích bạn đã đạt được
                    </p>
                </div>

                <!-- Stats Summary -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div class="p-6 bg-white border border-white shadow-xl dark:bg-slate-900 dark:border-white/5 rounded-2xl">
                        <div class="text-3xl font-bold text-primary">{{ achievements.filter(a => a.unlocked).length }}</div>
                        <div class="mt-1 text-sm font-semibold text-gray-600 dark:text-slate-400">Đã mở khóa</div>
                    </div>
                    <div class="p-6 bg-white border border-white shadow-xl dark:bg-slate-900 dark:border-white/5 rounded-2xl">
                        <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                            {{ achievements.filter(a => !a.unlocked).length }}
                        </div>
                        <div class="mt-1 text-sm font-semibold text-gray-600 dark:text-slate-400">Đang phấn đấu</div>
                    </div>
                    <div class="p-6 bg-white border border-white shadow-xl dark:bg-slate-900 dark:border-white/5 rounded-2xl">
                        <div class="text-3xl font-bold text-green-600 dark:text-green-400">
                            {{ Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100) }}%
                        </div>
                        <div class="mt-1 text-sm font-semibold text-gray-600 dark:text-slate-400">Hoàn thành</div>
                    </div>
                </div>

                <!-- Achievements Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        v-for="achievement in achievements"
                        :key="achievement.id"
                        :class="[
                            'p-6 rounded-2xl border-2 transition-all',
                            achievement.unlocked
                                ? 'bg-white dark:bg-slate-900 border-primary shadow-xl hover:scale-105'
                                : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 opacity-60'
                        ]"
                    >
                        <div class="text-center">
                            <div
                                :class="[
                                    'inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full text-4xl',
                                    achievement.unlocked
                                        ? 'bg-primary/10 ring-4 ring-primary/20'
                                        : 'bg-gray-200 dark:bg-slate-700 grayscale'
                                ]"
                            >
                                {{ achievement.icon }}
                            </div>
                            <h3
                                :class="[
                                    'text-xl font-bold mb-2',
                                    achievement.unlocked
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-slate-400'
                                ]"
                            >
                                {{ achievement.title }}
                            </h3>
                            <p class="text-sm text-gray-600 dark:text-slate-400 mb-4">
                                {{ achievement.description }}
                            </p>

                            <!-- Progress Bar -->
                            <div v-if="!achievement.unlocked" class="mb-2">
                                <div class="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        class="h-full bg-primary transition-all"
                                        :style="{ width: `${achievement.progress}%` }"
                                    ></div>
                                </div>
                                <p class="mt-1 text-xs text-gray-500 dark:text-slate-500">
                                    {{ achievement.progress }}% hoàn thành
                                </p>
                            </div>

                            <!-- Unlocked Badge -->
                            <div v-if="achievement.unlocked" class="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold text-primary bg-primary/10 rounded-full">
                                <span class="material-symbols-outlined text-sm">check_circle</span>
                                Đã mở khóa
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
