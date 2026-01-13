<template>
    <div :class="['relative inline-block', sizeClasses]">
        <!-- Avatar Image -->
        <img :src="computedAvatarUrl" :alt="userName || 'User avatar'" :class="[
            'object-cover',
            roundedClass,
            sizeClasses,
            ringClass,
            { 'cursor-pointer hover:scale-105 transition-transform': clickable }
        ]" @error="handleImageError" @click="handleClick" />

        <!-- Crown Overlay for Top 3 -->
        <div v-if="showCrown && rank && rank <= 3" :class="[
            'absolute -top-1 -right-1 flex items-center justify-center',
            crownSizeClass,
            'animate-bounce'
        ]">
            <span :class="['text-2xl', crownColorClass]">👑</span>
        </div>

        <!-- Badge/Indicator (Optional) -->
        <div v-if="showBadge" :class="[
            'absolute bottom-0 right-0',
            'flex items-center justify-center',
            'rounded-full border-2 border-white dark:border-slate-800',
            badgeSizeClass,
            badgeColorClass
        ]">
            <span v-if="badgeIcon" class="material-symbols-outlined text-xs">{{ badgeIcon }}</span>
            <span v-else-if="badgeText" class="text-xs font-bold">{{ badgeText }}</span>
        </div>

        <!-- Loading State -->
        <div v-if="loading" :class="[
            'absolute inset-0 flex items-center justify-center',
            'bg-gray-100 dark:bg-slate-800',
            roundedClass
        ]">
            <div class="w-1/2 h-1/2 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getAvatarUrl, type AvatarStyle } from '~/utils/dicebear';

interface Props {
    // Avatar data
    avatarSeed?: string | null;
    avatarUrl?: string | null;
    userName?: string;
    style?: AvatarStyle;

    // Size variants
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

    // Styling
    rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    ring?: boolean;
    ringColor?: string;

    // Top 3 crown feature
    showCrown?: boolean;
    rank?: number; // 1, 2, or 3

    // Badge feature
    showBadge?: boolean;
    badgeIcon?: string; // Material icon name
    badgeText?: string;
    badgeColor?: 'primary' | 'success' | 'warning' | 'error';

    // Interaction
    clickable?: boolean;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    rounded: 'xl',
    ring: false,
    ringColor: 'white',
    showCrown: false,
    showBadge: false,
    clickable: false,
    loading: false,
    style: 'adventurer',
});

const emit = defineEmits<{
    click: [];
    error: [];
}>();

// Computed avatar URL with priority logic
const computedAvatarUrl = computed(() => {
    return getAvatarUrl({
        avatarSeed: props.avatarSeed,
        avatarUrl: props.avatarUrl,
        userName: props.userName,
        style: props.style,
    });
});

// Size classes
const sizeClasses = computed(() => {
    const sizes = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
        xl: 'w-20 h-20',
        '2xl': 'w-32 h-32',
    };
    return sizes[props.size];
});

// Rounded classes
const roundedClass = computed(() => {
    const rounded = {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
    };
    return rounded[props.rounded];
});

// Ring classes
const ringClass = computed(() => {
    if (!props.ring) return '';
    return `ring-2 ring-${props.ringColor} dark:ring-slate-700`;
});

// Crown size based on avatar size
const crownSizeClass = computed(() => {
    const sizes = {
        xs: 'w-4 h-4',
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-10 h-10',
        '2xl': 'w-12 h-12',
    };
    return sizes[props.size];
});

// Crown color based on rank
const crownColorClass = computed(() => {
    if (!props.rank) return '';

    switch (props.rank) {
        case 1:
            return 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'; // Gold
        case 2:
            return 'drop-shadow-[0_0_8px_rgba(209,213,219,0.8)]'; // Silver
        case 3:
            return 'drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]'; // Bronze
        default:
            return '';
    }
});

// Badge size
const badgeSizeClass = computed(() => {
    const sizes = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
        '2xl': 'w-10 h-10',
    };
    return sizes[props.size];
});

// Badge color
const badgeColorClass = computed(() => {
    const colors = {
        primary: 'bg-primary text-white',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
        error: 'bg-red-500 text-white',
    };
    return props.badgeColor ? colors[props.badgeColor] : 'bg-primary text-white';
});

// Handle image load error
const handleImageError = () => {
    emit('error');
};

// Handle click
const handleClick = () => {
    if (props.clickable) {
        emit('click');
    }
};
</script>

<style scoped>
/* Additional animations for crown */
@keyframes bounce-slow {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10%);
    }
}

.animate-bounce {
    animation: bounce-slow 2s infinite;
}
</style>
