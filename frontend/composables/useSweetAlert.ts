import Swal from 'sweetalert2';

// Custom SweetAlert2 configuration matching EduBunny theme
const customClass = {
  popup: 'rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700',
  title: 'font-display text-2xl font-bold text-gray-800 dark:text-white',
  htmlContainer: 'text-gray-600 dark:text-slate-400 font-medium',
  confirmButton: 'px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg',
  cancelButton: 'px-8 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-2xl hover:scale-105 transition-all',
  denyButton: 'px-8 py-3 bg-red-500 text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg',
};

const defaultConfig = {
  customClass,
  buttonsStyling: false,
  heightAuto: false,
  backdrop: true,
  showClass: {
    popup: 'animate-[scale-in_0.2s_ease-out]',
    backdrop: 'swal2-backdrop-show',
  },
  hideClass: {
    popup: 'animate-[scale-out_0.2s_ease-in]',
    backdrop: 'swal2-backdrop-hide',
  },
};

export const useSweetAlert = () => {
  // Success Alert
  const success = (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'success',
      title,
      text,
      iconColor: '#FF6B6B',
      confirmButtonText: 'Tuyệt vời! 🎉',
    });
  };

  // Error Alert
  const error = (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'error',
      title,
      text,
      iconColor: '#ef4444',
      confirmButtonText: 'Đã hiểu',
    });
  };

  // Warning Alert
  const warning = (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title,
      text,
      iconColor: '#f59e0b',
      confirmButtonText: 'OK',
    });
  };

  // Info Alert
  const info = (title: string, text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'info',
      title,
      text,
      iconColor: '#3b82f6',
      confirmButtonText: 'Đã rõ',
    });
  };

  // Confirm Dialog
  const confirm = (title: string, text?: string, confirmText = 'Xác nhận', cancelText = 'Hủy') => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'question',
      title,
      text,
      iconColor: '#3b82f6',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
    });
  };

  // Delete Confirm (dangerous action)
  const confirmDelete = (title = 'Xóa dữ liệu?', text = 'Hành động này không thể hoàn tác!') => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title,
      text,
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ef4444',
      reverseButtons: true,
    });
  };

  // Loading Toast
  const loading = (title = 'Đang xử lý...') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  // Toast Notification (non-blocking)
  const toast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700',
        title: 'font-bold text-sm',
      },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    return Toast.fire({
      icon,
      title,
      iconColor: icon === 'success' ? '#FF6B6B' : undefined,
    });
  };

  // Achievement Unlocked (Gamification)
  const achievement = (title: string, text: string, icon = '🏆') => {
    return Swal.fire({
      ...defaultConfig,
      title: `${icon} ${title}`,
      text,
      imageUrl: undefined,
      imageWidth: 100,
      imageHeight: 100,
      confirmButtonText: 'Tuyệt vời! 🎉',
      showClass: {
        popup: 'animate-[bounce_0.5s_ease-out]',
      },
      backdrop: `
        rgba(255,107,107,0.1)
        left top
        no-repeat
      `,
    });
  };

  // Level Up (Gamification)
  const levelUp = (level: number) => {
    return Swal.fire({
      ...defaultConfig,
      title: `🎉 LEVEL UP!`,
      html: `
        <div class="space-y-4">
          <div class="text-6xl font-black text-primary font-display">${level}</div>
          <p class="text-lg font-bold text-gray-700 dark:text-slate-300">Chúc mừng bạn đã lên cấp mới!</p>
          <p class="text-sm text-gray-500 dark:text-slate-400">Bạn nhận được phần thưởng đặc biệt 🎁</p>
        </div>
      `,
      confirmButtonText: 'Tuyệt vời! 🚀',
      showClass: {
        popup: 'animate-[bounce_0.5s_ease-out]',
      },
      backdrop: `
        rgba(255,107,107,0.2)
        left top
        no-repeat
      `,
    });
  };

  // Custom HTML Alert
  const custom = (options: any) => {
    return Swal.fire({
      ...defaultConfig,
      ...options,
    });
  };

  // Close current alert
  const close = () => {
    Swal.close();
  };

  return {
    success,
    error,
    warning,
    info,
    confirm,
    confirmDelete,
    loading,
    toast,
    achievement,
    levelUp,
    custom,
    close,
  };
};
