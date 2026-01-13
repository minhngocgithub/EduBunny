<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-200">
      <slot name="header"></slot>
    </div>
    
    <div :class="bodyClasses">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  padding?: boolean;
  shadow?: boolean;
  hover?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  padding: true,
  shadow: true,
  hover: false,
});

const cardClasses = computed(() => {
  const baseClasses = 'bg-white rounded-lg overflow-hidden';
  const shadowClasses = props.shadow ? 'shadow-md' : '';
  const hoverClasses = props.hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  
  return [baseClasses, shadowClasses, hoverClasses].filter(Boolean).join(' ');
});

const bodyClasses = computed(() => {
  return props.padding ? 'p-6' : '';
});
</script>
