<template>
  <div>
    <NuxtLayout>
      <NuxtPage :key="$route.fullPath" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { isLoading } = useLoading();

useHead({
  htmlAttrs: {
    lang: 'vi',
  },
});
</script>
<style scoped>
.font-display {
  font-family: 'Fredoka', sans-serif;
}

.font-body {
  font-family: 'Quicksand', sans-serif;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}
</style>
