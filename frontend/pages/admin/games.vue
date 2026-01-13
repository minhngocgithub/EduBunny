<template>
  <div class="space-y-8">
    <!-- Games Grid -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-4">
        <button
          class="px-6 py-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-slate-600 dark:text-slate-400 shadow-sm border border-white dark:border-white/5 flex items-center gap-2">
          <span class="material-symbols-outlined">filter_list</span> Bộ lọc
        </button>
      </div>
      <button @click="showCreateModal = true"
        class="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
        <span class="material-symbols-outlined">add</span> Thêm trò chơi mới
      </button>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="game in games" :key="game.id"
        class="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-white dark:border-white/5 group hover:shadow-xl transition-all">
        <div class="h-48 bg-gradient-to-br from-primary to-secondary relative">
          <div class="absolute inset-0 flex items-center justify-center text-7xl">
            {{ game.icon }}
          </div>
          <div class="absolute top-4 right-4">
            <span
              :class="`px-3 py-1 rounded-full text-[10px] font-black uppercase ${game.isPublished ? 'bg-success text-white' : 'bg-white/20 text-white backdrop-blur'}`">
              {{ game.isPublished ? 'Công khai' : 'Nháp' }}
            </span>
          </div>
        </div>
        <div class="p-6">
          <h3 class="font-display text-xl font-bold text-slate-800 dark:text-white mb-2">{{ game.title }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ game.description }}</p>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4 text-xs font-bold text-slate-400">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-base">play_circle</span>
                {{ game.playCount.toLocaleString() }}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-base">star</span>
                {{ game.avgRating }}
              </span>
            </div>
            <span class="text-xs font-black uppercase text-primary">{{ game.difficulty }}</span>
          </div>
          <div class="flex gap-2">
            <button @click="editGame(game.id)"
              class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-primary hover:text-white transition-all">
              Chỉnh sửa
            </button>
            <button @click="deleteGame(game.id)"
              class="size-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <AppModal v-if="showCreateModal" @close="showCreateModal = false">
      <template #title>Tạo trò chơi mới</template>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên trò chơi</label>
          <input type="text" v-model="newGame.title" class="input w-full" placeholder="VD: Săn Số học" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mô tả</label>
          <textarea v-model="newGame.description" class="input w-full" rows="3"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Loại</label>
            <select v-model="newGame.gameType" class="input w-full">
              <option value="PUZZLE">Giải đố</option>
              <option value="MATCHING">Ghép đôi</option>
              <option value="QUIZ">Trắc nghiệm</option>
              <option value="ADVENTURE">Phiêu lưu</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Độ khó</label>
            <select v-model="newGame.difficulty" class="input w-full">
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>
          </div>
        </div>
      </div>
      <template #actions>
        <button @click="showCreateModal = false" class="btn-secondary">Hủy</button>
        <button @click="createGame" class="btn-primary">Tạo trò chơi</button>
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

const games = ref([
  {
    id: 1,
    title: 'Săn Số học',
    description: 'Giải các phép tính để săn kho báu',
    icon: '🏆',
    gameType: 'ADVENTURE',
    difficulty: 'EASY',
    playCount: 5240,
    avgRating: 4.8,
    isPublished: true,
  },
  {
    id: 2,
    title: 'Ghép từ vựng',
    description: 'Ghép các từ với hình ảnh tương ứng',
    icon: '🎯',
    gameType: 'MATCHING',
    difficulty: 'MEDIUM',
    playCount: 3150,
    avgRating: 4.5,
    isPublished: true,
  },
  {
    id: 3,
    title: 'Mê cung Toán học',
    description: 'Tìm đường ra bằng cách giải toán',
    icon: '🧩',
    gameType: 'PUZZLE',
    difficulty: 'HARD',
    playCount: 1890,
    avgRating: 4.2,
    isPublished: false,
  },
]);

const newGame = ref({
  title: '',
  description: '',
  gameType: 'PUZZLE',
  difficulty: 'EASY',
});

const createGame = async () => {
  console.log('Creating game:', newGame.value);
  showCreateModal.value = false;
};

const editGame = (id: number) => {
  console.log('Editing game:', id);
};

const deleteGame = async (id: number) => {
  if (confirm('Bạn có chắc muốn xóa trò chơi này?')) {
    console.log('Deleting game:', id);
  }
};

useHead({
  title: 'Quản lý Trò chơi - Admin',
});
</script>
