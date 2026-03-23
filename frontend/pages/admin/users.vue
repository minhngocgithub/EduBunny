<template>
  <div class="space-y-8">
    <!-- Search and Filter -->
    <div class="flex gap-4">
      <div class="relative flex-1">
        <span class="absolute -translate-y-1/2 material-symbols-outlined left-4 top-1/2 text-slate-400">search</span>
        <input type="text" v-model="searchQuery" placeholder="Tìm kiếm người dùng bằng tên hoặc email..."
          class="w-full py-4 pl-12 pr-4 bg-white border-none shadow-sm dark:bg-slate-900 rounded-2xl focus:ring-2 focus:ring-primary dark:text-white" />
      </div>
      <select v-model="roleFilter"
        class="px-8 font-bold bg-none border border-white shadow-sm dark:bg-slate-900 rounded-2xl dark:border-white/5 text-slate-500 dark:text-slate-400">
        <option value="">Tất cả vai trò</option>
        <option value="STUDENT">Học sinh</option>
        <option value="PARENT">Phụ huynh</option>
        <option value="ADMIN">Quản trị viên</option>
      </select>
    </div>

    <!-- Users Grid -->
    <div v-if="loading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i"
        class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-white dark:border-white/5 animate-pulse">
        <div class="flex items-center gap-5">
          <div class="size-16 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0"></div>
          <div class="flex-1">
            <div class="w-3/4 h-4 mb-2 rounded bg-slate-200 dark:bg-slate-700"></div>
            <div class="w-1/2 h-3 rounded bg-slate-200 dark:bg-slate-700"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="filteredUsers.length === 0"
      class="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-white dark:border-white/5">
      <span class="mb-4 text-6xl material-symbols-outlined text-slate-300 dark:text-slate-700">search_off</span>
      <p class="font-medium text-slate-500 dark:text-slate-400">Không tìm thấy người dùng</p>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="user in filteredUsers" :key="user.id"
        class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-white dark:border-white/5 flex items-center gap-5 group hover:shadow-xl transition-all">
        <div class="overflow-hidden size-16 rounded-2xl bg-slate-50 dark:bg-slate-800 shrink-0">
          <img :src="getAvatar(user)" :alt="getFullName(user)" class="object-cover w-full h-full" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold truncate text-slate-800 dark:text-white">{{ getFullName(user) }}</h4>
          <p class="text-[10px] font-black uppercase tracking-widest" :class="getRoleColor(user.role)">
            {{ getRoleName(user.role) }}
          </p>
          <p class="mt-1 text-xs truncate text-slate-400">{{ user.email }}</p>
          <div v-if="user.student" class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            XP: {{ user.student.xp }} | Level {{ user.student.level }}
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div
            :class="`size-3 rounded-full self-end ${user.isActive ? 'bg-success shadow-[0_0_8px_rgba(149,225,211,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`">
          </div>
          <button @click="openUserMenu(user.id)"
            class="transition-colors material-symbols-outlined text-slate-300 hover:text-slate-600 dark:hover:text-white">
            more_vert
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-3 gap-6">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-white dark:border-white/5 text-center">
        <div class="flex items-center justify-center mx-auto mb-4 size-12 rounded-xl bg-primary/10 text-primary">
          <span class="text-2xl material-symbols-outlined">school</span>
        </div>
        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ studentCount }}</p>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Học sinh (trang này)</p>
      </div>
      <div class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-white dark:border-white/5 text-center">
        <div class="flex items-center justify-center mx-auto mb-4 size-12 rounded-xl bg-secondary/10 text-secondary">
          <span class="text-2xl material-symbols-outlined">family_restroom</span>
        </div>
        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ parentCount }}</p>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Phụ huynh (trang này)</p>
      </div>
      <div class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-white dark:border-white/5 text-center">
        <div class="flex items-center justify-center mx-auto mb-4 size-12 rounded-xl bg-success/10 text-success">
          <span class="text-2xl material-symbols-outlined">verified</span>
        </div>
        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ activeUserPercentage }}%</p>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Đang hoạt động</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1"
      class="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-white dark:border-white/5">
      <button @click="pagination.page--; fetchUsers()" :disabled="pagination.page <= 1"
        class="px-4 py-2 transition-all rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <span class="text-sm font-medium text-slate-600 dark:text-slate-400">
        Trang {{ pagination.page }} / {{ pagination.totalPages }} ({{ pagination.total }} người dùng)
      </span>
      <button @click="pagination.page++; fetchUsers()" :disabled="pagination.page >= pagination.totalPages"
        class="px-4 py-2 transition-all rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  </div>

  <!-- User Detail Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showUserModal" @click="closeUserModal"
        class="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div @click.stop
          class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white dark:border-white/5">

          <!-- Loading State -->
          <div v-if="loadingUser" class="p-12 text-center">
            <div class="inline-block border-4 rounded-full size-12 border-primary border-t-transparent animate-spin">
            </div>
            <p class="mt-4 text-slate-500">Đang tải thông tin...</p>
          </div>

          <!-- User Detail Content -->
          <div v-else-if="selectedUser" class="p-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center gap-4">
                <img :src="getAvatar(selectedUser)" :alt="getFullName(selectedUser)"
                  class="object-cover size-20 rounded-2xl" />
                <div>
                  <h2 class="text-2xl font-bold text-slate-800 dark:text-white">{{ getFullName(selectedUser) }}</h2>
                  <p class="text-sm font-bold tracking-widest uppercase" :class="getRoleColor(selectedUser.role)">
                    {{ getRoleName(selectedUser.role) }}
                  </p>
                </div>
              </div>
              <button @click="closeUserModal"
                class="transition-colors material-symbols-outlined text-slate-400 hover:text-slate-600 dark:hover:text-white">
                close
              </button>
            </div>

            <!-- Status Badge -->
            <div class="mb-6">
              <span
                :class="`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${selectedUser.isActive ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-500'}`">
                <span class="rounded-full size-2" :class="selectedUser.isActive ? 'bg-success' : 'bg-red-500'"></span>
                {{ selectedUser.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa' }}
              </span>
            </div>

            <!-- User Info -->
            <div class="mb-8 space-y-4">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-400">email</span>
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Email</p>
                  <p class="font-medium text-slate-800 dark:text-white">{{ selectedUser.email }}</p>
                </div>
              </div>
              <div v-if="selectedUser.student" class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-400">school</span>
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Thông tin học sinh</p>
                  <p class="font-medium text-slate-800 dark:text-white">
                    Lớp {{ selectedUser.student.grade?.replace('GRADE_', '') }} | Level {{ selectedUser.student.level }}
                    | XP: {{ selectedUser.student.xp }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-400">calendar_today</span>
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Ngày tạo</p>
                  <p class="font-medium text-slate-800 dark:text-white">
                    {{ new Date(selectedUser.createdAt).toLocaleString('vi-VN') }}
                  </p>
                </div>
              </div>
              <div v-if="selectedUser.lastLoginAt" class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-400">login</span>
                <div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Đăng nhập gần nhất</p>
                  <p class="font-medium text-slate-800 dark:text-white">
                    {{ new Date(selectedUser.lastLoginAt).toLocaleString('vi-VN') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Admin Actions -->
            <div class="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 class="mb-4 text-sm font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                Hành động quản trị
              </h3>
              <div class="grid grid-cols-2 gap-3">
                <button @click="toggleUserActive"
                  class="flex items-center justify-center gap-2 px-4 py-3 font-bold transition-all rounded-xl"
                  :class="selectedUser.isActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-success/10 text-success hover:bg-success/20'">
                  <span class="material-symbols-outlined">{{ selectedUser.isActive ? 'block' : 'check_circle' }}</span>
                  {{ selectedUser.isActive ? 'Vô hiệu hóa' : 'Kích hoạt' }}
                </button>

                <button v-if="selectedUser.role !== 'ADMIN'"
                  @click="changeUserRole(selectedUser.role === 'STUDENT' ? 'PARENT' : 'STUDENT')"
                  class="flex items-center justify-center gap-2 px-4 py-3 font-bold transition-all rounded-xl bg-primary/10 text-primary hover:bg-primary/20">
                  <span class="material-symbols-outlined">swap_horiz</span>
                  Đổi vai trò
                </button>

                <button v-if="selectedUser.role !== 'ADMIN'" @click="deleteUser"
                  class="flex items-center justify-center col-span-2 gap-2 px-4 py-3 font-bold text-red-500 transition-all rounded-xl bg-red-500/10 hover:bg-red-500/20">
                  <span class="material-symbols-outlined">delete</span>
                  Xóa người dùng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { AdminUserListItem, AdminUsersQueryParams } from '~/types/user';
import { API_ENDPOINTS } from '~/types/api';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const { apiClient } = useApiClient();
const { showToast } = useToast();
const { success, confirmDelete } = useSweetAlert();

const searchQuery = ref('');
const roleFilter = ref('');
const loading = ref(false);

// User Detail Modal
const showUserModal = ref(false);
const selectedUser = ref<any | null>(null);
const loadingUser = ref(false);

// Data from API
const users = ref<AdminUserListItem[]>([]);
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

// Fetch users from API
const fetchUsers = async () => {
  loading.value = true;
  try {
    const params: AdminUsersQueryParams = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    if (roleFilter.value) {
      params.role = roleFilter.value as any;
    }

    const response = await apiClient.get<{ users: AdminUserListItem[]; pagination: typeof pagination.value }>(
      API_ENDPOINTS.USER.ADMIN.LIST,
      params as Record<string, string | number | boolean>
    );

    if (response.success && response.data) {
      users.value = response.data.users;
      pagination.value = response.data.pagination;
    }
  } catch (error: any) {
    showToast({
      type: 'error',
      message: error.message || 'Không thể tải danh sách người dùng',
    });
  } finally {
    loading.value = false;
  }
};

// Initial fetch
onMounted(() => {
  fetchUsers();
});

// Watch filters and refetch with debounce
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch([searchQuery, roleFilter], () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    pagination.value.page = 1; // Reset to page 1 when filters change
    fetchUsers();
  }, 300);
});

const filteredUsers = computed(() => users.value);

const studentCount = computed(() => users.value.filter(u => u.role === 'STUDENT').length);
const parentCount = computed(() => users.value.filter(u => u.role === 'PARENT').length);
const activeUserPercentage = computed(() => {
  if (pagination.value.total === 0) return 0;
  const activeCount = users.value.filter(u => u.isActive).length;
  return Math.round((activeCount / users.value.length) * 100);
});

const getFullName = (user: AdminUserListItem) => {
  if (user.student) {
    return `${user.student.firstName} ${user.student.lastName}`;
  }
  if (user.parent) {
    return `${user.parent.firstName} ${user.parent.lastName}`;
  }
  return user.email.split('@')[0]; // Fallback to email username
};

const getAvatar = (user: AdminUserListItem) => {
  if (user.student?.avatar) {
    return user.student.avatar;
  }
  if (user.student?.avatarSeed) {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.student.avatarSeed}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(getFullName(user))}&background=random`;
};

const getRoleName = (role: string) => {
  const roles: Record<string, string> = {
    STUDENT: 'Học sinh',
    PARENT: 'Phụ huynh',
    TEACHER: 'Giáo viên',
    ADMIN: 'Quản trị',
  };
  return roles[role] || role;
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    STUDENT: 'text-primary',
    PARENT: 'text-secondary',
    TEACHER: 'text-accent',
    ADMIN: 'text-success',
  };
  return colors[role] || 'text-slate-400';
};

const openUserMenu = async (userId: string) => {
  loadingUser.value = true;
  showUserModal.value = true;

  try {
    const response = await apiClient.get(API_ENDPOINTS.USER.ADMIN.DETAIL(userId));
    if (response.success && response.data) {
      selectedUser.value = response.data;
    }
  } catch (error: any) {
    showToast({
      type: 'error',
      message: error.message || 'Không thể tải thông tin người dùng',
    });
    showUserModal.value = false;
  } finally {
    loadingUser.value = false;
  }
};

const closeUserModal = () => {
  showUserModal.value = false;
  selectedUser.value = null;
};

const toggleUserActive = async () => {
  if (!selectedUser.value) return;

  try {
    const newStatus = !selectedUser.value.isActive;
    const response = await apiClient.patch(
      API_ENDPOINTS.USER.ADMIN.TOGGLE_ACTIVE(selectedUser.value.id),
      { isActive: newStatus }
    );

    if (response.success) {
      await success(
        newStatus ? 'Đã kích hoạt!' : 'Đã vô hiệu hóa!',
        `Tài khoản đã được ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'}`
      );
      selectedUser.value.isActive = newStatus;
      await fetchUsers();
    }
  } catch (error: any) {
    showToast({
      type: 'error',
      message: error.message || 'Không thể thay đổi trạng thái',
    });
  }
};

const changeUserRole = async (newRole: string) => {
  if (!selectedUser.value) return;

  const result = await confirmDelete(
    'Đổi vai trò?',
    `Bạn có chắc muốn đổi vai trò của người dùng này sang ${getRoleName(newRole)}?`
  );

  if (result.isConfirmed) {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.USER.ADMIN.CHANGE_ROLE(selectedUser.value.id),
        { role: newRole }
      );

      if (response.success) {
        await success('Đã đổi vai trò!', 'Vai trò người dùng đã được cập nhật');
        selectedUser.value.role = newRole;
        await fetchUsers();
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || 'Không thể đổi vai trò',
      });
    }
  }
};

const deleteUser = async () => {
  if (!selectedUser.value) return;

  const result = await confirmDelete(
    'Xóa người dùng?',
    'Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa!'
  );

  if (result.isConfirmed) {
    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.USER.ADMIN.DELETE(selectedUser.value.id)
      );

      if (response.success) {
        await success('Đã xóa!', 'Người dùng đã được xóa khỏi hệ thống');
        closeUserModal();
        await fetchUsers();
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || 'Không thể xóa người dùng',
      });
    }
  }
};

useHead({
  title: 'Quản lý Người dùng - Admin',
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

.modal-enter-active>div,
.modal-leave-active>div {
  transition: transform 0.3s ease;
}

.modal-enter-from>div,
.modal-leave-to>div {
  transform: scale(0.95);
}
</style>
