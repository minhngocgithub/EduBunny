<template>
  <div class="min-h-screen transition-colors duration-300 bg-background dark:bg-slate-950">
    <!-- Navigation -->
    <LayoutAppNavbar />

    <div class="container px-4 py-8 mx-auto pt-24">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mb-4 text-6xl animate-bounce">🐰</div>
          <p class="font-bold text-gray-600 dark:text-slate-400">Đang tải...</p>
        </div>
      </div>

      <div v-else class="max-w-5xl mx-auto space-y-6">
        <!-- Page Header -->
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white font-display">
            👤 Hồ sơ của tôi
          </h1>
          <button @click="isEditing = !isEditing" :class="[
            'px-6 py-2.5 font-bold rounded-2xl transition-all',
            isEditing
              ? 'bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-gray-300'
              : 'bg-primary text-white hover:scale-105 shadow-lg shadow-primary/30'
          ]">
            {{ isEditing ? 'Hủy' : 'Chỉnh sửa' }}
          </button>
        </div>

        <!-- Profile Card -->
        <div class="p-8 bg-white border border-white shadow-xl dark:bg-slate-900 dark:border-white/5 rounded-3xl">
          <!-- Avatar & Basic Info -->
          <div class="flex flex-col md:flex-row md:items-center gap-6 pb-6 mb-6 border-b dark:border-slate-700">
            <div class="relative flex-shrink-0">
              <CommonAppAvatar :avatar-seed="editForm.avatarSeed || userStore.studentProfile?.avatarSeed"
                :avatar-url="editForm.avatar || userAvatar" :user-name="userName" size="2xl" rounded="full"
                :ring="isEditing" ring-color="primary" :clickable="isEditing"
                @click="isEditing && (showAvatarPicker = true)" />
              <button v-if="isEditing" @click="showAvatarPicker = true"
                class="absolute bottom-0 right-0 flex items-center justify-center text-white transition-all rounded-full shadow-lg size-10 bg-primary hover:scale-110">
                <span class="text-xl material-symbols-outlined">edit</span>
              </button>
            </div>

            <div class="flex-1">
              <div v-if="!isEditing">
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white font-display mb-2">
                  {{ userName }}
                </h2>
                <p class="text-gray-600 dark:text-slate-400 mb-4">{{ userEmail }}</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    class="px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                    Level {{ studentLevel }}
                  </span>
                  <span
                    class="px-3 py-1 text-sm font-semibold text-purple-800 bg-purple-100 rounded-full dark:bg-purple-900/30 dark:text-purple-300">
                    {{ userRole }}
                  </span>
                  <span v-if="userStore.studentProfile?.grade"
                    class="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-300">
                    {{ formatGrade(userStore.studentProfile.grade) }}
                  </span>
                </div>
              </div>

              <!-- Edit Mode -->
              <div v-else class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block mb-1 text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Email
                    </label>
                    <input v-model="editForm.email" type="email"
                      class="w-full p-3 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div v-if="isStudent">
                    <label class="block mb-1 text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Lớp
                    </label>
                    <select v-model="editForm.grade"
                      class="w-full p-3 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="">Chọn lớp</option>
                      <option v-for="grade in gradeOptions" :key="grade.value" :value="grade.value">
                        {{ grade.label }}
                      </option>
                    </select>
                  </div>
                </div>
                <div v-if="isStudent" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block mb-1 text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Họ
                    </label>
                    <input v-model="editForm.firstName" type="text"
                      class="w-full p-3 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label class="block mb-1 text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Tên
                    </label>
                    <input v-model="editForm.lastName" type="text"
                      class="w-full p-3 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                </div>
                <div v-if="isStudent">
                  <label class="block mb-1 text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Ngày sinh
                  </label>
                  <input v-model="editForm.dateOfBirth" type="date"
                    class="w-full p-3 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div v-if="isStudent">
                  <label class="block mb-1 text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Giới thiệu
                  </label>
                  <textarea v-model="editForm.bio" rows="3" maxlength="500" placeholder="Giới thiệu về bản thân..."
                    class="w-full p-3 border border-gray-300 rounded-xl dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"></textarea>
                  <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    {{ (editForm.bio || '').length }}/500 ký tự
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div v-if="!isEditing" class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              class="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl">
              <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ formatNumber(studentXP) }}</p>
              <p class="mt-1 text-sm font-semibold text-gray-600 dark:text-slate-400">Điểm XP</p>
            </div>
            <div
              class="p-4 text-center bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl">
              <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{{ studentStars }}</p>
              <p class="mt-1 text-sm font-semibold text-gray-600 dark:text-slate-400">⭐ Ngôi sao</p>
            </div>
            <div
              class="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl">
              <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ completedCourses }}</p>
              <p class="mt-1 text-sm font-semibold text-gray-600 dark:text-slate-400">Hoàn thành</p>
            </div>
            <div
              class="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl">
              <p class="text-3xl font-bold text-orange-600 dark:text-orange-400">{{ studentStreak }}</p>
              <p class="mt-1 text-sm font-semibold text-gray-600 dark:text-slate-400">🔥 Streak</p>
            </div>
          </div>

          <!-- Save Button -->
          <div v-if="isEditing" class="flex justify-end gap-4 pt-4">
            <button @click="cancelEdit"
              class="px-6 py-2.5 font-bold text-gray-700 bg-gray-200 rounded-xl dark:bg-slate-700 dark:text-slate-300 hover:bg-gray-300 transition-colors">
              Hủy
            </button>
            <button @click="saveProfile" :disabled="saving"
              class="px-6 py-2.5 font-bold text-white bg-primary rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/30">
              {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </div>

        <!-- Student Preferences (if student) -->
        <div v-if="isStudent && !isEditing"
          class="p-8 bg-white border border-white shadow-xl dark:bg-slate-900 dark:border-white/5 rounded-3xl">
          <h3 class="mb-6 text-xl font-bold text-gray-900 dark:text-white font-display">
            🎯 Sở thích học tập
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block mb-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
                Môn học yêu thích
              </label>
              <div class="flex flex-wrap gap-2">
                <span v-for="subject in ['MATH', 'VIETNAMESE', 'ENGLISH', 'SCIENCE']" :key="subject"
                  class="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full dark:bg-slate-800 dark:text-slate-300">
                  {{ formatSubject(subject) }}
                </span>
              </div>
            </div>
            <div>
              <label class="block mb-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
                Thời gian học ưa thích
              </label>
              <span
                class="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl dark:bg-slate-800 dark:text-slate-300">
                Buổi sáng
              </span>
            </div>
          </div>
        </div>

        <!-- Achievements Preview -->
        <div v-if="!isEditing"
          class="p-8 bg-white border border-white shadow-xl dark:bg-slate-900 dark:border-white/5 rounded-3xl">
          <h3 class="mb-6 text-xl font-bold text-gray-900 dark:text-white font-display">
            🏆 Thành tích
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="achievement in achievements" :key="achievement.id"
              class="p-4 text-center transition-all bg-gray-50 dark:bg-slate-800 rounded-2xl hover:scale-105 hover:shadow-lg">
              <div class="mb-2 text-5xl">{{ achievement.icon }}</div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ achievement.title }}</p>
              <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">{{ achievement.description }}</p>
            </div>
          </div>
          <div class="mt-4 text-center">
            <NuxtLink to="/profile/achievements"
              class="inline-flex items-center gap-2 px-6 py-2 font-bold text-primary hover:underline transition-colors">
              <span>Xem tất cả thành tích</span>
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Settings -->
        <div class="p-8 bg-white border border-white shadow-xl dark:bg-slate-900 dark:border-white/5 rounded-3xl">
          <h3 class="mb-6 text-xl font-bold text-gray-900 dark:text-white font-display">
            ⚙️ Cài đặt
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between py-3 border-b dark:border-slate-700">
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">Chế độ tối</p>
                <p class="text-sm text-gray-500 dark:text-slate-400">Giao diện tối/ sáng</p>
              </div>
              <button @click="themeStore.toggleTheme()" :class="[
                'relative w-14 h-7 rounded-full transition-colors',
                isDark ? 'bg-primary' : 'bg-gray-300'
              ]">
                <span :class="[
                  'absolute w-5 h-5 bg-white rounded-full top-1 transition-all shadow-md',
                  isDark ? 'right-1' : 'left-1'
                ]"></span>
              </button>
            </div>
            <div class="flex items-center justify-between py-3 border-b dark:border-slate-700">
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">Thông báo email</p>
                <p class="text-sm text-gray-500 dark:text-slate-400">Nhận email về tiến độ học tập</p>
              </div>
              <button class="relative w-14 h-7 bg-blue-600 rounded-full">
                <span class="absolute w-5 h-5 bg-white rounded-full right-1 top-1 shadow-md"></span>
              </button>
            </div>
            <div class="flex items-center justify-between py-3">
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">Âm thanh</p>
                <p class="text-sm text-gray-500 dark:text-slate-400">Hiệu ứng âm thanh</p>
              </div>
              <button class="relative w-14 h-7 bg-blue-600 rounded-full">
                <span class="absolute w-5 h-5 bg-white rounded-full right-1 top-1 shadow-md"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="p-8 bg-red-50 border-2 border-red-200 dark:bg-red-900/10 dark:border-red-800 rounded-3xl">
          <h3 class="mb-4 text-xl font-bold text-red-600 dark:text-red-400 font-display">
            ⚠️ Vùng nguy hiểm
          </h3>
          <p class="mb-4 text-gray-700 dark:text-slate-300">
            Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
          </p>
          <button @click="showDeleteModal = true"
            class="px-6 py-2.5 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">
            Xóa tài khoản
          </button>
        </div>
      </div>
    </div>

    <!-- Avatar Picker Modal -->
    <ProfileAvatarPicker :is-open="showAvatarPicker"
      :current-seed="editForm.avatarSeed || userStore.studentProfile?.avatarSeed" @close="showAvatarPicker = false"
      @select="handleAvatarSelect" />

    <!-- Delete Account Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="showDeleteModal" @click.self="showDeleteModal = false"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            class="w-full max-w-md p-6 bg-white border border-gray-200 shadow-2xl dark:bg-slate-900 dark:border-slate-700 rounded-3xl">
            <h3 class="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">Xác nhận xóa tài khoản</h3>
            <p class="mb-6 text-gray-700 dark:text-slate-300">
              Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.
            </p>
            <div class="flex justify-end gap-4">
              <button @click="showDeleteModal = false"
                class="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-xl dark:bg-slate-700 dark:text-slate-300 hover:bg-gray-300">
                Hủy
              </button>
              <button @click="handleDeleteAccount" :disabled="deleting"
                class="px-4 py-2 font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50">
                {{ deleting ? 'Đang xóa...' : 'Xóa tài khoản' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

useHead({
  title: 'Hồ sơ - EduForKids',
  meta: [
    { name: 'description', content: 'Quản lý hồ sơ và cài đặt tài khoản của bạn' },
  ],
});

const userStore = useUserStore();
const themeStore = useThemeStore();
const { showToast } = useToast();
const router = useRouter();

const loading = ref(true);
const isEditing = ref(false);
const saving = ref(false);
const showDeleteModal = ref(false);
const showAvatarPicker = ref(false);
const deleting = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);

// Grade options
const gradeOptions = [
  { value: 'GRADE_1', label: 'Lớp 1' },
  { value: 'GRADE_2', label: 'Lớp 2' },
  { value: 'GRADE_3', label: 'Lớp 3' },
  { value: 'GRADE_4', label: 'Lớp 4' },
  { value: 'GRADE_5', label: 'Lớp 5' },
  { value: 'GRADE_6', label: 'Lớp 6' },
];

// Edit form
const editForm = ref({
  email: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  grade: '',
  bio: '',
  avatar: '',
  avatarSeed: '',
});

// Computed properties
const isStudent = computed(() => userStore.isStudent);
const isDark = computed(() => themeStore.isDark);

const userName = computed(() => {
  if (userStore.studentProfile) {
    return `${userStore.studentProfile.firstName} ${userStore.studentProfile.lastName}`;
  }
  if (userStore.profile) {
    return userStore.profile.email.split('@')[0];
  }
  return 'Người dùng';
});

const userEmail = computed(() => userStore.profile?.email || '');
const userRole = computed(() => {
  const role = userStore.profile?.role;
  if (role === 'STUDENT') return 'Học sinh';
  if (role === 'PARENT') return 'Phụ huynh';
  if (role === 'TEACHER') return 'Giáo viên';
  if (role === 'ADMIN') return 'Quản trị viên';
  return 'Người dùng';
});

const userAvatar = computed(() => {
  return userStore.studentProfile?.avatar || userStore.profile?.avatar || '';
});

const studentLevel = computed(() => userStore.studentProfile?.level || 1);
const studentXP = computed(() => userStore.studentProfile?.xp || 0);
const studentStars = computed(() => userStore.studentProfile?.stars || 0);
const studentStreak = computed(() => userStore.studentProfile?.streak || 0);
const completedCourses = computed(() => userStore.stats?.completedCourses || 0);

// Mock achievements (TODO: fetch from API)
const achievements = [
  { id: 1, icon: '🎓', title: 'Người học siêng', description: 'Hoàn thành 10 bài học' },
  { id: 2, icon: '⭐', title: 'Ngôi sao sáng', description: 'Đạt 100 sao' },
  { id: 3, icon: '🔥', title: 'Chiến binh bền bỉ', description: `${studentStreak.value} ngày liên tiếp` },
  { id: 4, icon: '🏆', title: 'Vô địch toán', description: 'Hoàn thành khóa toán' },
];

// Methods
const formatGrade = (grade: string) => {
  const option = gradeOptions.find(g => g.value === grade);
  return option ? option.label : grade;
};

const formatSubject = (subject: string) => {
  const subjects: Record<string, string> = {
    MATH: 'Toán học',
    VIETNAMESE: 'Tiếng Việt',
    ENGLISH: 'Tiếng Anh',
    SCIENCE: 'Khoa học',
  };
  return subjects[subject] || subject;
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

const initializeEditForm = () => {
  if (userStore.profile) {
    editForm.value.email = userStore.profile.email || '';
    editForm.value.avatar = userAvatar.value || '';
  }
  if (userStore.studentProfile) {
    editForm.value.firstName = userStore.studentProfile.firstName || '';
    editForm.value.lastName = userStore.studentProfile.lastName || '';
    editForm.value.grade = userStore.studentProfile.grade || '';
    editForm.value.bio = userStore.studentProfile.bio || '';
    editForm.value.avatarSeed = userStore.studentProfile.avatarSeed || '';
    if (userStore.studentProfile.dateOfBirth) {
      const date = new Date(userStore.studentProfile.dateOfBirth);
      editForm.value.dateOfBirth = date.toISOString().split('T')[0];
    }
  }
};

const handleAvatarSelect = (seed: string, style: string) => {
  editForm.value.avatarSeed = seed;
  // Optionally clear avatar URL when using seed
  // editForm.value.avatar = '';
};

const cancelEdit = () => {
  isEditing.value = false;
  initializeEditForm();
};

const saveProfile = async () => {
  saving.value = true;
  try {
    // Update user profile (email)
    if (editForm.value.email && editForm.value.email !== userEmail.value) {
      const userResult = await userStore.updateProfile({
        email: editForm.value.email,
      });
      if (!userResult.success) {
        showToast({
          type: 'error',
          message: userResult.message || 'Cập nhật email thất bại',
        });
        return;
      }
    }

    // Update student profile (if student)
    if (isStudent.value) {
      const studentData: any = {};
      if (editForm.value.firstName) studentData.firstName = editForm.value.firstName;
      if (editForm.value.lastName) studentData.lastName = editForm.value.lastName;
      if (editForm.value.grade) studentData.grade = editForm.value.grade;
      if (editForm.value.bio !== undefined) studentData.bio = editForm.value.bio || null;
      if (editForm.value.avatarSeed) studentData.avatarSeed = editForm.value.avatarSeed;
      if (editForm.value.avatar) studentData.avatar = editForm.value.avatar;
      if (editForm.value.dateOfBirth) studentData.dateOfBirth = editForm.value.dateOfBirth;

      if (Object.keys(studentData).length > 0) {
        const studentResult = await userStore.updateStudentProfile(studentData);
        if (!studentResult.success) {
          showToast({
            type: 'error',
            message: studentResult.message || 'Cập nhật hồ sơ thất bại',
          });
          return;
        }
      }
    }

    showToast({
      type: 'success',
      message: 'Cập nhật thông tin thành công!',
    });

    isEditing.value = false;
  } catch (error: any) {
    showToast({
      type: 'error',
      message: error.message || 'Có lỗi xảy ra khi cập nhật',
    });
  } finally {
    saving.value = false;
  }
};

const handleDeleteAccount = async () => {
  deleting.value = true;
  try {
    // TODO: Implement delete account with password confirmation
    showToast({
      type: 'info',
      message: 'Tính năng xóa tài khoản đang được phát triển',
    });
    showDeleteModal.value = false;
  } catch (error: any) {
    showToast({
      type: 'error',
      message: error.message || 'Có lỗi xảy ra',
    });
  } finally {
    deleting.value = false;
  }
};

// Watch editing mode
watch(isEditing, (newVal) => {
  if (newVal) {
    initializeEditForm();
  }
});

// Fetch user data
onMounted(async () => {
  try {
    await userStore.fetchProfile();

    if (isStudent.value) {
      await userStore.fetchStudentProfile();
      await userStore.fetchStudentStats();
    }

    initializeEditForm();
  } catch (error) {
    console.error('Error fetching profile data:', error);
    showToast({
      type: 'error',
      message: 'Không thể tải thông tin hồ sơ',
    });
  } finally {
    loading.value = false;
  }
});
</script>
