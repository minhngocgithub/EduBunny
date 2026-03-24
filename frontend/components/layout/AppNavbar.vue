<template>
    <nav class="fixed top-0 z-50 w-full px-6 border-b glass-effect border-white/20 dark:border-white/5">
        <div class="flex items-center justify-between h-20 mx-auto max-w-7xl">
            <!-- Logo -->
            <NuxtLink to="/" class="flex items-center gap-3">
                <div
                    class="flex items-center justify-center text-white transition-transform shadow-xl size-12 bg-primary rounded-2xl shadow-primary/20 rotate-3 hover:rotate-0">
                    <span class="text-2xl font-bold material-symbols-outlined">school</span>
                </div>
                <span
                    class="font-display text-2xl font-bold text-[#2C3E50] dark:text-white tracking-tight">EduBunny</span>
            </NuxtLink>

            <!-- Desktop Navigation Links -->
            <div class="items-center hidden gap-10 lg:flex">
                <NuxtLink v-for="link in navLinks" :key="link.path" :to="link.path"
                    class="relative font-bold text-gray-600 transition-all dark:text-slate-400 hover:text-primary dark:hover:text-primary group">
                    {{ link.name }}
                    <span
                        class="absolute left-0 w-0 h-1 transition-all duration-300 rounded-full -bottom-1 bg-primary group-hover:w-full"></span>
                </NuxtLink>
            </div>

            <!-- Right Side Actions -->
            <div class="flex items-center gap-4">
                <!-- Theme Toggle -->
                <ClientOnly>
                    <button @click="toggleTheme"
                        class="flex items-center justify-center transition-transform size-10 rounded-xl bg-white/50 dark:bg-slate-800 hover:scale-110"
                        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
                        <span class="text-xl material-symbols-outlined">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
                    </button>
                    <template #fallback>
                        <button
                            class="flex items-center justify-center transition-transform size-10 rounded-xl bg-white/50 dark:bg-slate-800 hover:scale-110"
                            aria-label="Toggle theme">
                            <span class="text-xl material-symbols-outlined">dark_mode</span>
                        </button>
                    </template>
                </ClientOnly>

                <!-- Authenticated User Actions -->
                <template v-if="isAuthenticated">
                    <!-- Notifications -->
                    <button
                        class="relative flex items-center justify-center transition-all border border-gray-100 rounded-2xl size-10 bg-white/50 dark:bg-slate-800 dark:border-slate-700 hover:scale-110">
                        <span
                            class="text-xl text-gray-600 material-symbols-outlined dark:text-slate-400">notifications</span>
                        <span v-if="hasNotifications"
                            class="absolute border-2 border-white rounded-full top-1 right-1 size-2.5 bg-primary dark:border-slate-800"></span>
                    </button>

                    <!-- Leaderboard -->
                    <button v-if="isStudent" @click="showLeaderboard = true"
                        class="relative flex items-center justify-center transition-all border border-yellow-200 rounded-2xl size-10 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 dark:border-yellow-700 hover:scale-110 hover:shadow-lg hover:shadow-yellow-200 dark:hover:shadow-yellow-900/20">
                        <span
                            class="text-xl text-yellow-600 material-symbols-outlined dark:text-yellow-400">emoji_events</span>
                    </button>

                    <!-- User Avatar & Dropdown -->
                    <div class="relative" ref="dropdownRef">
                        <button @click="toggleDropdown"
                            class="flex items-center gap-3 p-1.5 pr-4 transition-all rounded-2xl bg-white/50 dark:bg-slate-800 hover:shadow-lg border border-gray-100 dark:border-slate-700">
                            <CommonAppAvatar :avatar-seed="userStore.studentProfile?.avatarSeed"
                                :avatar-url="userStore.studentProfile?.avatar" :user-name="userName" size="sm"
                                rounded="xl" :ring="true" />
                            <span class="hidden font-bold text-gray-700 sm:block dark:text-slate-300">{{ userName
                            }}</span>
                            <span class="text-gray-400 material-symbols-outlined"
                                :class="{ 'rotate-180': showDropdown }">
                                expand_more
                            </span>
                        </button>

                        <!-- Dropdown Menu -->
                        <Transition enter-active-class="transition duration-200 ease-out"
                            enter-from-class="scale-95 opacity-0" enter-to-class="scale-100 opacity-100"
                            leave-active-class="transition duration-150 ease-in"
                            leave-from-class="scale-100 opacity-100" leave-to-class="scale-95 opacity-0">
                            <div v-if="showDropdown"
                                class="absolute right-0 mt-3 overflow-hidden border border-gray-100 shadow-xl w-72 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl dark:border-slate-800">
                                <!-- User Info -->
                                <div class="p-6 border-b border-gray-100 dark:border-slate-800">
                                    <div class="flex items-center gap-4">
                                        <CommonAppAvatar :avatar-seed="userStore.studentProfile?.avatarSeed"
                                            :avatar-url="userStore.studentProfile?.avatar" :user-name="userName"
                                            size="lg" rounded="xl" :ring="true" />
                                        <div class="flex-1">
                                            <p class="font-bold text-gray-800 font-display dark:text-white">{{ userName
                                            }}</p>
                                            <p class="text-sm text-gray-500 dark:text-slate-400">{{ userEmail }}</p>
                                            <div v-if="isStudent" class="flex items-center gap-2 mt-2">
                                                <div
                                                    class="px-3 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary">
                                                    Level {{ studentLevel }}
                                                </div>
                                                <div class="flex items-center gap-1 text-xs font-bold text-yellow-600">
                                                    <span>⭐</span>
                                                    <span>{{ studentStars }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Menu Items -->
                                <div class="p-3">
                                    <NuxtLink v-for="item in dropdownItems" :key="item.path" :to="item.path"
                                        @click="closeDropdown"
                                        class="flex items-center gap-4 px-4 py-3 text-gray-700 transition-all rounded-2xl hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-800 group">
                                        <span
                                            class="text-2xl transition-transform material-symbols-outlined group-hover:scale-110"
                                            :class="item.iconClass">
                                            {{ item.icon }}
                                        </span>
                                        <div class="flex-1">
                                            <p class="font-bold">{{ item.name }}</p>
                                            <p class="text-xs text-gray-500 dark:text-slate-400">{{ item.description }}
                                            </p>
                                        </div>
                                    </NuxtLink>

                                    <!-- Logout -->
                                    <button @click="handleLogout"
                                        class="flex items-center w-full gap-4 px-4 py-3 mt-2 text-red-600 transition-all border-t border-gray-100 rounded-2xl hover:bg-red-50 dark:border-slate-800 dark:hover:bg-red-900/10 group">
                                        <span
                                            class="text-2xl transition-transform material-symbols-outlined group-hover:scale-110">
                                            logout
                                        </span>
                                        <div class="text-left">
                                            <p class="font-bold">Đăng xuất</p>
                                            <p class="text-xs text-red-500/70">Hẹn gặp lại bạn sau</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </Transition>
                    </div>
                </template>

                <!-- Guest Actions -->
                <template v-else>
                    <NuxtLink to="/auth"
                        class="hidden px-6 py-3 font-bold text-gray-600 transition-all sm:block rounded-2xl dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800">
                        Đăng nhập
                    </NuxtLink>
                    <NuxtLink to="/auth"
                        class="px-8 py-3 font-bold text-white transition-all shadow-2xl bg-primary rounded-2xl shadow-primary/30 hover:scale-105 active:scale-95">
                        Tham gia ngay
                    </NuxtLink>
                </template>

                <!-- Mobile Menu Button -->
                <button @click="toggleMobileMenu"
                    class="flex items-center justify-center lg:hidden size-10 rounded-xl bg-white/50 dark:bg-slate-800">
                    <span class="text-xl material-symbols-outlined">menu</span>
                </button>
            </div>
        </div>

        <!-- Mobile Menu -->
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="-translate-y-4 opacity-0"
            enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100" leave-to-class="-translate-y-4 opacity-0">
            <div v-if="showMobileMenu"
                class="absolute left-0 right-0 p-6 mx-6 mt-4 border border-gray-100 shadow-xl lg:hidden top-full rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl dark:border-slate-800">
                <div class="space-y-2">
                    <NuxtLink v-for="link in navLinks" :key="link.path" :to="link.path" @click="closeMobileMenu"
                        class="block px-4 py-3 font-bold text-gray-700 transition-all rounded-2xl hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-800">
                        {{ link.name }}
                    </NuxtLink>

                    <template v-if="!isAuthenticated">
                        <NuxtLink to="/auth" @click="closeMobileMenu"
                            class="block px-4 py-3 font-bold text-center text-gray-700 transition-all rounded-2xl hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-800">
                            Đăng nhập
                        </NuxtLink>
                    </template>
                </div>
            </div>
        </Transition>
    </nav>

    <!-- Leaderboard Modal -->
    <LayoutLeaderboardModal :isOpen="showLeaderboard" @close="showLeaderboard = false" />
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const userStore = useUserStore();
const themeStore = useThemeStore();
const router = useRouter();
const { showToast } = useToast();

const showDropdown = ref(false);
const showMobileMenu = ref(false);
const showLeaderboard = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// Computed
const isAuthenticated = computed(() => authStore.isLoggedIn);
const isDark = computed(() => themeStore.isDark);
const hasNotifications = computed(() => true); // TODO: Implement notification system

const userName = computed(() => {
    if (userStore.studentProfile) {
        return `${userStore.studentProfile.firstName} ${userStore.studentProfile.lastName}`;
    }
    if (userStore.profile?.email) {
        return userStore.profile.email.split('@')[0];
    }
    return 'User';
});

const userEmail = computed(() => userStore.profile?.email || '');
const isStudent = computed(() => userStore.isStudent);
const studentLevel = computed(() => userStore.studentProfile?.level || 1);
const studentStars = computed(() => userStore.studentProfile?.stars || 0);
const studentCoins = computed(() => userStore.studentProfile?.coins || 0);
const studentXP = computed(() => userStore.studentProfile?.xp || 0);
const studentStreak = computed(() => userStore.studentProfile?.streak || 0);

// Navigation Links
const navLinks = computed(() => {
    if (isAuthenticated.value) {
        return [
            { name: 'Dashboard', path: '/dashboard' },
            { name: 'Khóa học', path: '/courses' },
            { name: 'Trò chơi', path: '/games' },
            { name: 'Thỏ Ngọc AI', path: '/chatbot' },
        ];
    }
    return [
        { name: 'Khóa học', path: '/#courses' },
        { name: 'Thỏ Ngọc AI', path: '/#ai' },
        { name: 'Phụ huynh', path: '/#parents' },
        { name: 'Giáo viên', path: '/#teachers' },
    ];
});

// Dropdown Menu Items
const dropdownItems = [
    {
        name: 'Hồ sơ của tôi',
        description: 'Xem và chỉnh sửa thông tin',
        path: '/profile',
        icon: 'person',
        iconClass: 'text-blue-500'
    },
    {
        name: 'Bảng điểm',
        description: 'Xem kết quả học tập',
        path: '/dashboard',
        icon: 'analytics',
        iconClass: 'text-green-500'
    },
    {
        name: 'Thành tích',
        description: 'Huy hiệu và chứng chỉ',
        path: '/profile#achievements',
        icon: 'military_tech',
        iconClass: 'text-yellow-500'
    },
    {
        name: 'Cài đặt',
        description: 'Tùy chỉnh tài khoản',
        path: '/profile#settings',
        icon: 'settings',
        iconClass: 'text-gray-500'
    },
];

// Methods
const toggleTheme = () => {
    themeStore.toggleTheme();
};

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
    showDropdown.value = false;
};

const toggleMobileMenu = () => {
    showMobileMenu.value = !showMobileMenu.value;
};

const closeMobileMenu = () => {
    showMobileMenu.value = false;
};

const handleLogout = async () => {
    closeDropdown();
    await authStore.logout();

    showToast({
        type: 'success',
        message: 'Đăng xuất thành công!'
    });
};

// Click outside to close dropdown
onMounted(() => {
    document.addEventListener('click', (e) => {
        if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
            closeDropdown();
        }
    });
});

onUnmounted(() => {
    document.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
.glass-effect {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.dark .glass-effect {
    background: rgba(15, 23, 42, 0.8);
}
</style>
