<script setup lang="ts">
definePageMeta({
    middleware: 'auth',
});

useHead({
    title: 'Thỏ Ngọc AI - Chatbot',
    meta: [
        { name: 'description', content: 'Trò chuyện với Thỏ Ngọc AI để được hỗ trợ học tập' },
    ],
});
</script>

<template>
    <div class="min-h-screen pt-20 pb-8 px-4">
        <div class="max-w-4xl mx-auto">
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-primary/10">
                    <span class="text-5xl">🐰</span>
                </div>
                <h1 class="text-3xl font-bold text-gray-800 dark:text-white font-display mb-2">
                    Thỏ Ngọc AI
                </h1>
                <p class="text-gray-600 dark:text-slate-400">
                    Trợ lý học tập thông minh của bạn
                </p>
            </div>

            <!-- Chatbot Interface Placeholder -->
            <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 min-h-[500px] flex items-center justify-center">
                <div class="text-center text-gray-500 dark:text-slate-400">
                    <span class="text-6xl mb-4 block">💬</span>
                    <p class="font-bold">Chatbot interface sẽ được implement sớm</p>
                    <p class="text-sm mt-2">Tính năng đang trong quá trình phát triển</p>
                </div>
            </div>
        </div>
    </div>
</template>
