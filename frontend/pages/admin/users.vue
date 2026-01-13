<template>
  <div class="space-y-8">
    <!-- Search and Filter -->
    <div class="flex gap-4">
      <div class="flex-1 relative">
        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input type="text" v-model="searchQuery" placeholder="Tìm kiếm người dùng bằng tên hoặc email..."
          class="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary dark:text-white" />
      </div>
      <select v-model="roleFilter"
        class="px-8 bg-white dark:bg-slate-900 rounded-2xl border border-white dark:border-white/5 shadow-sm font-bold text-slate-500 dark:text-slate-400">
        <option value="">Tất cả vai trò</option>
        <option value="STUDENT">Học sinh</option>
        <option value="PARENT">Phụ huynh</option>
        <option value="ADMIN">Quản trị viên</option>
      </select>
    </div>

    <!-- Users Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="user in filteredUsers" :key="user.id"
        class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-white dark:border-white/5 flex items-center gap-5 group hover:shadow-xl transition-all">
        <div class="size-16 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0">
          <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`"
            :alt="user.fullName" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-slate-800 dark:text-white truncate">{{ user.fullName }}</h4>
          <p class="text-[10px] font-black uppercase tracking-widest" :class="getRoleColor(user.role)">
            {{ getRoleName(user.role) }}
          </p>
          <p class="text-xs text-slate-400 truncate mt-1">{{ user.email }}</p>
          <div v-if="user.studentProfile" class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            XP: {{ user.studentProfile.totalXP }} | Level {{ user.studentProfile.level }}
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div
            :class="`size-3 rounded-full self-end ${user.isActive ? 'bg-success shadow-[0_0_8px_rgba(149,225,211,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`">
          </div>
          <button @click="openUserMenu(user.id)"
            class="material-symbols-outlined text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors">
            more_vert
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-3 gap-6">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-white dark:border-white/5 text-center">
        <div class="size-12 mx-auto mb-4 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <span class="material-symbols-outlined text-2xl">school</span>
        </div>
        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ studentCount }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Học sinh</p>
      </div>
      <div class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-white dark:border-white/5 text-center">
        <div class="size-12 mx-auto mb-4 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
          <span class="material-symbols-outlined text-2xl">family_restroom</span>
        </div>
        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ parentCount }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Phụ huynh</p>
      </div>
      <div class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-white dark:border-white/5 text-center">
        <div class="size-12 mx-auto mb-4 rounded-xl bg-success/10 text-success flex items-center justify-center">
          <span class="material-symbols-outlined text-2xl">verified</span>
        </div>
        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ activeUserPercentage }}%</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Đang hoạt động</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const searchQuery = ref('');
const roleFilter = ref('');

const users = ref([
  {
    id: 1,
    fullName: 'Nguyễn Văn A',
    email: 'vana@gmail.com',
    role: 'STUDENT',
    isActive: true,
    studentProfile: { totalXP: 1250, level: 5 },
  },
  {
    id: 2,
    fullName: 'Trần Thị B',
    email: 'parentb@gmail.com',
    role: 'PARENT',
    isActive: true,
  },
  {
    id: 3,
    fullName: 'Lê Văn C',
    email: 'levanc@gmail.com',
    role: 'STUDENT',
    isActive: false,
    studentProfile: { totalXP: 850, level: 3 },
  },
  {
    id: 4,
    fullName: 'Phạm Thị D',
    email: 'phamd@gmail.com',
    role: 'STUDENT',
    isActive: true,
    studentProfile: { totalXP: 2100, level: 8 },
  },
  {
    id: 5,
    fullName: 'Hoàng Văn E',
    email: 'adminhvang@edu.vn',
    role: 'ADMIN',
    isActive: true,
  },
]);

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesRole = !roleFilter.value || user.role === roleFilter.value;
    return matchesSearch && matchesRole;
  });
});

const studentCount = computed(() => users.value.filter(u => u.role === 'STUDENT').length);
const parentCount = computed(() => users.value.filter(u => u.role === 'PARENT').length);
const activeUserPercentage = computed(() =>
  Math.round((users.value.filter(u => u.isActive).length / users.value.length) * 100)
);

const getRoleName = (role: string) => {
  const roles: Record<string, string> = {
    STUDENT: 'Học sinh',
    PARENT: 'Phụ huynh',
    ADMIN: 'Quản trị',
  };
  return roles[role] || role;
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    STUDENT: 'text-primary',
    PARENT: 'text-secondary',
    ADMIN: 'text-success',
  };
  return colors[role] || 'text-slate-400';
};

const openUserMenu = (userId: number) => {
  console.log('Open menu for user:', userId);
};

useHead({
  title: 'Quản lý Người dùng - Admin',
});
</script>
