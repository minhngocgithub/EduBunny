<template>
  <div class="space-y-8">
    <!-- Action Bar -->
    <div class="flex items-center justify-between">
      <div class="flex flex-1 gap-4">
        <div class="relative flex-1">
          <span class="absolute -translate-y-1/2 material-symbols-outlined left-4 top-1/2 text-slate-400">search</span>
          <input type="text" v-model="searchQuery" placeholder="Tìm kiếm khóa học..."
            class="w-full py-3 pl-12 pr-4 bg-white border-none shadow-sm dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-primary dark:text-white" />
        </div>
        <select v-model="subjectFilter"
          class="px-6 font-bold bg-white border border-white shadow-sm dark:bg-slate-900 rounded-xl dark:border-white/5 text-slate-500 dark:text-slate-400">
          <option value="">Tất cả môn học</option>
          <option value="MATH">Toán học</option>
          <option value="VIETNAMESE">Tiếng Việt</option>
          <option value="ENGLISH">Tiếng Anh</option>
          <option value="SCIENCE">Khoa học</option>
          <option value="ART">Mỹ thuật</option>
          <option value="MUSIC">Âm nhạc</option>
          <option value="PE">Thể dục</option>
          <option value="HISTORY">Lịch sử</option>
          <option value="GEOGRAPHY">Địa lý</option>
          <option value="LIFE_SKILLS">Kỹ năng sống</option>
        </select>
        <select v-model="gradeFilter"
          class="px-6 font-bold bg-white border border-white shadow-sm dark:bg-slate-900 rounded-xl dark:border-white/5 text-slate-500 dark:text-slate-400">
          <option value="">Tất cả lớp</option>
          <option value="GRADE_1">Lớp 1</option>
          <option value="GRADE_2">Lớp 2</option>
          <option value="GRADE_3">Lớp 3</option>
          <option value="GRADE_4">Lớp 4</option>
          <option value="GRADE_5">Lớp 5</option>
        </select>
        <select v-model="publishedFilter"
          class="px-6 font-bold bg-white border border-white shadow-sm dark:bg-slate-900 rounded-xl dark:border-white/5 text-slate-500 dark:text-slate-400">
          <option value="">Trạng thái</option>
          <option value="true">Công khai</option>
          <option value="false">Nháp</option>
        </select>
      </div>
      <button @click="openCreateModal"
        class="flex items-center gap-2 px-8 py-3 ml-4 font-bold text-white transition-all shadow-lg bg-primary rounded-xl shadow-primary/20 hover:scale-105">
        <span class="material-symbols-outlined">add</span> Thêm khóa học mới
      </button>
    </div>

    <!-- Courses Table -->
    <div v-if="loading"
      class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-white dark:border-white/5 p-8">
      <div class="space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 animate-pulse">
          <div class="size-12 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
          <div class="flex-1">
            <div class="w-1/3 h-4 mb-2 rounded bg-slate-200 dark:bg-slate-700"></div>
            <div class="w-1/2 h-3 rounded bg-slate-200 dark:bg-slate-700"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="courses.length === 0"
      class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-white dark:border-white/5 text-center py-20">
      <span class="mb-4 text-6xl material-symbols-outlined text-slate-300 dark:text-slate-700">school</span>
      <p class="font-medium text-slate-500 dark:text-slate-400">Không tìm thấy khóa học</p>
    </div>

    <div v-else
      class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden border border-white dark:border-white/5">
      <table class="w-full text-left">
        <thead class="border-b bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-white/5">
          <tr>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên khóa học</th>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Môn học</th>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cấp độ</th>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bài giảng</th>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Học sinh</th>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hành động</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-white/5">
          <tr v-for="course in courses" :key="course.id"
            class="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <td class="px-8 py-6">
              <div class="flex items-center gap-3">
                <div
                  class="flex items-center justify-center text-sm font-bold text-white size-12 rounded-xl bg-gradient-to-br from-primary to-secondary">
                  {{ course.title.charAt(0) }}
                </div>
                <div>
                  <p class="font-bold text-slate-800 dark:text-white">{{ course.title }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ course.description?.slice(0, 30) }}...</p>
                </div>
              </div>
            </td>
            <td class="px-8 py-6">
              <span class=" py-1 rounded-full text-[10px] font-black uppercase text-primary">
                {{ getSubjectName(course.subject) }}
              </span>
            </td>
            <td class="px-8 py-6">
              <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Lớp {{ getGradeName(course.grade)
                }}</span>
            </td>
            <td class="px-8 py-6 font-medium text-slate-500 dark:text-slate-400">{{ course.lectureCount }} bài</td>
            <td class="px-8 py-6 font-medium text-slate-500 dark:text-slate-400">{{ course.enrollmentCount }}</td>
            <td class="px-8 py-6">
              <span
                :class="`py-1 rounded-full text-[10px] font-black uppercase ${course.isPublished ? ' text-success' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`">
                {{ course.isPublished ? 'Công khai' : 'Nháp' }}
              </span>
            </td>
            <td class="px-8 py-6">
              <div class="flex gap-2">
                <button @click="openLecturesModal(course)"
                  class="flex items-center justify-center transition-all rounded-lg size-9 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-secondary hover:text-white"
                  title="Quản lý bài giảng">
                  <span class="text-xl material-symbols-outlined">menu_book</span>
                </button>
                <button @click="openEditModal(course)"
                  class="flex items-center justify-center transition-all rounded-lg size-9 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-primary hover:text-white"
                  title="Chỉnh sửa">
                  <span class="text-xl material-symbols-outlined">edit</span>
                </button>
                <button @click="deleteCourse(course.id)"
                  class="flex items-center justify-center transition-all rounded-lg size-9 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-500 hover:text-white"
                  title="Xóa">
                  <span class="text-xl material-symbols-outlined">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex items-center justify-between">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Hiển thị {{ courses.length }} / {{ pagination.total }} khóa học
      </p>
      <div class="flex gap-2">
        <button @click="pagination.page--; fetchCourses()" :disabled="pagination.page <= 1"
          class="flex items-center justify-center transition-all bg-white border rounded-lg size-10 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <span class="flex items-center px-4 text-sm font-medium text-slate-600 dark:text-slate-400">
          Trang {{ pagination.page }} / {{ pagination.totalPages }}
        </span>
        <button @click="pagination.page++; fetchCourses()" :disabled="pagination.page >= pagination.totalPages"
          class="flex items-center justify-center transition-all bg-white border rounded-lg size-10 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <ClientOnly>
      <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
          enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100" leave-to-class="opacity-0">
          <div v-if="showCourseModal"
            class="fixed h-full inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            role="dialog" aria-modal="true" aria-labelledby="course-modal-title"
            @click.self="closeCourseModal">
            <Transition enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="scale-90 translate-y-4 opacity-0" enter-to-class="scale-100 translate-y-0 opacity-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="scale-100 translate-y-0 opacity-100" leave-to-class="scale-95 translate-y-4 opacity-0">
              <div v-if="showCourseModal"
                class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700 w-full max-w-3xl"
                @click.stop>
                <!-- Close Button -->
                <button type="button"
                  class="absolute z-10 flex items-center justify-center transition-all top-6 right-6 size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 group"
                  @click="closeCourseModal">
                  <span
                    class="text-2xl transition-transform duration-300 material-symbols-outlined group-hover:rotate-90">close</span>
                </button>

                <!-- Header -->
                <div class="flex-shrink-0 px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                  <h3 id="course-modal-title" class="text-2xl font-bold text-slate-800 dark:text-white">
                    {{ isEditMode ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới' }}
                  </h3>
                  <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {{ isEditMode ? 'Cập nhật thông tin khóa học của bạn' : 'Điền thông tin để tạo khóa học mới' }}
                  </p>
                </div>

                <!-- Body -->
                <div class="flex-1 px-8 py-6 overflow-y-auto custom-scrollbar">
                  <div class="space-y-5">
                    <!-- Tên khóa học -->
                    <div>
                      <label class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <span class="text-lg material-symbols-outlined text-primary">title</span>
                        Tên khóa học <span class="text-red-500">*</span>
                      </label>
                      <input type="text" v-model="courseForm.title" class="w-full text-base input"
                        placeholder="VD: Toán học lớp 1" required />
                    </div>

                    <!-- Mô tả -->
                    <div>
                      <label class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <span class="text-lg material-symbols-outlined text-primary">description</span>
                        Mô tả <span class="text-red-500">*</span>
                      </label>
                      <textarea v-model="courseForm.description" class="w-full text-base resize-none input" rows="4"
                        placeholder="Mô tả chi tiết về khóa học, nội dung học..." required></textarea>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-1">
                        Tối thiểu 10 ký tự ({{ courseForm.description.length }}/10)
                      </p>
                    </div>

                    <!-- Thumbnail URL -->
                    <div>
                      <label class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <span class="text-lg material-symbols-outlined text-primary">image</span>
                        Ảnh bìa
                      </label>
                      <div class="flex gap-2">
                        <input type="text" v-model="courseForm.thumbnail" class="flex-1 w-full text-base input"
                          placeholder="https://example.com/image.jpg" />
                        <button
                          type="button"
                          @click="openThumbnailFileDialog"
                          :disabled="isUploadingThumbnail"
                          class="inline-flex items-center justify-center px-3 transition-all border rounded-xl border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Chọn ảnh từ máy"
                        >
                          <span class="text-xl material-symbols-outlined" :class="{ 'animate-spin': isUploadingThumbnail }">
                            {{ isUploadingThumbnail ? 'progress_activity' : 'folder_open' }}
                          </span>
                        </button>
                      </div>

                      <input
                        ref="courseThumbnailInputRef"
                        type="file"
                        class="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        @change="handleThumbnailFileChange"
                      />

                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-1">
                        Nhấn icon folder để chọn ảnh từ máy (JPG/PNG/WEBP/GIF, tối đa 5MB)
                      </p>

                      <div v-if="courseForm.thumbnail" class="mt-3 overflow-hidden border rounded-xl border-slate-200 dark:border-slate-700">
                        <img
                          v-if="courseThumbnailPreviewSrc"
                          :src="courseThumbnailPreviewSrc"
                          alt="Xem trước ảnh bìa"
                          class="object-cover w-full h-40"
                          @error="handleCourseThumbnailPreviewError"
                        />
                        <div v-else class="flex items-center justify-center w-full h-40 px-4 text-xs text-center text-slate-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                          Không thể xem trước ảnh với URL hiện tại. Bạn vẫn có thể lưu và thử mở lại, hoặc chọn lại ảnh từ icon folder.
                        </div>
                      </div>
                    </div>

                    <!-- Môn học & Lớp -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <span class="text-lg material-symbols-outlined text-primary">menu_book</span>
                          Môn học <span class="text-red-500">*</span>
                        </label>
                        <select v-model="courseForm.subject" class="w-full text-base input" required>
                          <option value="MATH">Toán học</option>
                          <option value="VIETNAMESE">Tiếng Việt</option>
                          <option value="ENGLISH">Tiếng Anh</option>
                          <option value="SCIENCE">Khoa học</option>
                          <option value="ART">Mỹ thuật</option>
                          <option value="MUSIC">Âm nhạc</option>
                          <option value="PE">Thể dục</option>
                          <option value="HISTORY">Lịch sử</option>
                          <option value="GEOGRAPHY">Địa lý</option>
                          <option value="LIFE_SKILLS">Kỹ năng sống</option>
                        </select>
                      </div>
                      <div>
                        <label
                          class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <span class="text-lg material-symbols-outlined text-primary">school</span>
                          Lớp <span class="text-red-500">*</span>
                        </label>
                        <select v-model="courseForm.grade" class="w-full text-base input" required>
                          <option value="GRADE_1">Lớp 1</option>
                          <option value="GRADE_2">Lớp 2</option>
                          <option value="GRADE_3">Lớp 3</option>
                          <option value="GRADE_4">Lớp 4</option>
                          <option value="GRADE_5">Lớp 5</option>
                        </select>
                      </div>
                    </div>

                    <!-- Cấp độ & Thời lượng -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <span class="text-lg material-symbols-outlined text-primary">trending_up</span>
                          Cấp độ
                        </label>
                        <select v-model="courseForm.level" class="w-full text-base input">
                          <option value="BEGINNER">Cơ bản</option>
                          <option value="INTERMEDIATE">Trung bình</option>
                          <option value="ADVANCED">Nâng cao</option>
                        </select>
                      </div>
                      <div>
                        <label
                          class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <span class="text-lg material-symbols-outlined text-primary">schedule</span>
                          Thời lượng (phút)
                          <span class="text-xs font-normal text-slate-500 dark:text-slate-400">(Tự động tính)</span>
                        </label>
                        <input type="number" :value="courseForm.duration" disabled
                          class="w-full text-base cursor-not-allowed input bg-slate-50 dark:bg-slate-800"
                          placeholder="Sẽ tự động tính từ các bài giảng" />
                        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          💡 Thời lượng = Tổng thời gian các bài giảng
                        </p>
                      </div>
                    </div>

                    <!-- Toggles -->
                    <div class="grid grid-cols-2 gap-4">
                      <div
                        class="flex items-center justify-between p-5 border bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl border-primary/20">
                        <div>
                          <p class="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                            <span class="text-lg material-symbols-outlined text-primary">visibility</span>
                            Công khai
                          </p>
                          <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Hiển thị cho học sinh</p>
                        </div>
                        <button @click="courseForm.isPublished = !courseForm.isPublished" type="button"
                          :class="courseForm.isPublished ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-slate-300 dark:bg-slate-600'"
                          class="relative inline-flex items-center w-12 transition-all duration-300 rounded-full h-7">
                          <span :class="courseForm.isPublished ? 'translate-x-6' : 'translate-x-1'"
                            class="inline-block w-5 h-5 transition-transform duration-300 transform bg-white rounded-full shadow-md" />
                        </button>
                      </div>
                      <div
                        class="flex items-center justify-between p-5 border bg-gradient-to-br from-success/5 to-success/10 dark:from-success/10 dark:to-success/5 rounded-2xl border-success/20">
                        <div>
                          <p class="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                            <span class="text-lg material-symbols-outlined text-success">sell</span>
                            Miễn phí
                          </p>
                          <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Không tính phí</p>
                        </div>
                        <button @click="courseForm.isFree = !courseForm.isFree" type="button"
                          :class="courseForm.isFree ? 'bg-success shadow-lg shadow-success/30' : 'bg-slate-300 dark:bg-slate-600'"
                          class="relative inline-flex items-center w-12 transition-all duration-300 rounded-full h-7">
                          <span :class="courseForm.isFree ? 'translate-x-6' : 'translate-x-1'"
                            class="inline-block w-5 h-5 transition-transform duration-300 transform bg-white rounded-full shadow-md" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div class="flex-shrink-0 px-8 py-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div class="flex items-center justify-end gap-3">
                    <button @click="closeCourseModal"
                      class="px-6 py-3 font-bold transition-all bg-white border rounded-xl text-slate-600 dark:text-slate-400 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                      Hủy
                    </button>
                    <button @click="saveCourse" :disabled="!isFormValid || isUploadingThumbnail"
                      class="px-6 py-3 font-bold text-white transition-all rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95">
                      <span class="flex items-center gap-2">
                        <span class="text-xl material-symbols-outlined">{{ isEditMode ? 'check_circle' : 'add_circle'
                          }}</span>
                        {{ isEditMode ? 'Cập nhật khóa học' : 'Tạo khóa học' }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>

    <!-- Lectures Management Modal -->
    <ClientOnly>
      <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
          enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100" leave-to-class="opacity-0">
          <div v-if="showLecturesModal"
            class="fixed inset-0 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            :class="showLectureFormModal ? 'z-[9998]' : 'z-[9999]'"
            role="dialog" aria-modal="true" aria-labelledby="lectures-modal-title"
            @click.self="closeLecturesModal">
            <Transition enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="scale-90 translate-y-4 opacity-0" enter-to-class="scale-100 translate-y-0 opacity-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="scale-100 translate-y-0 opacity-100" leave-to-class="scale-95 translate-y-4 opacity-0">
              <div v-if="showLecturesModal"
                class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700 w-full max-w-5xl"
                @click.stop>
                <!-- Close Button -->
                <button type="button"
                  class="absolute z-10 flex items-center justify-center transition-all top-6 right-6 size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 group"
                  @click="closeLecturesModal">
                  <span class="text-2xl transition-transform duration-300 material-symbols-outlined group-hover:rotate-90">close</span>
                </button>

                <!-- Header -->
                <div class="flex-shrink-0 px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 id="lectures-modal-title" class="flex items-center gap-3 text-2xl font-bold text-slate-800 dark:text-white">
                        <span class="text-3xl material-symbols-outlined text-primary">menu_book</span>
                        Quản lý bài giảng
                      </h3>
                      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {{ selectedCourse?.title }} - {{ lectures.length }} bài giảng
                      </p>
                    </div>
                    <button @click="openCreateLectureModal"
                      class="flex items-center gap-2 px-6 py-3 font-bold text-white transition-all shadow-lg bg-primary rounded-xl shadow-primary/20 hover:scale-105">
                      <span class="material-symbols-outlined">add</span> Thêm bài giảng
                    </button>
                  </div>
                </div>

                <!-- Body -->
                <div class="flex-1 px-8 py-6 overflow-y-auto custom-scrollbar">
                  <div v-if="loadingLectures" class="space-y-4">
                    <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-4 animate-pulse bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div class="rounded-lg size-12 bg-slate-200 dark:bg-slate-700"></div>
                      <div class="flex-1">
                        <div class="w-1/3 h-4 mb-2 rounded bg-slate-200 dark:bg-slate-700"></div>
                        <div class="w-1/2 h-3 rounded bg-slate-200 dark:bg-slate-700"></div>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="lectures.length === 0" class="py-12 text-center">
                    <span class="mb-4 text-6xl material-symbols-outlined text-slate-300 dark:text-slate-700">video_library</span>
                    <p class="font-medium text-slate-500 dark:text-slate-400">Chưa có bài giảng nào</p>
                    <button @click="openCreateLectureModal"
                      class="px-6 py-2 mt-4 font-bold transition-all bg-primary/10 text-primary rounded-xl hover:bg-primary/20">
                      Tạo bài giảng đầu tiên
                    </button>
                  </div>

                  <div v-else class="space-y-3">
                    <div v-for="lecture in lectures" :key="lecture.id"
                      class="flex items-center gap-4 p-4 transition-all border bg-slate-50 dark:bg-slate-800/50 rounded-xl border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <div class="flex items-center justify-center font-bold text-white rounded-lg size-12 bg-gradient-to-br from-secondary to-primary">
                        {{ lecture.order }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <p class="font-bold truncate text-slate-800 dark:text-white">{{ lecture.title }}</p>
                          <span v-if="lecture.isPreview" 
                            class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-success/10 text-success">
                            Xem trước
                          </span>
                        </div>
                        <div class="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span class="flex items-center gap-1">
                            <span class="text-sm material-symbols-outlined">schedule</span>
                            {{ formatDuration(lecture.duration) }}
                          </span>
                          <span v-if="lecture.videoUrl" class="flex items-center gap-1">
                            <span class="text-sm material-symbols-outlined">play_circle</span>
                            Video
                          </span>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button @click="openEditLectureModal(lecture)"
                          class="flex items-center justify-center transition-all bg-white rounded-lg size-9 dark:bg-slate-900 text-slate-500 hover:bg-primary hover:text-white"
                          title="Chỉnh sửa">
                          <span class="text-lg material-symbols-outlined">edit</span>
                        </button>
                        <button @click="deleteLecture(lecture.id)"
                          class="flex items-center justify-center transition-all bg-white rounded-lg size-9 dark:bg-slate-900 text-slate-500 hover:bg-red-500 hover:text-white"
                          title="Xóa">
                          <span class="text-lg material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>

    <!-- Lecture Form Modal -->
    <ClientOnly>
      <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
          enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100" leave-to-class="opacity-0">
          <div v-if="showLectureFormModal"
            class="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            role="dialog" aria-modal="true" aria-labelledby="lecture-form-modal-title"
            @click.self="closeLectureFormModal">
            <Transition enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="scale-90 translate-y-4 opacity-0" enter-to-class="scale-100 translate-y-0 opacity-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="scale-100 translate-y-0 opacity-100" leave-to-class="scale-95 translate-y-4 opacity-0">
              <div v-if="showLectureFormModal"
                class="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-700 w-full max-w-2xl"
                @click.stop>
                <!-- Close Button -->
                <button type="button"
                  class="absolute z-10 flex items-center justify-center transition-all top-6 right-6 size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 group"
                  @click="closeLectureFormModal">
                  <span class="text-2xl transition-transform duration-300 material-symbols-outlined group-hover:rotate-90">close</span>
                </button>

                <!-- Header -->
                <div class="flex-shrink-0 px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                  <h3 id="lecture-form-modal-title" class="text-2xl font-bold text-slate-800 dark:text-white">
                    {{ isEditLectureMode ? 'Chỉnh sửa bài giảng' : 'Tạo bài giảng mới' }}
                  </h3>
                  <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {{ isEditLectureMode ? 'Cập nhật thông tin bài giảng' : 'Thêm bài giảng cho ' + selectedCourse?.title }}
                  </p>
                </div>

                <!-- Body -->
                <div class="flex-1 px-8 py-6 overflow-y-auto custom-scrollbar">
                  <div class="space-y-5">
                    <!-- Tiêu đề -->
                    <div>
                      <label class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <span class="text-lg material-symbols-outlined text-primary">title</span>
                        Tiêu đề bài giảng <span class="text-red-500">*</span>
                      </label>
                      <input type="text" v-model="lectureForm.title" class="w-full text-base input"
                        placeholder="VD: Bài 1: Giới thiệu về số tự nhiên" required />
                    </div>

                    <!-- Mô tả -->
                    <div>
                      <label class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <span class="text-lg material-symbols-outlined text-primary">description</span>
                        Mô tả
                      </label>
                      <textarea v-model="lectureForm.description" class="w-full text-base resize-none input" rows="3"
                        placeholder="Mô tả ngắn gọn về nội dung bài giảng..."></textarea>
                    </div>

                    <!-- Video URL -->
                    <div>
                      <label class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <span class="text-lg material-symbols-outlined text-primary">play_circle</span>
                        Video URL
                      </label>
                      <div class="flex gap-2">
                        <input type="url" v-model="lectureForm.videoUrl" class="flex-1 w-full text-base input"
                          placeholder="https://youtube.com/watch?v=..." />
                        <button @click="fetchYouTubeInfo" type="button"
                          :disabled="!lectureForm.videoUrl || isFetchingYouTubeInfo"
                          class="flex items-center gap-2 px-4 py-2 font-bold text-white transition-all shadow-lg rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed shadow-red-500/30">
                          <span class="text-xl material-symbols-outlined" :class="{ 'animate-spin': isFetchingYouTubeInfo }">
                            {{ isFetchingYouTubeInfo ? 'refresh' : 'download' }}
                          </span>
                          <span class="text-sm whitespace-nowrap">{{ isFetchingYouTubeInfo ? 'Đang tải...' : 'Lấy từ YouTube' }}</span>
                        </button>
                      </div>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-1">YouTube, Vimeo hoặc link video trực tiếp</p>
                    </div>

                    <!-- Thời lượng & Thứ tự -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <span class="text-lg material-symbols-outlined text-primary">schedule</span>
                          Thời lượng (giây) <span class="text-red-500">*</span>
                        </label>
                        <input type="number" v-model="lectureForm.duration" class="w-full text-base input"
                          placeholder="300" min="0" required />
                        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ formatDuration(lectureForm.duration || 0) }}</p>
                      </div>
                      <div>
                        <label class="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <span class="text-lg material-symbols-outlined text-primary">sort</span>
                          Thứ tự hiển thị
                        </label>
                        <input type="number" v-model="lectureForm.order" class="w-full text-base input"
                          placeholder="1" min="0" />
                      </div>
                    </div>

                    <!-- Xem trước -->
                    <div class="flex items-center justify-between p-5 border bg-gradient-to-br from-success/5 to-success/10 dark:from-success/10 dark:to-success/5 rounded-2xl border-success/20">
                      <div>
                        <p class="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                          <span class="text-lg material-symbols-outlined text-success">visibility</span>
                          Cho phép xem trước
                        </p>
                        <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Học sinh có thể xem mà không cần đăng ký</p>
                      </div>
                      <button @click="lectureForm.isPreview = !lectureForm.isPreview" type="button"
                        :class="lectureForm.isPreview ? 'bg-success shadow-lg shadow-success/30' : 'bg-slate-300 dark:bg-slate-600'"
                        class="relative inline-flex items-center w-12 transition-all duration-300 rounded-full h-7">
                        <span :class="lectureForm.isPreview ? 'translate-x-6' : 'translate-x-1'"
                          class="inline-block w-5 h-5 transition-transform duration-300 transform bg-white rounded-full shadow-md" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div class="flex-shrink-0 px-8 py-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div class="flex items-center justify-end gap-3">
                    <button @click="closeLectureFormModal"
                      class="px-6 py-3 font-bold transition-all bg-white border rounded-xl text-slate-600 dark:text-slate-400 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                      Hủy
                    </button>
                    <button @click="saveLecture" :disabled="!isLectureFormValid"
                      class="px-6 py-3 font-bold text-white transition-all rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95">
                      <span class="flex items-center gap-2">
                        <span class="text-xl material-symbols-outlined">{{ isEditLectureMode ? 'check_circle' : 'add_circle' }}</span>
                        {{ isEditLectureMode ? 'Cập nhật' : 'Tạo bài giảng' }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { AdminCourseListItem, AdminCoursesQueryParams, Subject, Grade, CourseLevel } from '~/types/course';
import type { LectureListItem, CreateLectureInput } from '~/types/lecture';
import { API_ENDPOINTS } from '~/types/api';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const { apiClient } = useApiClient();
const { toast, confirmDelete, success, error } = useSweetAlert();
const runtimeConfig = useRuntimeConfig();

const showCourseModal = ref(false);
const isEditMode = ref(false);
const editingCourseId = ref<string | null>(null);
const loading = ref(false);
const courses = ref<AdminCourseListItem[]>([]);

// Lecture management state
const showLecturesModal = ref(false);
const showLectureFormModal = ref(false);
const selectedCourse = ref<AdminCourseListItem | null>(null);
const lectures = ref<LectureListItem[]>([]);
const loadingLectures = ref(false);
const isEditLectureMode = ref(false);
const editingLectureId = ref<string | null>(null);
const isFetchingYouTubeInfo = ref(false);
const searchQuery = ref('');
const subjectFilter = ref<Subject | ''>('');
const gradeFilter = ref<Grade | ''>('');
const publishedFilter = ref<'true' | 'false' | ''>(''); // Use string to match HTML select value
const courseThumbnailInputRef = ref<HTMLInputElement | null>(null);
const isUploadingThumbnail = ref(false);

const COURSE_THUMBNAIL_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_THUMBNAIL_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const thumbnailPreviewIndex = ref(0);
const isThumbnailPreviewFailed = ref(false);

const lectureForm = ref({
  title: '',
  description: null as string | null,
  videoUrl: null as string | null,
  duration: 0,
  order: 0,
  isPreview: false,
});

const courseForm = ref({
  title: '',
  description: '',
  thumbnail: null as string | null,
  subject: 'MATH' as Subject,
  grade: 'GRADE_1' as Grade,
  level: 'BEGINNER' as CourseLevel,
  duration: 0, // Auto-calculated from lectures
  isPublished: false,
  isFree: true,
});

const apiBaseOrigin = computed(() => {
  try {
    return new URL(runtimeConfig.public.apiBaseUrl || 'http://localhost:3001/api').origin;
  } catch {
    if (process.client) {
      return window.location.origin;
    }

    return 'http://localhost:3001';
  }
});

const normalizeCourseThumbnailValue = (thumbnail: string | null | undefined): string | null => {
  if (typeof thumbnail !== 'string') {
    return null;
  }

  const rawValue = thumbnail.trim();
  if (!rawValue) {
    return null;
  }

  if (rawValue.startsWith('data:image/')) {
    return rawValue;
  }

  if (rawValue.startsWith('/uploads/')) {
    return `${apiBaseOrigin.value}${rawValue}`;
  }

  if (rawValue.startsWith('uploads/')) {
    return `${apiBaseOrigin.value}/${rawValue}`;
  }

  try {
    const parsedUrl = new URL(rawValue);
    return parsedUrl.toString();
  } catch {
    return rawValue;
  }
};

const courseThumbnailPreviewCandidates = computed(() => {
  const rawThumbnail = courseForm.value.thumbnail?.trim();
  if (!rawThumbnail) {
    return [] as string[];
  }

  const candidates: string[] = [];
  const uniqueCandidates = new Set<string>();
  const addCandidate = (value?: string | null) => {
    if (!value) {
      return;
    }

    const cleanedValue = value.trim();
    if (!cleanedValue || uniqueCandidates.has(cleanedValue)) {
      return;
    }

    uniqueCandidates.add(cleanedValue);
    candidates.push(cleanedValue);
  };

  const normalizedValue = normalizeCourseThumbnailValue(rawThumbnail);
  if (!normalizedValue) {
    return [] as string[];
  }

  if (normalizedValue.startsWith('data:image/')) {
    addCandidate(normalizedValue);
    return candidates;
  }

  try {
    const parsedUrl = new URL(normalizedValue);
    addCandidate(parsedUrl.toString());

    if (parsedUrl.pathname.startsWith('/uploads/')) {
      addCandidate(`${apiBaseOrigin.value}${parsedUrl.pathname}`);
    }

    if (process.client && (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1')) {
      const browserHost = window.location.hostname;
      if (browserHost && browserHost !== parsedUrl.hostname) {
        addCandidate(`${parsedUrl.protocol}//${browserHost}${parsedUrl.port ? `:${parsedUrl.port}` : ''}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`);
      }
    }
  } catch {
    if (normalizedValue.startsWith('/')) {
      addCandidate(`${apiBaseOrigin.value}${normalizedValue}`);
    } else {
      addCandidate(`${apiBaseOrigin.value}/${normalizedValue.replace(/^\//, '')}`);
    }
  }

  return candidates;
});

const courseThumbnailPreviewSrc = computed(() => {
  if (isThumbnailPreviewFailed.value) {
    return '';
  }

  return courseThumbnailPreviewCandidates.value[thumbnailPreviewIndex.value] || '';
});

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

// Fetch courses from API
const fetchCourses = async () => {
  loading.value = true;
  try {
    const params: AdminCoursesQueryParams = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    if (subjectFilter.value) {
      params.subject = subjectFilter.value;
    }

    if (gradeFilter.value) {
      params.grade = gradeFilter.value;
    }

    if (publishedFilter.value !== '') {
      // Convert string 'true'/'false' to boolean
      params.isPublished = publishedFilter.value === 'true';
      console.log('🔍 Filter by published status:', params.isPublished);
    }

    console.log('📤 Fetching courses with params:', params);

    const response = await apiClient.get<{ courses: AdminCourseListItem[]; pagination: typeof pagination.value }>(
      API_ENDPOINTS.COURSE.ADMIN.LIST,
      params as Record<string, string | number | boolean>
    );

    if (response.success && response.data) {
      courses.value = response.data.courses;
      pagination.value = response.data.pagination;
    }
  } catch (error: any) {
    toast(error.message || 'Không thể tải danh sách khóa học', 'error');
  } finally {
    loading.value = false;
  }
};

// Initial fetch
onMounted(() => {
  fetchCourses();
});

// Watch filters and refetch with debounce
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch([searchQuery, subjectFilter, gradeFilter, publishedFilter], () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    pagination.value.page = 1;
    fetchCourses();
  }, 300);
});

const isFormValid = computed(() => {
  return courseForm.value.title.trim() !== '' &&
    courseForm.value.description.trim().length >= 10; // Minimum 10 characters as per validation schema
    // duration is auto-calculated, no need to validate
});

const resetForm = () => {
  courseForm.value = {
    title: '',
    description: '',
    thumbnail: null,
    subject: 'MATH' as Subject,
    grade: 'GRADE_1' as Grade,
    level: 'BEGINNER' as CourseLevel,
    duration: 0, // Auto-calculated from lectures
    isPublished: false,
    isFree: true,
  };
};

const openCreateModal = () => {
  resetForm();
  isEditMode.value = false;
  editingCourseId.value = null;
  showCourseModal.value = true;
};

const openEditModal = (course: AdminCourseListItem) => {
  courseForm.value = {
    title: course.title,
    description: course.description || '',
    thumbnail: normalizeCourseThumbnailValue(course.thumbnail),
    subject: course.subject,
    grade: course.grade,
    level: course.level,
    duration: course.duration,
    isPublished: course.isPublished,
    isFree: course.isFree,
  };
  isEditMode.value = true;
  editingCourseId.value = course.id;
  showCourseModal.value = true;
};

const closeCourseModal = () => {
  // Blur active element to prevent focus warnings during modal transition
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  showCourseModal.value = false;
  resetForm();
  isEditMode.value = false;
  editingCourseId.value = null;
};

const getSubjectName = (subject: Subject) => {
  const subjects: Record<Subject, string> = {
    MATH: 'Toán',
    VIETNAMESE: 'Tiếng Việt',
    ENGLISH: 'Tiếng Anh',
    SCIENCE: 'Khoa học',
    ART: 'Mỹ thuật',
    MUSIC: 'Âm nhạc',
    PE: 'Thể dục',
    HISTORY: 'Lịch sử',
    GEOGRAPHY: 'Địa lý',
    LIFE_SKILLS: 'Kỹ năng sống',
  };
  return subjects[subject] || subject;
};

const getGradeName = (grade: Grade) => {
  const gradeNum = grade.replace('GRADE_', '');
  return gradeNum;
};

const openThumbnailFileDialog = () => {
  courseThumbnailInputRef.value?.click();
};

const resetCourseThumbnailPreview = () => {
  thumbnailPreviewIndex.value = 0;
  isThumbnailPreviewFailed.value = false;
};

const handleCourseThumbnailPreviewError = () => {
  if (thumbnailPreviewIndex.value < courseThumbnailPreviewCandidates.value.length - 1) {
    thumbnailPreviewIndex.value += 1;
    return;
  }

  isThumbnailPreviewFailed.value = true;
};

const uploadCourseThumbnail = async (file: File) => {
  if (!ALLOWED_THUMBNAIL_MIME_TYPES.has(file.type)) {
    toast('Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF', 'error');
    return;
  }

  if (file.size > COURSE_THUMBNAIL_MAX_SIZE_BYTES) {
    toast('Dung lượng ảnh tối đa là 5MB', 'error');
    return;
  }

  isUploadingThumbnail.value = true;

  try {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const response = await apiClient.post<{ url?: string; path?: string }>(
      API_ENDPOINTS.COURSE.ADMIN.UPLOAD_THUMBNAIL,
      formData
    );

    const uploadedThumbnail = response.data?.url || response.data?.path;
    if (response.success && uploadedThumbnail) {
      courseForm.value.thumbnail = normalizeCourseThumbnailValue(uploadedThumbnail);
      toast('Tải ảnh bìa lên thành công', 'success');
    }
  } catch (error: any) {
    toast(error.message || 'Không thể tải ảnh bìa lên', 'error');
  } finally {
    isUploadingThumbnail.value = false;
  }
};

const handleThumbnailFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  try {
    await uploadCourseThumbnail(file);
  } finally {
    input.value = '';
  }
};

const saveCourse = async () => {
  if (!isFormValid.value) {
    toast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
    return;
  }

  try {
    // Prepare payload without duration (auto-calculated on backend)
    // and normalize optional string fields to satisfy backend validation.
    const normalizedThumbnail = normalizeCourseThumbnailValue(courseForm.value.thumbnail);

    const { duration, ...payload } = {
      ...courseForm.value,
      title: courseForm.value.title.trim(),
      description: courseForm.value.description.trim(),
      thumbnail: normalizedThumbnail ? normalizedThumbnail : null,
    };
    
    if (isEditMode.value && editingCourseId.value) {
      // Update existing course
      const response = await apiClient.patch(
        `/courses/${editingCourseId.value}`,
        payload
      );

      if (response.success) {
        await success(
          'Cập nhật thành công!',
          'Thông tin khóa học đã được cập nhật'
        );
        closeCourseModal();
        fetchCourses();
      }
    } else {
      // Create new course
      const response = await apiClient.post(
        '/courses',
        payload
      );

      if (response.success) {
        await success(
          'Tạo khóa học thành công!',
          'Khóa học mới đã được thêm vào hệ thống'
        );
        closeCourseModal();
        fetchCourses();
      }
    }
  } catch (error: any) {
    // Debug: Log validation errors
    console.error('❌ Course creation error:', error);
    if (error.errors && Array.isArray(error.errors)) {
      console.error('📋 Validation errors:', error.errors);
      const errorMessages = error.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
      toast(`Lỗi validation: ${errorMessages}`, 'error');
    } else {
      toast(error.message || (isEditMode.value ? 'Không thể cập nhật khóa học' : 'Không thể tạo khóa học'), 'error');
    }
  }
};

watch(
  () => [courseForm.value.thumbnail, courseThumbnailPreviewCandidates.value.length],
  () => {
    resetCourseThumbnailPreview();
  }
);

const deleteCourse = async (id: string) => {
  const result = await confirmDelete(
    'Xóa khóa học?',
    'Tất cả bài giảng và dữ liệu liên quan sẽ bị xóa. Hành động này không thể hoàn tác!'
  );
  
  if (result.isConfirmed) {
    try {
      const response = await apiClient.delete(`/courses/${id}`);
      if (response.success) {
        await success(
          'Đã xóa!',
          'Khóa học đã được xóa khỏi hệ thống'
        );
        fetchCourses();
      }
    } catch (error: any) {
      toast(error.message || 'Không thể xóa khóa học', 'error');
    }
  }
};

// ==================== LECTURE MANAGEMENT ====================

const fetchLectures = async (courseId: string) => {
  loadingLectures.value = true;
  try {
    const response = await apiClient.get<LectureListItem[]>(
      API_ENDPOINTS.LECTURE.LIST_BY_COURSE(courseId)
    );

    if (response.success && response.data) {
      lectures.value = response.data;
    }
  } catch (error: any) {
    toast(error.message || 'Không thể tải danh sách bài giảng', 'error');
  } finally {
    loadingLectures.value = false;
  }
};

const openLecturesModal = async (course: AdminCourseListItem) => {
  selectedCourse.value = course;
  showLecturesModal.value = true;
  await fetchLectures(course.id);
};

const closeLecturesModal = () => {
  // Blur active element to prevent focus warnings during modal transition
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  showLecturesModal.value = false;
  selectedCourse.value = null;
  lectures.value = [];
};

const resetLectureForm = () => {
  lectureForm.value = {
    title: '',
    description: null,
    videoUrl: null,
    duration: 0,
    order: 0,
    isPreview: false,
  };
};

const openCreateLectureModal = () => {
  resetLectureForm();
  isEditLectureMode.value = false;
  editingLectureId.value = null;
  showLectureFormModal.value = true;
};

const openEditLectureModal = (lecture: LectureListItem) => {
  lectureForm.value = {
    title: lecture.title,
    description: lecture.description,
    videoUrl: lecture.videoUrl,
    duration: lecture.duration,
    order: lecture.order,
    isPreview: lecture.isPreview,
  };
  isEditLectureMode.value = true;
  editingLectureId.value = lecture.id;
  showLectureFormModal.value = true;
  
  // Hide lectures modal temporarily when editing
  // It will be re-shown after save/cancel
};

const closeLectureFormModal = () => {
  // Blur active element to prevent focus warnings during modal transition
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  showLectureFormModal.value = false;
  resetLectureForm();
  isEditLectureMode.value = false;
  editingLectureId.value = null;
};

const isLectureFormValid = computed(() => {
  return lectureForm.value.title.trim() !== '' && lectureForm.value.duration > 0;
});

// Fetch YouTube video info
const fetchYouTubeInfo = async () => {
  if (!lectureForm.value.videoUrl) {
    toast('Vui lòng nhập YouTube URL trước', 'error');
    return;
  }

  isFetchingYouTubeInfo.value = true;
  
  try {
    const response = await apiClient.get<{ videoId: string; title: string; duration: number; thumbnail: string; channelTitle: string }>(
      API_ENDPOINTS.YOUTUBE.VIDEO_INFO,
      { url: lectureForm.value.videoUrl }
    );

    if (response.success && response.data) {
      // YouTube API returns duration in SECONDS
      // Save directly as seconds (no conversion)
      lectureForm.value.duration = response.data.duration;
      
      // Auto-fill title if empty
      if (!lectureForm.value.title.trim()) {
        lectureForm.value.title = response.data.title;
      }
      
      success(
        'Đã lấy thông tin video thành công!', 
        `Thời lượng: ${formatDuration(response.data.duration)}`
      );
    }
  } catch (error: any) {
    toast(error.message || 'Không thể lấy thông tin video từ YouTube', 'error');
  } finally {
    isFetchingYouTubeInfo.value = false;
  }
};

const saveLecture = async () => {
  if (!isLectureFormValid.value || !selectedCourse.value) {
    toast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
    return;
  }

  try {
    if (isEditLectureMode.value && editingLectureId.value) {
      // Update existing lecture
      const response = await apiClient.patch(
        API_ENDPOINTS.LECTURE.UPDATE(editingLectureId.value),
        lectureForm.value
      );

      if (response.success) {
        // Save courseId before closing modal to prevent null reference
        const courseId = selectedCourse.value.id;
        closeLectureFormModal();
        
        await success(
          'Cập nhật thành công!',
          'Bài giảng đã được cập nhật'
        );
        
        await fetchLectures(courseId);
        await fetchCourses(); // Refresh course list to update lecture count
      }
    } else {
      // Create new lecture
      const payload: CreateLectureInput = {
        courseId: selectedCourse.value.id,
        ...lectureForm.value,
      };
      
      const response = await apiClient.post(
        API_ENDPOINTS.LECTURE.CREATE,
        payload
      );

      if (response.success) {
        // Save courseId before closing modal to prevent null reference
        const courseId = selectedCourse.value.id;
        closeLectureFormModal();
        
        await success(
          'Tạo bài giảng thành công!',
          'Bài giảng mới đã được thêm vào khóa học'
        );
        
        await fetchLectures(courseId);
        await fetchCourses(); // Refresh course list to update lecture count
      }
    }
  } catch (error: any) {
    toast(error.message || (isEditLectureMode.value ? 'Không thể cập nhật bài giảng' : 'Không thể tạo bài giảng'), 'error');
  }
};

const deleteLecture = async (id: string) => {
  const result = await confirmDelete(
    'Xóa bài giảng?',
    'Tiến trình học của học sinh sẽ bị ảnh hưởng. Hành động này không thể hoàn tác!'
  );
  
  if (result.isConfirmed) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.LECTURE.DELETE(id));
      if (response.success && selectedCourse.value) {
        await success(
          'Đã xóa!',
          'Bài giảng đã được xóa khỏi khóa học'
        );
        await fetchLectures(selectedCourse.value.id);
        await fetchCourses(); // Refresh course list to update lecture count
      }
    } catch (error: any) {
      toast(error.message || 'Không thể xóa bài giảng', 'error');
    }
  }
};

/**
 * Format seconds to MM:SS display
 * Examples:
 * - 88 seconds → "1:28"
 * - 444 seconds → "7:24"
 * - 482 seconds → "8:02"
 */
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

useHead({
  title: 'Quản lý Khóa học - Admin',
});
</script>
