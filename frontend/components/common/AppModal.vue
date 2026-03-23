<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="modelValue"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="handleClose">
          <Transition enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="scale-90 translate-y-4 opacity-0" enter-to-class="scale-100 translate-y-0 opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="scale-100 translate-y-0 opacity-100" leave-to-class="scale-95 translate-y-4 opacity-0">
            <div v-if="modelValue" :class="modalClasses" @click.stop>
              <!-- Close Button -->
              <button v-if="closable" type="button"
                class="absolute z-10 flex items-center justify-center transition-all top-6 right-6 size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 group"
                @click="handleClose">
                <span
                  class="text-2xl transition-transform duration-300 material-symbols-outlined group-hover:rotate-90">close</span>
              </button>

              <!-- Header -->
              <div v-if="$slots.header || title" class="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                <slot name="header">
                  <h3 class="text-2xl font-bold text-slate-800 dark:text-white">{{ title }}</h3>
                </slot>
              </div>

              <!-- Body -->
              <div class="px-8 py-6">
                <slot></slot>
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer"
                class="px-8 py-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <slot name="footer"></slot>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  closeOnClickOutside?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnClickOutside: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const handleClose = () => {
  if (props.closeOnClickOutside && props.closable) {
    emit('update:modelValue', false);
    emit('close');
  }
};

const modalClasses = computed(() => {
  const baseClasses = 'relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700';

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return [baseClasses, sizeClasses[props.size], 'w-full'].join(' ');
});

// Prevent body scroll when modal is open
watch(() => props.modelValue, (isOpen) => {
  if (process.client) {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
});

onUnmounted(() => {
  if (process.client) {
    document.body.style.overflow = '';
  }
});
</script>
