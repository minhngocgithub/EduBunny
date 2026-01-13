interface ToastOptions {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export const useToast = () => {
    const show = (options: ToastOptions) => {
        const { message, type = 'info', duration = 3000 } = options;

        // For now, use browser alert - will be replaced with proper toast component
        if (process.client) {
            console.log(`[${type.toUpperCase()}]:`, message);

            // You can implement a proper toast notification here
            // For now, just using console and alert for critical messages
            if (type === 'error') {
                alert(message);
            }
        }
    };

    const success = (message: string, duration?: number) => {
        show({ message, type: 'success', duration });
    };

    const error = (message: string, duration?: number) => {
        show({ message, type: 'error', duration });
    };

    const warning = (message: string, duration?: number) => {
        show({ message, type: 'warning', duration });
    };

    const info = (message: string, duration?: number) => {
        show({ message, type: 'info', duration });
    };

    return {
        show,
        showToast: show,
        success,
        error,
        warning,
        info,
    };
};
