import { defineStore } from 'pinia';

export type ThemeMode = 'light' | 'dark';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'light' as ThemeMode,
  }),

  getters: {
    isDark: (state) => state.mode === 'dark',
    isLight: (state) => state.mode === 'light',
  },

  actions: {
    setTheme(mode: ThemeMode) {
      this.mode = mode;
      this.applyTheme();
      this.persistTheme();
    },

    toggleTheme() {
      this.mode = this.mode === 'light' ? 'dark' : 'light';
      this.applyTheme();
      this.persistTheme();
    },

    applyTheme() {
      if (import.meta.client) {
        const html = document.documentElement;
        if (this.mode === 'dark') {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      }
    },

    persistTheme() {
      if (import.meta.client) {
        localStorage.setItem('theme', this.mode);
      }
    },

    initTheme() {
      if (import.meta.client) {
        // Check localStorage first
        const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
        if (savedTheme) {
          this.mode = savedTheme;
        } else {
          // Check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          this.mode = prefersDark ? 'dark' : 'light';
        }
        this.applyTheme();

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (!localStorage.getItem('theme')) {
            this.mode = e.matches ? 'dark' : 'light';
            this.applyTheme();
          }
        });
      }
    },
  },
});
