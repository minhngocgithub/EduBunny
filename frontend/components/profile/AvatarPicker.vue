<template>
    <Teleport to="body">
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isOpen" @click.self="close"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div
                    class="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-2xl dark:bg-slate-900 dark:border-slate-700 rounded-3xl">
                    <!-- Header -->
                    <div
                        class="sticky top-0 z-10 p-6 border-b border-gray-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm dark:border-slate-700">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-2xl font-bold text-gray-900 dark:text-white font-display">
                                    🎨 Chọn Avatar
                                </h3>
                                <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                    Chọn phong cách và avatar yêu thích của bạn
                                </p>
                            </div>
                            <button @click="close"
                                class="flex items-center justify-center transition-colors rounded-xl size-10 hover:bg-gray-100 dark:hover:bg-slate-800">
                                <span class="text-2xl material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <!-- Style Selector -->
                        <div class="mt-4">
                            <label class="block mb-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
                                Phong cách Avatar
                            </label>
                            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                <button v-for="style in AVATAR_STYLES.slice(0, 8)" :key="style.value"
                                    @click="selectedStyle = style.value" :class="[
                                        'p-3 text-left rounded-xl border-2 transition-all',
                                        selectedStyle === style.value
                                            ? 'border-primary bg-primary/10 dark:bg-primary/20'
                                            : 'border-gray-200 dark:border-slate-700 hover:border-primary/50'
                                    ]">
                                    <p class="text-sm font-bold text-gray-900 dark:text-white">{{ style.label }}</p>
                                    <p class="text-xs text-gray-500 dark:text-slate-400">{{ style.description }}</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Preview (Selected Avatar) -->
                    <div v-if="selectedSeed"
                        class="p-6 border-b border-gray-200 bg-gray-50 dark:bg-slate-800/50 dark:border-slate-700">
                        <div class="flex items-center gap-6">
                            <CommonAppAvatar :avatar-seed="selectedSeed" :style="selectedStyle" size="2xl" rounded="xl"
                                :ring="true" />
                            <div class="flex-1">
                                <p class="text-lg font-bold text-gray-900 dark:text-white">Avatar đã chọn</p>
                                <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                    Phong cách: {{AVATAR_STYLES.find(s => s.value === selectedStyle)?.label}}
                                </p>
                                <div class="flex gap-2 mt-3">
                                    <button @click="randomizeSelected"
                                        class="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600">
                                        🎲 Thay đổi
                                    </button>
                                    <button @click="confirmSelection"
                                        class="px-6 py-2 text-sm font-bold text-white transition-all shadow-lg bg-primary rounded-xl hover:scale-105 shadow-primary/30">
                                        ✓ Xác nhận
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Avatar Grid -->
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <p class="font-semibold text-gray-700 dark:text-slate-300">
                                Chọn từ {{ avatarSeeds.length }} avatar có sẵn
                            </p>
                            <button @click="generateNewAvatars"
                                class="px-4 py-2 text-sm font-bold transition-colors bg-gray-100 rounded-xl text-primary dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700">
                                🔄 Tạo mới
                            </button>
                        </div>

                        <div class="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
                            <button v-for="seed in avatarSeeds" :key="seed" @click="selectedSeed = seed" :class="[
                                'relative group transition-all rounded-xl overflow-hidden',
                                selectedSeed === seed
                                    ? 'ring-4 ring-primary scale-105'
                                    : 'hover:scale-105 hover:ring-2 hover:ring-primary/50'
                            ]">
                                <CommonAppAvatar :avatar-seed="seed" :style="selectedStyle" size="xl" rounded="xl" />
                                <div v-if="selectedSeed === seed"
                                    class="absolute inset-0 flex items-center justify-center bg-primary/20">
                                    <span class="text-2xl">✓</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div
                        class="sticky bottom-0 p-6 border-t border-gray-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm dark:border-slate-700">
                        <div class="flex justify-end gap-3">
                            <button @click="close"
                                class="px-6 py-2.5 font-bold text-gray-700 bg-gray-200 rounded-xl dark:bg-slate-700 dark:text-slate-300 hover:bg-gray-300 transition-colors">
                                Hủy
                            </button>
                            <button @click="confirmSelection" :disabled="!selectedSeed"
                                class="px-8 py-2.5 font-bold text-white bg-primary rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/30">
                                Chọn Avatar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { generateRandomSeeds, AVATAR_STYLES, type AvatarStyle } from '~/utils/dicebear';

interface Props {
    isOpen: boolean;
    currentSeed?: string | null;
    currentStyle?: AvatarStyle;
}

const props = withDefaults(defineProps<Props>(), {
    isOpen: false,
    currentStyle: 'adventurer',
});

const emit = defineEmits<{
    close: [];
    select: [seed: string, style: AvatarStyle];
}>();

// State
const selectedSeed = ref<string>(props.currentSeed || '');
const selectedStyle = ref<AvatarStyle>(props.currentStyle);
const avatarSeeds = ref<string[]>(generateRandomSeeds(24));

// Watch for open state change
watch(() => props.isOpen, (isOpen) => {
    if (isOpen && !selectedSeed.value) {
        selectedSeed.value = avatarSeeds.value[0];
    }
});

// Watch style change - regenerate avatars
watch(selectedStyle, () => {
    // Keep current selection if exists
    if (!avatarSeeds.value.includes(selectedSeed.value)) {
        selectedSeed.value = avatarSeeds.value[0];
    }
});

// Methods
const generateNewAvatars = () => {
    avatarSeeds.value = generateRandomSeeds(24);
    selectedSeed.value = avatarSeeds.value[0];
};

const randomizeSelected = () => {
    const randomIndex = Math.floor(Math.random() * avatarSeeds.value.length);
    selectedSeed.value = avatarSeeds.value[randomIndex];
};

const confirmSelection = () => {
    if (selectedSeed.value) {
        emit('select', selectedSeed.value, selectedStyle.value);
        close();
    }
};

const close = () => {
    emit('close');
};

// Prevent body scroll when modal is open
watch(() => props.isOpen, (isOpen) => {
    if (process.client) {
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }
});

onUnmounted(() => {
    if (process.client) {
        document.body.style.overflow = '';
    }
});
</script>
