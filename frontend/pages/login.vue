<script setup lang="ts">
// Redirect old /login route to /auth
const route = useRoute();
const router = useRouter();

if (import.meta.client) {
    const redirectPath = route.query.redirect as string || '/dashboard';
    router.replace({
        path: '/auth',
        query: { redirect: redirectPath }
    });
}
</script>

<template>
    <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
            <p class="text-gray-600">Redirecting to login page...</p>
        </div>
    </div>
</template>
