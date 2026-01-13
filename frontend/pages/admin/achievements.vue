<template>
  <div class="space-y-8">
    <div class="grid md:grid-cols-3 gap-6">
      <div v-for="achievement in achievements" :key="achievement.id"
        class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-white dark:border-white/5 group hover:shadow-xl transition-all">
        <div class="flex items-start justify-between mb-6">
          <div :class="`size-20 rounded-[1.5rem] flex items-center justify-center text-4xl ${achievement.bgColor}`">
            {{ achievement.icon }}
          </div>
          <button @click="editAchievement(achievement.id)"
            class="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white transition-all">
            <span class="material-symbols-outlined">edit</span>
          </button>
        </div>
        <h3 class="font-display text-xl font-bold text-slate-800 dark:text-white mb-2">{{ achievement.title }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ achievement.description }}</p>
        <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
          <div class="text-xs font-bold text-slate-400">
            <span class="text-primary text-lg font-black">{{ achievement.unlockedCount }}</span> đã đạt được
          </div>
          <span
            :class="`px-3 py-1 rounded-full text-[10px] font-black uppercase ${achievement.rarity === 'LEGENDARY' ? 'bg-warning/20 text-warning' : achievement.rarity === 'RARE' ? 'bg-secondary/20 text-secondary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`">
            {{ achievement.rarity }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button @click="showCreateModal = true"
        class="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
        <span class="material-symbols-outlined">add</span> Tạo thành tích mới
      </button>
    </div>

    <!-- Create Modal -->
    <AppModal v-if="showCreateModal" @close="showCreateModal = false">
      <template #title>Tạo thành tích mới</template>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên thành tích</label>
          <input type="text" v-model="newAchievement.title" class="input w-full"
            placeholder="VD: Siêu Anh Hùng Toán học" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mô tả</label>
          <textarea v-model="newAchievement.description" class="input w-full" rows="2"></textarea>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Icon (Emoji)</label>
          <input type="text" v-model="newAchievement.icon" class="input w-full" placeholder="🏆" maxlength="2" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Độ hiếm</label>
            <select v-model="newAchievement.rarity" class="input w-full">
              <option value="COMMON">Common</option>
              <option value="RARE">Rare</option>
              <option value="LEGENDARY">Legendary</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">XP thưởng</label>
            <input type="number" v-model="newAchievement.xpReward" class="input w-full" placeholder="100" />
          </div>
        </div>
      </div>
      <template #actions>
        <button @click="showCreateModal = false" class="btn-secondary">Hủy</button>
        <button @click="createAchievement" class="btn-primary">Tạo thành tích</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const showCreateModal = ref(false);

const achievements = ref([
  {
    id: 1,
    title: 'Siêu Anh Hùng',
    description: 'Hoàn thành 100 bài tập',
    icon: '🏆',
    bgColor: 'bg-warning/20',
    rarity: 'LEGENDARY',
    unlockedCount: 156,
  },
  {
    id: 2,
    title: 'Thiên Tài Toán học',
    description: 'Đạt 10 điểm liên tiếp',
    icon: '🧮',
    bgColor: 'bg-primary/20',
    rarity: 'RARE',
    unlockedCount: 432,
  },
  {
    id: 3,
    title: 'Người Học Siêng',
    description: 'Học 7 ngày liên tiếp',
    icon: '📚',
    bgColor: 'bg-secondary/20',
    rarity: 'COMMON',
    unlockedCount: 1250,
  },
  {
    id: 4,
    title: 'Nhà Khám Phá',
    description: 'Hoàn thành tất cả khóa học Khoa học',
    icon: '🔬',
    bgColor: 'bg-success/20',
    rarity: 'RARE',
    unlockedCount: 89,
  },
  {
    id: 5,
    title: 'Bậc Thầy Ngôn Ngữ',
    description: 'Đạt 95% trở lên ở 5 bài Tiếng Anh',
    icon: '🌍',
    bgColor: 'bg-accent/20',
    rarity: 'LEGENDARY',
    unlockedCount: 67,
  },
]);

const newAchievement = ref({
  title: '',
  description: '',
  icon: '🏆',
  rarity: 'COMMON',
  xpReward: 100,
});

const createAchievement = async () => {
  console.log('Creating achievement:', newAchievement.value);
  showCreateModal.value = false;
};

const editAchievement = (id: number) => {
  console.log('Editing achievement:', id);
};

useHead({
  title: 'Quản lý Thành tích - Admin',
});
</script>
