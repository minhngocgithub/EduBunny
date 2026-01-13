// Auto-import plugin for stores and composables
export default defineNuxtPlugin(() => {
    // This plugin ensures all stores and composables are available
    // Nuxt will auto-import them, but this helps with type checking
    return {
        provide: {
            // Add any global utilities here if needed
        },
    };
});
