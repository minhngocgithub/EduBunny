<template>
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="isOpen" @click="closeModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Transition enter-active-class="transition duration-300 ease-out transform"
                enter-from-class="scale-95 opacity-0" enter-to-class="scale-100 opacity-100"
                leave-active-class="transition duration-200 ease-in transform" leave-from-class="scale-100 opacity-100"
                leave-to-class="scale-95 opacity-0">
                <div v-if="isOpen" @click.stop
                    class="relative w-full max-w-4xl overflow-hidden border border-gray-100 shadow-2xl max-h-[90vh] rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl dark:border-slate-800">
                    <!-- Header -->
                    <div
                        class="sticky top-0 z-10 px-6 py-4 border-b border-gray-100 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl dark:border-slate-800">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div
                                    class="flex items-center justify-center text-2xl rounded-2xl size-12 bg-primary/10 text-primary">
                                    🏆
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold text-gray-800 font-display dark:text-white">
                                        Bảng Vàng
                                    </h2>
                                    <p class="text-sm text-gray-500 dark:text-slate-400">
                                        {{ metricDescriptions[selectedMetric] }}
                                    </p>
                                </div>
                            </div>
                            <button @click="closeModal"
                                class="flex items-center justify-center transition-all border border-gray-100 rounded-2xl size-10 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800">
                                <span class="material-symbols-outlined text-gray-500 dark:text-slate-400">close</span>
                            </button>
                        </div>

                        <!-- Metric Tabs -->
                        <div class="flex flex-wrap gap-3 mt-4">
                            <div class="flex gap-2">
                                <button v-for="metric in metricOptions" :key="metric.value"
                                    @click="selectMetric(metric.value)" :class="[
                                        'px-4 py-2 rounded-xl font-bold transition-all text-sm whitespace-nowrap',
                                        selectedMetric === metric.value
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                    ]">
                                    <span class="mr-2">{{ metric.icon }}</span>
                                    {{ metric.label }}
                                </button>
                            </div>

                            <!-- Timeframe Selector -->
                            <select v-model="selectedTimeframe"
                                class="px-4 py-2 text-sm font-bold text-gray-700 transition-all bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-slate-300">
                                <option value="all-time">Mọi lúc</option>
                                <option value="monthly">Tháng này</option>
                                <option value="weekly">Tuần này</option>
                            </select>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <!-- Loading State -->
                        <div v-if="loading" class="flex items-center justify-center py-12">
                            <div class="text-center">
                                <div class="mb-4 text-6xl animate-bounce">🐰</div>
                                <p class="font-bold text-gray-600 dark:text-slate-400">Đang tải...</p>
                            </div>
                        </div>

                        <!-- Leaderboard -->
                        <div v-else>
                            <!-- Top 3 Podium -->
                            <div v-if="topThree.length > 0" class="grid grid-cols-3 gap-4 mb-8">
                                <!-- 2nd Place -->
                                <div v-if="topThree[1]" class="flex flex-col items-center order-1 pt-8">
                                    <div class="relative mb-3">
                                        <CommonAppAvatar :avatar-seed="topThree[1].student.avatarSeed"
                                            :avatar-url="topThree[1].student.avatar"
                                            :user-name="topThree[1].student.firstName" size="xl" rounded="full"
                                            :ring="true" ring-color="gray-300" :show-crown="true" :rank="2" />
                                    </div>
                                    <p class="mb-1 font-bold text-center text-gray-800 dark:text-white">
                                        {{ getFullName(topThree[1].student) }}
                                    </p>
                                    <div
                                        class="px-3 py-1 text-sm font-bold rounded-lg bg-gray-300/50 text-gray-700 dark:bg-slate-700 dark:text-slate-300">
                                        {{ formatScore(topThree[1].score) }}
                                    </div>
                                </div>

                                <!-- 1st Place -->
                                <div v-if="topThree[0]" class="flex flex-col items-center order-2">
                                    <div class="relative mb-3">
                                        <CommonAppAvatar :avatar-seed="topThree[0].student.avatarSeed"
                                            :avatar-url="topThree[0].student.avatar"
                                            :user-name="topThree[0].student.firstName" size="2xl" rounded="full"
                                            :ring="true" ring-color="yellow-400" :show-crown="true" :rank="1" />
                                    </div>
                                    <p class="mb-1 font-bold text-center text-gray-800 dark:text-white">
                                        {{ getFullName(topThree[0].student) }}
                                    </p>
                                    <div
                                        class="px-4 py-1.5 text-base font-bold text-yellow-700 rounded-lg bg-yellow-400/50 dark:bg-yellow-500/30 dark:text-yellow-300">
                                        {{ formatScore(topThree[0].score) }}
                                    </div>
                                </div>

                                <!-- 3rd Place -->
                                <div v-if="topThree[2]" class="flex flex-col items-center order-3 pt-12">
                                    <div class="relative mb-3">
                                        <CommonAppAvatar :avatar-seed="topThree[2].student.avatarSeed"
                                            :avatar-url="topThree[2].student.avatar"
                                            :user-name="topThree[2].student.firstName" size="xl" rounded="full"
                                            :ring="true" ring-color="orange-400" :show-crown="true" :rank="3" />
                                    </div>
                                    <p class="mb-1 font-bold text-center text-gray-800 dark:text-white">
                                        {{ getFullName(topThree[2].student) }}
                                    </p>
                                    <div
                                        class="px-3 py-1 text-sm font-bold text-orange-700 rounded-lg bg-orange-400/50 dark:bg-orange-500/30 dark:text-orange-300">
                                        {{ formatScore(topThree[2].score) }}
                                    </div>
                                </div>
                            </div>

                            <!-- Metric Description -->
                            <div
                                class="p-4 mb-6 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                                <div class="flex items-start gap-3">
                                    <span class="text-2xl">{{ currentMetricInfo.icon }}</span>
                                    <div>
                                        <h3 class="mb-1 font-bold text-gray-800 dark:text-white">
                                            {{ currentMetricInfo.title }}
                                        </h3>
                                        <p class="text-sm text-gray-600 dark:text-slate-400">
                                            {{ currentMetricInfo.description }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Rest of Leaderboard (4-10) -->
                            <div v-if="restOfList.length > 0" class="space-y-2">
                                <div v-for="entry in restOfList" :key="entry.rank" :class="[
                                    'flex items-center gap-4 p-4 rounded-2xl transition-all',
                                    entry.isCurrentUser
                                        ? 'bg-primary/10 border-2 border-primary dark:border-primary/50'
                                        : 'bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700'
                                ]">
                                    <!-- Rank -->
                                    <div
                                        class="flex items-center justify-center text-lg font-black text-gray-400 font-display w-9 dark:text-slate-500">
                                        #{{ entry.rank }}
                                    </div>

                                    <!-- Avatar -->
                                    <CommonAppAvatar :avatar-seed="entry.student.avatarSeed"
                                        :avatar-url="entry.student.avatar" :user-name="entry.student.firstName"
                                        size="md" rounded="full" :ring="true" />

                                    <!-- Name -->
                                    <div class="flex-1">
                                        <p class="font-bold text-gray-800 dark:text-white">
                                            {{ getFullName(entry.student) }}
                                            <span v-if="entry.isCurrentUser"
                                                class="ml-2 text-xs font-bold text-primary">(Bạn)</span>
                                        </p>
                                        <p v-if="entry.level" class="text-xs text-gray-500 dark:text-slate-400">
                                            Level {{ entry.level }}
                                        </p>
                                    </div>

                                    <!-- Score -->
                                    <div class="font-bold text-right text-primary dark:text-primary-light">
                                        {{ formatScore(entry.score) }}
                                    </div>
                                </div>
                            </div>

                            <!-- Empty State -->
                            <div v-if="leaderboardData.length === 0"
                                class="py-12 text-center text-gray-500 dark:text-slate-400">
                                <span class="block mb-2 text-6xl">📊</span>
                                <p class="font-bold">Chưa có dữ liệu bảng xếp hạng</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import type { LeaderboardEntry, LeaderboardMetric, LeaderboardTimeframe } from '~/types/leaderboard';
import { API_ENDPOINTS } from '~/types/api';

const props = defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits<{
    close: [];
}>();

const { apiClient } = useApiClient();
const authStore = useAuthStore();
const userStore = useUserStore();

const loading = ref(false);
const leaderboardData = ref<LeaderboardEntry[]>([]);
const selectedMetric = ref<LeaderboardMetric>('xp');
const selectedTimeframe = ref<LeaderboardTimeframe>('all-time');

const metricOptions = [
    {
        value: 'xp' as LeaderboardMetric,
        label: 'Siêu Cấp XP',
        icon: '⚡',
        title: 'Siêu Cấp XP (Tổng điểm kinh nghiệm)',
        description: 'Vinh danh những học sinh chăm chỉ nhất, tích lũy XP từ việc xem bài giảng, làm bài tập và hoàn thành khóa học.'
    },
    {
        value: 'stars' as LeaderboardMetric,
        label: 'Bậc Thầy ⭐',
        icon: '⭐',
        title: 'Bậc Thầy Ngôi Sao (Kỹ năng hoàn hảo)',
        description: 'Vinh danh những học sinh làm bài Quiz đạt điểm tuyệt đối (3 sao). Tiêu chí này đề cao chất lượng hơn số lượng.'
    },
    {
        value: 'streak' as LeaderboardMetric,
        label: 'Chiến Binh 🔥',
        icon: '🔥',
        title: 'Chiến Binh Bền Bỉ (Chuỗi ngày học)',
        description: 'Vinh danh những bạn duy trì thói quen học tập liên tục hàng ngày.'
    },
    {
        value: 'achievements' as LeaderboardMetric,
        label: 'Thợ Săn 🏅',
        icon: '🏅',
        title: 'Thợ Săn Danh Hiệu (Huy hiệu)',
        description: 'Vinh danh những học sinh hoàn thành các thử thách đặc biệt (Ví dụ: "Phù thủy Toán học", "Nhà thông thái").'
    }
];

const metricDescriptions: Record<LeaderboardMetric, string> = {
    xp: 'Top học sinh tích lũy XP cao nhất',
    stars: 'Top học sinh đạt nhiều sao nhất từ Quiz',
    streak: 'Top học sinh có chuỗi ngày học liên tiếp dài nhất',
    achievements: 'Top học sinh sở hữu nhiều danh hiệu nhất'
};

const currentMetricInfo = computed(() => {
    return metricOptions.find(m => m.value === selectedMetric.value) || metricOptions[0];
});

const topThree = computed(() => leaderboardData.value.slice(0, 3));
const restOfList = computed(() => leaderboardData.value.slice(3, 10));

const fetchLeaderboard = async () => {
    loading.value = true;
    try {
        const response = await apiClient.get<LeaderboardEntry[]>(API_ENDPOINTS.USER.LEADERBOARD, {
            metric: selectedMetric.value,
            timeframe: selectedTimeframe.value,
            limit: 10
        });

        if (response.success && response.data) {
            // Mark current user's entry
            const currentUserId = userStore.studentProfile?.id;
            leaderboardData.value = response.data.map(entry => ({
                ...entry,
                isCurrentUser: entry.student.id === currentUserId
            }));
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    } finally {
        loading.value = false;
    }
};

const selectMetric = (metric: LeaderboardMetric) => {
    selectedMetric.value = metric;
    fetchLeaderboard();
};

const closeModal = () => {
    emit('close');
};

const getFullName = (student: { firstName: string; lastName: string }) => {
    return `${student.firstName} ${student.lastName}`;
};

const formatScore = (score: number) => {
    return score.toLocaleString('vi-VN');
};

// Watch for modal open/close
watch(() => props.isOpen, (newValue) => {
    if (newValue) {
        fetchLeaderboard();
    }
});

// Watch for timeframe changes
watch(selectedTimeframe, () => {
    fetchLeaderboard();
});
</script>

<style scoped>
select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
}
</style>
