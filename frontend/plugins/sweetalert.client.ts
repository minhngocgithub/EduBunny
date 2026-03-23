// SweetAlert2 Custom Styles for EduBunny Theme
import 'sweetalert2/dist/sweetalert2.min.css';

export default defineNuxtPlugin(() => {
  // Add custom CSS for SweetAlert2 animations
  if (import.meta.client) {
    const style = document.createElement('style');
    style.innerHTML = `
      /* SweetAlert2 Custom Animations */
      @keyframes scale-in {
        from {
          transform: scale(0.7);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes scale-out {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(0.7);
          opacity: 0;
        }
      }

      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
          transform: translateY(0) scale(1);
        }
        40% {
          transform: translateY(-30px) scale(1.1);
        }
        60% {
          transform: translateY(-15px) scale(1.05);
        }
      }

      /* SweetAlert2 Z-Index - Higher than modals */
      .swal2-container {
        z-index: 20000 !important;
      }

      /* SweetAlert2 Dark Mode Support */
      .dark .swal2-popup {
        background: rgba(15, 23, 42, 0.95) !important;
        backdrop-filter: blur(10px);
      }

      .dark .swal2-title {
        color: white !important;
      }

      .dark .swal2-html-container {
        color: rgb(148, 163, 184) !important;
      }

      /* SweetAlert2 Glass Effect */
      .swal2-popup {
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      /* Remove default button styling */
      .swal2-styled:focus {
        box-shadow: none !important;
      }

      /* Toast positioning fix */
      .swal2-toast {
        padding: 1rem !important;
      }

      /* Icon animation */
      .swal2-icon {
        animation: icon-pulse 0.5s ease-out;
      }

      @keyframes icon-pulse {
        0% {
          transform: scale(0);
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }
});
