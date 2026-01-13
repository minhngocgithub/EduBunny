<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeModal">
        <div
          class="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          @click.stop>
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-orange-50">
            <h2 class="text-2xl font-bold text-gray-800 font-display">
              {{ activeTab === 'terms' ? 'Điều khoản sử dụng' : 'Chính sách bảo mật' }}
            </h2>
            <button @click="closeModal" class="p-2 transition-colors rounded-full hover:bg-gray-200" aria-label="Đóng">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-gray-200 bg-gray-50">
            <button @click="activeTab = 'terms'" :class="[
              'flex-1 px-6 py-3 font-medium transition-all',
              activeTab === 'terms'
                ? 'text-primary border-b-2 border-primary bg-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]">
              📜 Điều khoản sử dụng
            </button>
            <button @click="activeTab = 'privacy'" :class="[
              'flex-1 px-6 py-3 font-medium transition-all',
              activeTab === 'privacy'
                ? 'text-primary border-b-2 border-primary bg-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]">
              🔒 Chính sách bảo mật
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <!-- Terms of Service -->
            <div v-if="activeTab === 'terms'" class="prose prose-sm max-w-none">
              <div class="mb-6 text-sm text-gray-500">
                <p><strong>Cập nhật lần cuối:</strong> 07/01/2026</p>
              </div>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">1. Giới thiệu</h3>
                <p class="text-gray-700">
                  Chào mừng bạn đến với EduForKids ("Chúng tôi", "Của chúng tôi"). Bằng việc truy cập và sử dụng nền
                  tảng học tập trực tuyến của chúng tôi, bạn đồng ý tuân thủ và chịu sự ràng buộc của các điều khoản và
                  điều kiện sau đây.
                </p>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">2. Đối tượng sử dụng</h3>
                <p class="text-gray-700">Dịch vụ của chúng tôi được thiết kế cho:</p>
                <ul class="mt-2 ml-6 space-y-2 text-gray-700 list-disc">
                  <li><strong>Học sinh:</strong> Trẻ em từ 6-12 tuổi (cấp tiểu học)</li>
                  <li><strong>Phụ huynh:</strong> Người giám hộ hợp pháp của học sinh</li>
                  <li><strong>Giáo viên:</strong> Người hướng dẫn được ủy quyền</li>
                </ul>
                <p class="mt-2 text-gray-700">
                  <strong>Lưu ý:</strong> Học sinh dưới 13 tuổi phải có sự đồng ý và giám sát của phụ huynh/người giám
                  hộ.
                </p>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">3. Tài khoản người dùng</h3>
                <ul class="ml-6 space-y-3 text-gray-700 list-disc">
                  <li>Bạn chịu trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu</li>
                  <li>Mỗi tài khoản chỉ được sử dụng bởi một người duy nhất</li>
                  <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                  <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép</li>
                  <li>Không chia sẻ tài khoản hoặc cho phép người khác sử dụng tài khoản của bạn</li>
                </ul>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">4. Quy tắc sử dụng</h3>
                <p class="mb-2 text-gray-700">Khi sử dụng dịch vụ, bạn đồng ý <strong>KHÔNG</strong>:</p>
                <ul class="ml-6 space-y-2 text-gray-700 list-disc">
                  <li>Vi phạm bất kỳ luật pháp nào của Việt Nam hoặc quốc tế</li>
                  <li>Đăng tải nội dung không phù hợp, bạo lực, phản cảm hoặc phân biệt đối xử</li>
                  <li>Quấy rối, bắt nạt, hoặc đe dọa người dùng khác</li>
                  <li>Sao chép, phân phối hoặc sử dụng nội dung của chúng tôi vì mục đích thương mại</li>
                  <li>Can thiệp hoặc phá hoại hệ thống bảo mật của nền tảng</li>
                  <li>Sử dụng bot, script hoặc công cụ tự động không được phép</li>
                </ul>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">5. Quyền sở hữu trí tuệ</h3>
                <p class="text-gray-700">
                  Tất cả nội dung trên nền tảng (bài học, hình ảnh, video, âm thanh, thiết kế, logo, mã nguồn) đều thuộc
                  quyền sở hữu của EduForKids hoặc các bên cấp phép của chúng tôi và được bảo vệ bởi luật bản quyền Việt
                  Nam và quốc tế.
                </p>
                <p class="mt-2 text-gray-700">
                  <strong>Giấy phép sử dụng:</strong> Chúng tôi cấp cho bạn quyền sử dụng cá nhân, không độc quyền,
                  không thể chuyển nhượng để truy cập và sử dụng nền tảng cho mục đích học tập.
                </p>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">6. Thanh toán và hoàn tiền</h3>
                <ul class="ml-6 space-y-2 text-gray-700 list-disc">
                  <li>Giá cước được hiển thị rõ ràng trước khi thanh toán</li>
                  <li>Thanh toán được xử lý qua cổng thanh toán bảo mật</li>
                  <li>Hoàn tiền có thể được xem xét trong vòng 7 ngày nếu có lỗi từ hệ thống</li>
                  <li>Gói học đã kích hoạt và sử dụng sẽ không được hoàn tiền</li>
                </ul>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">7. Giới hạn trách nhiệm</h3>
                <p class="text-gray-700">
                  EduForKids cung cấp nền tảng "như hiện tại" và không đảm bảo dịch vụ sẽ hoàn toàn không có lỗi hoặc
                  không bị gián đoạn. Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu
                  nhiên hoặc hậu quả phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.
                </p>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">8. Chấm dứt tài khoản</h3>
                <p class="text-gray-700">
                  Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn ngay lập tức nếu bạn vi phạm các điều
                  khoản này, mà không cần thông báo trước và không hoàn lại bất kỳ khoản phí nào.
                </p>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">9. Thay đổi điều khoản</h3>
                <p class="text-gray-700">
                  Chúng tôi có quyền cập nhật và thay đổi điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực
                  ngay khi được đăng tải trên nền tảng. Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa
                  với việc bạn chấp nhận các điều khoản mới.
                </p>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">10. Liên hệ</h3>
                <p class="text-gray-700">
                  Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng, vui lòng liên hệ:
                </p>
                <div class="p-4 mt-3 rounded-lg bg-gray-50">
                  <p class="text-gray-700"><strong>Email:</strong> support@eduforkids.vn</p>
                  <p class="text-gray-700"><strong>Hotline:</strong> 1900-xxxx</p>
                  <p class="text-gray-700"><strong>Địa chỉ:</strong> Hà Nội, Việt Nam</p>
                </div>
              </section>
            </div>

            <!-- Privacy Policy -->
            <div v-if="activeTab === 'privacy'" class="prose prose-sm max-w-none">
              <div class="mb-6 text-sm text-gray-500">
                <p><strong>Cập nhật lần cuối:</strong> 07/01/2026</p>
              </div>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">1. Cam kết bảo mật</h3>
                <p class="text-gray-700">
                  EduForKids cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. Chính sách này giải thích cách
                  chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu của bạn theo Luật An toàn thông tin mạng của
                  Việt Nam và các quy định quốc tế về bảo vệ dữ liệu.
                </p>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">2. Thông tin chúng tôi thu thập</h3>

                <h4 class="mt-4 font-semibold text-gray-800">2.1. Thông tin cá nhân</h4>
                <ul class="ml-6 space-y-2 text-gray-700 list-disc">
                  <li>Họ và tên</li>
                  <li>Địa chỉ email</li>
                  <li>Ngày sinh (đối với học sinh)</li>
                  <li>Lớp học/Khối học</li>
                  <li>Thông tin phụ huynh (nếu học sinh dưới 13 tuổi)</li>
                </ul>

                <h4 class="mt-4 font-semibold text-gray-800">2.2. Thông tin học tập</h4>
                <ul class="ml-6 space-y-2 text-gray-700 list-disc">
                  <li>Tiến độ học tập và kết quả bài kiểm tra</li>
                  <li>Thời gian học và tần suất truy cập</li>
                  <li>Điểm số và thành tích đạt được</li>
                  <li>Các bài tập và câu trả lời</li>
                </ul>

                <h4 class="mt-4 font-semibold text-gray-800">2.3. Thông tin kỹ thuật</h4>
                <ul class="ml-6 space-y-2 text-gray-700 list-disc">
                  <li>Địa chỉ IP và loại thiết bị</li>
                  <li>Trình duyệt và hệ điều hành</li>
                  <li>Cookies và dữ liệu phiên làm việc</li>
                  <li>Nhật ký hoạt động trên nền tảng</li>
                </ul>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">3. Cách chúng tôi sử dụng thông tin</h3>
                <ul class="ml-6 space-y-2 text-gray-700 list-disc">
                  <li><strong>Cung cấp dịch vụ:</strong> Tạo và quản lý tài khoản, cá nhân hóa trải nghiệm học tập</li>
                  <li><strong>Cải thiện chất lượng:</strong> Phân tích dữ liệu để nâng cao nội dung và tính năng</li>
                  <li><strong>Liên lạc:</strong> Gửi thông báo về tiến độ học tập, cập nhật khóa học mới</li>
                  <li><strong>Bảo mật:</strong> Phát hiện và ngăn chặn gian lận, lạm dụng</li>
                  <li><strong>Tuân thủ pháp luật:</strong> Đáp ứng các yêu cầu pháp lý khi cần thiết</li>
                </ul>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">4. Chia sẻ thông tin</h3>
                <p class="mb-3 text-gray-700">Chúng tôi <strong>KHÔNG</strong> bán hoặc cho thuê thông tin cá nhân của
                  bạn. Thông tin chỉ được chia sẻ trong các trường hợp sau:</p>
                <ul class="ml-6 space-y-2 text-gray-700 list-disc">
                  <li><strong>Với phụ huynh:</strong> Tiến độ và kết quả học tập của con em họ</li>
                  <li><strong>Nhà cung cấp dịch vụ:</strong> Các đối tác hỗ trợ vận hành nền tảng (hosting, thanh toán)
                    với thỏa thuận bảo mật nghiêm ngặt</li>
                  <li><strong>Yêu cầu pháp lý:</strong> Khi được yêu cầu bởi cơ quan chức năng theo quy định pháp luật
                  </li>
                  <li><strong>Bảo vệ quyền lợi:</strong> Để bảo vệ quyền lợi, tài sản và an toàn của EduForKids và người
                    dùng</li>
                </ul>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">5. Bảo mật dữ liệu</h3>
                <p class="mb-3 text-gray-700">Chúng tôi áp dụng các biện pháp bảo mật tiên tiến:</p>
                <ul class="ml-6 space-y-2 text-gray-700 list-disc">
                  <li><strong>Mã hóa:</strong> SSL/TLS cho tất cả dữ liệu truyền tải</li>
                  <li><strong>Mã hóa mật khẩu:</strong> Sử dụng bcrypt với salt</li>
                  <li><strong>Tường lửa:</strong> Hệ thống tường lửa và giám sát 24/7</li>
                  <li><strong>Sao lưu:</strong> Sao lưu dữ liệu định kỳ và lưu trữ an toàn</li>
                  <li><strong>Kiểm tra bảo mật:</strong> Đánh giá và cập nhật bảo mật thường xuyên</li>
                  <li><strong>Đào tạo:</strong> Nhân viên được đào tạo về bảo mật thông tin</li>
                </ul>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">6. Quyền của bạn</h3>
                <p class="mb-3 text-gray-700">Bạn có các quyền sau đối với dữ liệu cá nhân:</p>
                <ul class="ml-6 space-y-2 text-gray-700 list-disc">
                  <li><strong>Truy cập:</strong> Yêu cầu xem thông tin chúng tôi lưu trữ về bạn</li>
                  <li><strong>Chỉnh sửa:</strong> Cập nhật hoặc sửa đổi thông tin không chính xác</li>
                  <li><strong>Xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu cá nhân</li>
                  <li><strong>Xuất dữ liệu:</strong> Nhận bản sao dữ liệu của bạn ở định dạng có cấu trúc</li>
                  <li><strong>Từ chối:</strong> Từ chối nhận email marketing (vẫn nhận email quan trọng về tài khoản)
                  </li>
                  <li><strong>Khiếu nại:</strong> Liên hệ cơ quan quản lý nếu có vi phạm quyền riêng tư</li>
                </ul>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">7. Cookies và công nghệ theo dõi</h3>
                <p class="text-gray-700">Chúng tôi sử dụng cookies và công nghệ tương tự để:</p>
                <ul class="ml-6 space-y-2 text-gray-700 list-disc">
                  <li>Ghi nhớ tùy chọn và cài đặt của bạn</li>
                  <li>Duy trì phiên đăng nhập an toàn</li>
                  <li>Phân tích cách sử dụng nền tảng</li>
                  <li>Cải thiện hiệu suất và trải nghiệm người dùng</li>
                </ul>
                <p class="mt-3 text-gray-700">
                  Bạn có thể quản lý cookies qua cài đặt trình duyệt, nhưng việc vô hiệu hóa có thể ảnh hưởng đến chức
                  năng của nền tảng.
                </p>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">8. Bảo vệ trẻ em</h3>
                <p class="text-gray-700">
                  Chúng tôi đặc biệt quan tâm đến quyền riêng tư của trẻ em. Đối với học sinh dưới 13 tuổi:
                </p>
                <ul class="ml-6 space-y-2 text-gray-700 list-disc">
                  <li>Phụ huynh/người giám hộ phải đồng ý trước khi tạo tài khoản</li>
                  <li>Chỉ thu thập thông tin tối thiểu cần thiết cho mục đích học tập</li>
                  <li>Phụ huynh có quyền xem, chỉnh sửa hoặc xóa thông tin của con em</li>
                  <li>Không hiển thị quảng cáo đối với trẻ em</li>
                  <li>Không chia sẻ thông tin trẻ em với bên thứ ba</li>
                </ul>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">9. Lưu trữ dữ liệu</h3>
                <p class="text-gray-700">
                  Chúng tôi lưu trữ dữ liệu của bạn trong thời gian cần thiết để cung cấp dịch vụ hoặc theo yêu cầu pháp
                  luật. Khi bạn xóa tài khoản, dữ liệu sẽ được xóa vĩnh viễn trong vòng 30 ngày, trừ các thông tin bắt
                  buộc lưu trữ theo quy định pháp luật.
                </p>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">10. Thay đổi chính sách</h3>
                <p class="text-gray-700">
                  Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Các thay đổi quan trọng sẽ được thông
                  báo qua email hoặc thông báo nổi bật trên nền tảng. Ngày "Cập nhật lần cuối" ở đầu chính sách sẽ phản
                  ánh lần sửa đổi gần nhất.
                </p>
              </section>

              <section class="mb-8">
                <h3 class="text-lg font-bold text-gray-800">11. Liên hệ về quyền riêng tư</h3>
                <p class="text-gray-700">
                  Nếu bạn có câu hỏi hoặc yêu cầu về quyền riêng tư và dữ liệu cá nhân:
                </p>
                <div class="p-4 mt-3 rounded-lg bg-gray-50">
                  <p class="text-gray-700"><strong>Bộ phận Bảo vệ Dữ liệu:</strong></p>
                  <p class="text-gray-700"><strong>Email:</strong> privacy@eduforkids.vn</p>
                  <p class="text-gray-700"><strong>Hotline:</strong> 1900-xxxx</p>
                  <p class="text-gray-700"><strong>Thời gian phản hồi:</strong> Trong vòng 15 ngày làm việc</p>
                </div>
              </section>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button @click="closeModal"
              class="px-6 py-2 font-medium text-gray-700 transition-colors bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100">
              Đóng
            </button>
            <button v-if="showAcceptButton" @click="acceptAndClose"
              class="px-6 py-2 font-bold text-white transition-all rounded-xl bg-primary hover:scale-105">
              Tôi đã hiểu
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  showAcceptButton?: boolean;
  defaultTab?: 'terms' | 'privacy';
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  showAcceptButton: false,
  defaultTab: 'terms',
});

const emit = defineEmits<{
  close: [];
  accept: [];
}>();

const activeTab = ref<'terms' | 'privacy'>(props.defaultTab);

// Reset tab when modal opens
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    activeTab.value = props.defaultTab;
  }
});

const closeModal = () => {
  emit('close');
};

const acceptAndClose = () => {
  emit('accept');
  emit('close');
};

// Close on Escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      closeModal();
    }
  };
  window.addEventListener('keydown', handleEscape);

  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape);
  });
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.prose {
  color: #374151;
}

.prose h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose p {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  line-height: 1.7;
}

.prose ul {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.prose li {
  line-height: 1.6;
}
</style>
