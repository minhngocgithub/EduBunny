<script setup lang="ts">
definePageMeta({
    middleware: 'auth',
});

const route = useRoute();
const router = useRouter();
const courseId = route.params.id as string;

useHead({
    title: `Khóa học - EduForKids`,
    meta: [
        { name: 'description', content: 'Chi tiết khóa học' },
    ],
});
</script>

<template>
    <div class="min-h-screen pt-20 pb-8 px-4">
        <div class="max-w-6xl mx-auto">
            <!-- Back Button -->
            <button @click="router.back()" 
                class="flex items-center gap-2 mb-6 text-gray-600 dark:text-slate-400 hover:text-primary transition-colors">
                <span class="material-symbols-outlined">arrow_back</span>
                <span>Quay lại</span>
            </button>

            <!-- Course Detail Placeholder -->
            <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
                <div class="text-center">
                    <span class="text-6xl mb-4 block">📚</span>
                    <h1 class="text-3xl font-bold text-gray-800 dark:text-white font-display mb-2">
                        Chi tiết khóa học
                    </h1>
                    <p class="text-gray-600 dark:text-slate-400 mb-4">
                        Course ID: {{ courseId }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-slate-500">
                        Chi tiết khóa học sẽ được implement sớm
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
