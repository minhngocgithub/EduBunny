import { ref, readonly } from 'vue';

const isLoading = ref(false);

export const useLoading = () => {
  const show = () => {
    isLoading.value = true;
  };

  const hide = () => {
    isLoading.value = false;
  };

  const toggle = () => {
    isLoading.value = !isLoading.value;
  };

  return {
    isLoading: readonly(isLoading),
    show,
    hide,
    toggle,
  };
};
