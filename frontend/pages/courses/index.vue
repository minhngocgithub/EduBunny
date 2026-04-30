<template>
  <div class="min-h-screen transition-colors duration-300 bg-background dark:bg-slate-950">
    <LayoutAppNavbar />

    <div class="fixed inset-0 pointer-events-none opacity-40 -z-10">
      <div class="absolute top-[-10%] left-[-10%] size-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-[-10%] right-[-10%] size-96 bg-secondary/20 rounded-full blur-3xl"></div>
    </div>

    <div class="px-4 pt-24 pb-16 mx-auto sm:px-6 lg:px-8 max-w-7xl">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-10">
        <div class="flex items-center gap-4">
          <NuxtLink to="/dashboard"
            class="flex items-center justify-center transition-all rounded-2xl size-12 bg-white/90 dark:bg-slate-900 hover:-translate-y-0.5"
            style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
            <span class="text-2xl material-symbols-outlined text-gray-700 dark:text-slate-300">arrow_back</span>
          </NuxtLink>
          <div>
            <h1 class="text-3xl font-light text-gray-800 sm:text-4xl font-display dark:text-white">
              Khoa hoc
            </h1>
            <p class="mt-2 text-base text-gray-600 sm:text-lg dark:text-slate-400">
              Kham pha cac khoa hoc phu hop voi lop hoc cua ban
            </p>
          </div>
        </div>
      </div>

      <div class="relative mb-6 sm:mb-8">
        <span class="absolute text-2xl -translate-y-1/2 text-primary material-symbols-outlined left-5 top-1/2">
          search
        </span>
        <input v-model="searchQuery" type="text" placeholder="Tim kiem khoa hoc thu vi..."
          class="w-full py-4 pl-16 pr-6 text-base sm:text-lg transition-all border border-white/80 dark:border-white/5 text-gray-700 dark:text-white bg-white/90 dark:bg-slate-900 rounded-2xl sm:rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary" />
      </div>

      <div class="mb-6">
        <h2 class="mb-4 text-lg font-light text-gray-900 dark:text-white font-display">Chon lop hoc</h2>
        <div class="flex flex-wrap gap-3">
          <button @click="selectedGrade = ''"
            :class="selectedGrade === ''
              ? 'bg-primary text-white'
              : 'bg-white/90 dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-primary/10 dark:hover:bg-slate-800'"
            class="px-5 py-2.5 text-sm font-medium transition-all rounded-full"
            style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
            Tat ca
          </button>
          <button v-for="grade in grades" :key="grade.value" @click="selectedGrade = grade.value"
            :class="selectedGrade === grade.value
              ? 'bg-primary text-white'
              : 'bg-white/90 dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-primary/10 dark:hover:bg-slate-800'"
            class="px-5 py-2.5 text-sm font-medium transition-all rounded-full"
            style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
            {{ grade.label }}
          </button>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="mb-4 text-lg font-light text-gray-900 dark:text-white font-display">Mon hoc</h2>
        <div class="flex flex-wrap gap-3">
          <button @click="selectedSubject = ''"
            :class="selectedSubject === ''
              ? 'bg-secondary text-white'
              : 'bg-white/90 dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-secondary/10 dark:hover:bg-slate-800'"
            class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all rounded-full"
            style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
            <span>Tat ca</span>
          </button>
          <button v-for="subject in subjects" :key="subject.value" @click="selectedSubject = subject.value"
            :class="selectedSubject === subject.value
              ? 'bg-secondary text-white'
              : 'bg-white/90 dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-secondary/10 dark:hover:bg-slate-800'"
            class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all rounded-full"
            style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
            <span>{{ subject.label }}</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i"
          class="overflow-hidden bg-white/90 dark:bg-slate-900 rounded-3xl animate-pulse"
          style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
          <div class="h-40 bg-gradient-to-br from-primary/10 via-white to-secondary/10 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800"></div>
          <div class="p-5 space-y-3">
            <div class="h-6 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
            <div class="h-4 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
            <div class="w-2/3 h-4 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
          </div>
        </div>
      </div>

      <div v-else-if="filteredCourses.length === 0"
        class="py-20 text-center bg-white/90 dark:bg-slate-900 rounded-3xl"
        style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
        <span class="block mb-4 text-6xl text-primary material-symbols-outlined">menu_book</span>
        <h3 class="mb-2 text-2xl font-light text-gray-900 dark:text-slate-200" style="font-family: 'Waldenburg', sans-serif">
          Khong tim thay khoa hoc
        </h3>
        <p class="text-base text-gray-600 dark:text-slate-400" style="letter-spacing: 0.16px">
          Thu thay doi bo loc hoac tim kiem bang tu khoa khac.
        </p>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-light text-gray-900 dark:text-white font-display">
            {{ sectionTitle }}
          </h2>
          <p class="text-base text-gray-600 dark:text-slate-400" style="letter-spacing: 0.14px">
            {{ filteredCourses.length }} khoa hoc
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="course in paginatedCourses" :key="course.id" @click="handleCourseClick(course)"
            class="overflow-hidden transition-all duration-300 cursor-pointer group bg-white/90 dark:bg-slate-900 rounded-3xl hover:-translate-y-1"
            :class="{ 'opacity-60': course.isPublished === false }"
            style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
            <div
              class="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 via-white to-secondary/10 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
              <img v-if="getCourseThumbnailSrc(course)" :src="getCourseThumbnailSrc(course) || ''" :alt="course.title"
                class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
              <div v-else class="flex items-center justify-center w-full h-full text-5xl font-light" style="font-family: 'Waldenburg', sans-serif">
                <div class="flex items-center justify-center rounded-full size-20 bg-white/80 dark:bg-slate-800/90"
                  style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px">
                  {{ getSubjectIcon(course.subject) }}
                </div>
              </div>

              <div v-if="course.isPublished === false"
                class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-sm">
                <span class="text-5xl text-white material-symbols-outlined drop-shadow-lg">lock</span>
                <span class="px-3 py-1.5 text-xs font-medium text-white rounded-full bg-primary"
                  style="box-shadow: rgba(0,0,0,0.4) 0px 0px 1px, rgba(0,0,0,0.04) 0px 4px 4px">Sap ra mat</span>
              </div>

              <div class="absolute top-3 left-3">
                <span class="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 rounded-full bg-white/90 dark:bg-slate-800/90"
                  style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px">
                  {{ getGradeName(course.grade) }}
                </span>
              </div>

              <div v-if="course.isFree" class="absolute top-3 right-3">
                <span class="px-3 py-1.5 text-xs font-medium text-white rounded-full bg-secondary"
                  style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px">
                  Mien phi
                </span>
              </div>

              <div v-if="hasLearningProgress(course)" class="absolute bottom-0 left-0 right-0 h-1 bg-white/50 dark:bg-slate-700">
                <div class="h-full bg-gradient-to-r from-primary to-secondary"
                  :style="{ width: `${getCourseProgress(course)}%` }"></div>
              </div>
            </div>

            <div class="p-5">
              <button v-if="course.isEnrolled && hasLearningProgress(course)"
                class="w-full px-4 py-2.5 mb-3 text-sm font-medium text-white transition-all rounded-full bg-primary"
                style="box-shadow: rgba(0,0,0,0.4) 0px 0px 1px, rgba(0,0,0,0.04) 0px 4px 4px">
                Tiep tuc hoc - {{ getCourseProgress(course) }}%
              </button>
              <button v-else-if="course.isEnrolled"
                class="w-full px-4 py-2.5 mb-3 text-sm font-medium text-white transition-all rounded-full bg-primary"
                style="box-shadow: rgba(0,0,0,0.4) 0px 0px 1px, rgba(0,0,0,0.04) 0px 4px 4px">
                Vao hoc ngay
              </button>
              <button v-else-if="course.isPublished !== false"
                class="w-full px-4 py-2.5 mb-3 text-sm font-medium transition-all rounded-full bg-white/90 dark:bg-slate-900 text-gray-700 dark:text-slate-300"
                style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
                Dang ky hoc
              </button>

              <h3
                class="mb-3 text-lg font-light leading-tight transition-colors text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary dark:group-hover:text-secondary"
                style="font-family: 'Waldenburg', sans-serif">
                {{ course.title }}
              </h3>

              <div v-if="typeof course.avgRating === 'number'" class="flex items-center gap-2 mb-3">
                <div class="flex items-center gap-1">
                  <span class="text-sm text-yellow-500 material-symbols-outlined">star</span>
                  <span class="text-sm font-bold text-gray-800 dark:text-white">{{ course.avgRating.toFixed(1) }}</span>
                </div>
                <span class="text-xs text-gray-500 dark:text-slate-400">({{ course.reviewCount }})</span>
              </div>

              <div class="flex items-center justify-between pt-3 text-xs text-gray-500 border-t dark:text-slate-400" style="border-color: rgba(0,0,0,0.05)">
                <div class="flex items-center gap-1">
                  <span class="text-sm material-symbols-outlined">schedule</span>
                  <span class="text-sm">{{ formatDuration(course.duration) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-sm material-symbols-outlined">people</span>
                  <span class="text-sm">{{ course.enrollmentCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-12">
          <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
            class="flex items-center justify-center transition-all rounded-2xl size-12 bg-white/90 dark:bg-slate-900 hover:bg-primary/10 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
            <span class="text-2xl material-symbols-outlined">chevron_left</span>
          </button>

          <div class="flex gap-2">
            <button v-for="page in visiblePages" :key="page" @click="currentPage = page"
              class="flex items-center justify-center text-base font-medium transition-all rounded-2xl size-12"
              :class="page === currentPage
                ? 'bg-primary text-white'
                : 'bg-white/90 dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-primary/10 dark:hover:bg-slate-800'"
              style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
              {{ page }}
            </button>
          </div>

          <button @click="currentPage = Math.max(1, currentPage + 1)" :disabled="currentPage === totalPages"
            class="flex items-center justify-center transition-all rounded-2xl size-12 bg-white/90 dark:bg-slate-900 hover:bg-primary/10 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
            <span class="text-2xl material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <div v-if="showForYouSection" class="mt-20">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-light text-gray-900 dark:text-white font-display">Danh cho ban</h2>
            <p class="text-sm text-gray-600 dark:text-slate-400" style="letter-spacing: 0.14px">
              {{ isStudentLoggedIn ? 'Ca nhan hoa theo tien do hoc' : 'Goi y noi bat cho khach' }}
            </p>
          </div>

          <ClientOnly>
            <div v-if="isStudentLoggedIn" class="space-y-5">
              <div v-if="forYouLoading"
                class="p-6 bg-white/90 dark:bg-slate-900 rounded-3xl animate-pulse"
                style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
                <div class="h-6 mb-3 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                <div class="w-2/3 h-4 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
              </div>

              <div v-else-if="forYouError"
                class="p-6 bg-white/90 dark:bg-slate-900 rounded-3xl"
                style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
                <p class="font-medium text-gray-700 dark:text-slate-300">{{ forYouError }}</p>
              </div>

              <div v-else class="space-y-5">
                <button v-if="nextLearningItem" @click="handleNextLearningClick"
                  class="w-full p-6 text-left transition-all bg-white/90 dark:bg-slate-900 rounded-3xl hover:-translate-y-1"
                  style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
                  <p class="mb-1 text-xs font-medium tracking-wide uppercase text-primary">Tiep theo nen hoc</p>
                  <h3 class="text-xl font-light text-gray-900 dark:text-white" style="font-family: 'Waldenburg', sans-serif">{{ nextLearningItem.item.title }}</h3>
                  <p class="mt-2 text-sm text-gray-600 dark:text-slate-400">{{ nextLearningItem.reason }}</p>
                </button>

                <div v-if="personalizedRecommendations.length > 0"
                  class="p-6 bg-white/90 dark:bg-slate-900 rounded-3xl"
                  style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
                  <p class="mb-4 text-lg font-light text-gray-900 dark:text-white" style="font-family: 'Waldenburg', sans-serif">Goi y ca nhan</p>
                  <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <button v-for="rec in personalizedRecommendations" :key="rec.course.id"
                      @click="goToCourseFromRecommendation(rec.course.id, rec.course.slug)"
                      class="p-4 text-left transition-all rounded-2xl bg-white/90 dark:bg-slate-900 hover:bg-primary/5 dark:hover:bg-slate-800"
                      style="box-shadow: rgba(0,0,0,0.05) 0px 0px 0px 1px">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ rec.course.title }}</p>
                      <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">{{ getRecommendationLabel(rec.category) }} - {{ rec.reason }}</p>
                    </button>
                  </div>
                </div>

                <div v-if="reinforcementRecommendation"
                  class="p-6 bg-white/90 dark:bg-slate-900 rounded-3xl"
                  style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
                  <p class="mb-2 text-sm font-medium tracking-wide uppercase text-secondary">On tap de xuat</p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    Mon: {{ getSubjectName(reinforcementRecommendation.subject) }}
                  </p>
                  <p class="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    Can cung co: {{ reinforcementRecommendation.weakAreas.join(', ') || 'Nen tang cuong bai tap co ban' }}
                  </p>
                </div>

                <div v-if="challengeRecommendations.length > 0"
                  class="p-6 bg-white/90 dark:bg-slate-900 rounded-3xl"
                  style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
                  <p class="mb-4 text-lg font-light text-gray-900 dark:text-white" style="font-family: 'Waldenburg', sans-serif">Thu thach tiep theo</p>
                  <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <button v-for="item in challengeRecommendations" :key="item.course.id"
                      @click="goToCourseFromRecommendation(item.course.id, item.course.slug)"
                      class="p-3 text-left transition-all rounded-xl bg-white/90 dark:bg-slate-900 hover:bg-secondary/5 dark:hover:bg-slate-800"
                      style="box-shadow: rgba(0,0,0,0.05) 0px 0px 0px 1px">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ item.course.title }}</p>
                      <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">{{ item.reason }}</p>
                    </button>
                  </div>
                </div>

                <div v-if="!hasAnyForYouData"
                  class="p-6 bg-white/90 dark:bg-slate-900 rounded-3xl"
                  style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
                  <p class="font-medium text-gray-700 dark:text-slate-300">
                    Chua du du lieu ca nhan. Hay hoc them de he thong goi y chinh xac hon.
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button v-for="course in fallbackFeaturedCourses" :key="course.id" @click="handleCourseClick(course)"
                class="p-5 text-left transition-all bg-white/90 dark:bg-slate-900 rounded-3xl hover:-translate-y-1"
                style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
                <p class="mb-2 text-xs font-medium tracking-wide uppercase text-primary">Noi bat</p>
                <h3 class="text-lg font-light text-gray-900 dark:text-white line-clamp-2" style="font-family: 'Waldenburg', sans-serif">{{ course.title }}</h3>
                <p class="mt-2 text-sm text-gray-600 dark:text-slate-400">
                  {{ getSubjectName(course.subject) }} - {{ getGradeName(course.grade) }}
                </p>
              </button>
            </div>

            <template #fallback>
              <div
                class="p-6 bg-white/90 dark:bg-slate-900 rounded-3xl"
                style="box-shadow: rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px">
                <p class="font-medium text-gray-700 dark:text-slate-300">Dang tai goi y...</p>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LocationQuery, LocationQueryRaw } from 'vue-router';
import type { CourseListItem, Subject, Grade } from '~/types/course';
import type {
  RecommendationResult,
  NextLearningItem,
  ReinforcementRecommendation,
  CourseRecommendation,
} from '~/types/recommendation';
import { API_ENDPOINTS } from '~/types/api';

definePageMeta({
  middleware: [],
});

const { apiClient } = useApiClient();
const { toast } = useSweetAlert();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const runtimeConfig = useRuntimeConfig();

const apiBaseOrigin = computed(() => {
  try {
    return new URL(String(runtimeConfig.public.apiBaseUrl || 'http://localhost:3001/api')).origin;
  } catch {
    if (process.client) {
      return window.location.origin;
    }

    return 'http://localhost:3001';
  }
});

const itemsPerPage = 12;
const isApplyingRouteQuery = ref(false);
const hasLoadedForYou = ref(false);

const subjects = [
  { value: 'SCIENCE' as Subject, label: 'Khoa hoc' },
  { value: 'MATH' as Subject, label: 'Toan hoc' },
  { value: 'ART' as Subject, label: 'My thuat' },
  { value: 'ENGLISH' as Subject, label: 'Tieng Anh' },
  { value: 'VIETNAMESE' as Subject, label: 'Tieng Viet' },
  { value: 'MUSIC' as Subject, label: 'Am nhac' },
];

const grades = [
  { value: 'GRADE_1' as Grade, label: 'Lop 1' },
  { value: 'GRADE_2' as Grade, label: 'Lop 2' },
  { value: 'GRADE_3' as Grade, label: 'Lop 3' },
  { value: 'GRADE_4' as Grade, label: 'Lop 4' },
  { value: 'GRADE_5' as Grade, label: 'Lop 5' },
];

const subjectValues = subjects.map((item) => item.value);
const gradeValues = grades.map((item) => item.value);

const parseEnumQuery = <T extends string>(value: unknown, allowed: readonly T[]): T | '' => {
  if (typeof value !== 'string') return '';
  return allowed.includes(value as T) ? (value as T) : '';
};

const parsePageQuery = (value: unknown): number => {
  if (typeof value !== 'string') return 1;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const selectedSubject = ref<Subject | ''>(parseEnumQuery(route.query.subject, subjectValues));
const selectedGrade = ref<Grade | ''>(parseEnumQuery(route.query.grade, gradeValues));
const searchQuery = ref(typeof route.query.search === 'string' ? route.query.search : '');
const currentPage = ref(parsePageQuery(route.query.page));

const normalizeQuery = (query: LocationQuery | LocationQueryRaw): Record<string, string> => {
  const normalized: Record<string, string> = {};

  Object.keys(query).forEach((key) => {
    const rawValue = (query as Record<string, unknown>)[key];

    if (Array.isArray(rawValue)) {
      const firstValue = rawValue[0];
      if (typeof firstValue === 'string' && firstValue.length > 0) {
        normalized[key] = firstValue;
      }
      return;
    }

    if (typeof rawValue === 'string' && rawValue.length > 0) {
      normalized[key] = rawValue;
      return;
    }

    if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
      normalized[key] = String(rawValue);
    }
  });

  return normalized;
};

const buildQuery = (): LocationQueryRaw => {
  const query: LocationQueryRaw = {};

  if (selectedSubject.value) {
    query.subject = selectedSubject.value;
  }

  if (selectedGrade.value) {
    query.grade = selectedGrade.value;
  }

  if (searchQuery.value.trim()) {
    query.search = searchQuery.value.trim();
  }

  if (currentPage.value > 1) {
    query.page = String(currentPage.value);
  }

  return query;
};

const applyRouteQueryToState = (query: LocationQuery) => {
  selectedSubject.value = parseEnumQuery(query.subject, subjectValues);
  selectedGrade.value = parseEnumQuery(query.grade, gradeValues);
  searchQuery.value = typeof query.search === 'string' ? query.search : '';
  currentPage.value = parsePageQuery(query.page);
};

watch(
  () => route.query,
  (query) => {
    if (isApplyingRouteQuery.value) {
      return;
    }

    applyRouteQueryToState(query);
  }
);

watch([selectedSubject, selectedGrade, searchQuery], () => {
  currentPage.value = 1;
});

watch([selectedSubject, selectedGrade, searchQuery, currentPage], async () => {
  if (isApplyingRouteQuery.value) {
    return;
  }

  const nextQuery = buildQuery();
  const currentNormalized = normalizeQuery(route.query);
  const nextNormalized = normalizeQuery(nextQuery);

  if (JSON.stringify(currentNormalized) === JSON.stringify(nextNormalized)) {
    return;
  }

  isApplyingRouteQuery.value = true;
  try {
    await router.replace({ query: nextQuery });
  } finally {
    isApplyingRouteQuery.value = false;
  }
});

const { data: coursesData, pending, error: listError } = await useAsyncData<CourseListItem[]>(
  'courses-list-public',
  async () => {
    const response = await apiClient.get<CourseListItem[]>(
      API_ENDPOINTS.COURSE.LIST,
      { page: 1, limit: 100 },
      false
    );

    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  },
  {
    default: () => [],
  }
);

watch(
  () => listError.value,
  (error) => {
    if (error && process.client) {
      toast('Khong the tai danh sach khoa hoc', 'error');
    }
  },
  { immediate: true }
);

const courses = computed(() => (Array.isArray(coursesData.value) ? coursesData.value : []));
const loading = computed(() => pending.value);

const filteredCourses = computed(() => {
  let result = [...courses.value];

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase();
    result = result.filter((course) => {
      return (
        course.title.toLowerCase().includes(query) ||
        (course.description || '').toLowerCase().includes(query)
      );
    });
  }

  if (selectedSubject.value) {
    result = result.filter((course) => course.subject === selectedSubject.value);
  }

  if (selectedGrade.value) {
    result = result.filter((course) => course.grade === selectedGrade.value);
  }

  return result;
});

const totalPages = computed(() => {
  const total = Math.ceil(filteredCourses.value.length / itemsPerPage);
  return Math.max(1, total);
});

const paginatedCourses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredCourses.value.slice(start, end);
});

watch(
  () => totalPages.value,
  (maxPage) => {
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage;
    }

    if (currentPage.value < 1) {
      currentPage.value = 1;
    }
  },
  { immediate: true }
);

const visiblePages = computed(() => {
  const pages: number[] = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let page = 1; page <= total; page += 1) {
      pages.push(page);
    }
    return pages;
  }

  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (!pages.includes(1)) {
    pages.unshift(1);
  }

  if (!pages.includes(total)) {
    pages.push(total);
  }

  return Array.from(new Set(pages));
});

const getSubjectName = (subject: Subject): string => {
  const names: Record<Subject, string> = {
    MATH: 'Toan hoc',
    VIETNAMESE: 'Tieng Viet',
    ENGLISH: 'Tieng Anh',
    SCIENCE: 'Khoa hoc',
    ART: 'My thuat',
    MUSIC: 'Am nhac',
    PE: 'The duc',
    HISTORY: 'Lich su',
    GEOGRAPHY: 'Dia ly',
    LIFE_SKILLS: 'Ky nang song',
  };
  return names[subject] || subject;
};

const getGradeName = (grade: Grade): string => {
  const names: Record<Grade, string> = {
    GRADE_1: 'Lop 1',
    GRADE_2: 'Lop 2',
    GRADE_3: 'Lop 3',
    GRADE_4: 'Lop 4',
    GRADE_5: 'Lop 5',
  };
  return names[grade] || grade;
};

const sectionTitle = computed(() => {
  if (selectedSubject.value && selectedGrade.value) {
    return `${getSubjectName(selectedSubject.value)} - ${getGradeName(selectedGrade.value)}`;
  }

  if (selectedSubject.value) {
    return getSubjectName(selectedSubject.value);
  }

  if (selectedGrade.value) {
    return `Khoa hoc ${getGradeName(selectedGrade.value)}`;
  }

  if (searchQuery.value.trim()) {
    return `Ket qua tim kiem: "${searchQuery.value.trim()}"`;
  }

  return 'Tat ca khoa hoc';
});

const getSubjectIcon = (subject: Subject): string => {
  const icons: Record<Subject, string> = {
    MATH: 'M',
    VIETNAMESE: 'V',
    ENGLISH: 'E',
    SCIENCE: 'S',
    ART: 'A',
    MUSIC: 'U',
    PE: 'P',
    HISTORY: 'H',
    GEOGRAPHY: 'G',
    LIFE_SKILLS: 'L',
  };
  return icons[subject] || 'C';
};

const resolveCourseThumbnail = (thumbnail: string | null | undefined): string | null => {
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

const getCourseThumbnailSrc = (course: CourseListItem): string | null => {
  return resolveCourseThumbnail(course.thumbnail);
};

const getCourseProgress = (course: CourseListItem): number => {
  if (typeof course.learningProgress !== 'number') {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(course.learningProgress)));
};

const hasLearningProgress = (course: CourseListItem): boolean => {
  return getCourseProgress(course) > 0;
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phut`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}p` : `${hours} gio`;
};

const getCoursePath = (courseId: string, slug?: string | null): string => {
  return `/courses/${slug || courseId}`;
};

const handleCourseClick = async (course: CourseListItem) => {
  if (course.isPublished === false) {
    toast('Khoa hoc sap duoc ra mat. Hay quay lai sau nhe!', 'info');
    return;
  }

  await router.push(getCoursePath(course.id, course.slug));
};

const showForYouSection = computed(() => {
  return (
    selectedSubject.value === '' &&
    selectedGrade.value === '' &&
    searchQuery.value.trim() === '' &&
    filteredCourses.value.length > 0
  );
});

const isStudentLoggedIn = computed(() => {
  return process.client && authStore.isLoggedIn && authStore.userRole === 'STUDENT';
});

const getFeaturedScore = (course: CourseListItem): number => {
  const rating = typeof course.avgRating === 'number' ? course.avgRating : 0;
  const reviews = Number(course.reviewCount || 0);
  const enrollments = Number(course.enrollmentCount || 0);
  const enrolledBoost = course.isEnrolled ? 25 : 0;

  return rating * 20 + reviews * 1.5 + enrollments * 0.2 + enrolledBoost;
};

const fallbackFeaturedCourses = computed(() => {
  return [...filteredCourses.value]
    .sort((a, b) => getFeaturedScore(b) - getFeaturedScore(a))
    .slice(0, 3);
});

const forYouLoading = ref(false);
const forYouError = ref('');
const nextLearningItem = ref<NextLearningItem | null>(null);
const personalizedRecommendations = ref<CourseRecommendation[]>([]);
const reinforcementRecommendation = ref<ReinforcementRecommendation | null>(null);
const challengeRecommendations = ref<CourseRecommendation[]>([]);

type RecommendationListPayload = RecommendationResult | CourseRecommendation[] | null | undefined;
type ReinforcementPayload = ReinforcementRecommendation | ReinforcementRecommendation[] | null | undefined;

const parseRecommendationList = (payload: RecommendationListPayload): CourseRecommendation[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload.recommendations) ? payload.recommendations : [];
};

const parseReinforcementRecommendation = (payload: ReinforcementPayload): ReinforcementRecommendation | null => {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  return payload;
};

const hasAnyForYouData = computed(() => {
  return Boolean(
    nextLearningItem.value ||
    personalizedRecommendations.value.length > 0 ||
    reinforcementRecommendation.value ||
    challengeRecommendations.value.length > 0
  );
});

const resetForYouState = () => {
  forYouLoading.value = false;
  forYouError.value = '';
  hasLoadedForYou.value = false;
  nextLearningItem.value = null;
  personalizedRecommendations.value = [];
  reinforcementRecommendation.value = null;
  challengeRecommendations.value = [];
};

const isAuthError = (error: unknown): boolean => {
  const statusCode =
    typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof (error as { statusCode?: unknown }).statusCode === 'number'
      ? (error as { statusCode: number }).statusCode
      : 0;

  return statusCode === 401 || statusCode === 403;
};

const fetchForYouData = async () => {
  if (!isStudentLoggedIn.value || !showForYouSection.value || forYouLoading.value || hasLoadedForYou.value) {
    return;
  }

  forYouLoading.value = true;
  forYouError.value = '';

  try {
    const [nextResult, recommendationResult, reinforcementResult, challengeResult] = await Promise.allSettled([
      apiClient.get<NextLearningItem | null>(API_ENDPOINTS.RECOMMENDATION.NEXT),
      apiClient.get<RecommendationResult>(API_ENDPOINTS.RECOMMENDATION.LIST, { limit: 6 }),
      apiClient.get<ReinforcementRecommendation[] | ReinforcementRecommendation>(API_ENDPOINTS.RECOMMENDATION.REINFORCEMENT),
      apiClient.get<RecommendationResult | CourseRecommendation[]>(API_ENDPOINTS.RECOMMENDATION.CHALLENGE, { limit: 3 }),
    ]);

    const hasAuthFailure = [nextResult, recommendationResult, reinforcementResult, challengeResult].some(
      (result) => result.status === 'rejected' && isAuthError(result.reason)
    );

    if (hasAuthFailure) {
      forYouError.value = 'Vui long dang nhap bang tai khoan hoc sinh de xem goi y ca nhan.';
      return;
    }

    if (nextResult.status === 'fulfilled' && nextResult.value.success) {
      nextLearningItem.value = nextResult.value.data || null;
    }

    if (recommendationResult.status === 'fulfilled' && recommendationResult.value.success) {
      personalizedRecommendations.value = parseRecommendationList(recommendationResult.value.data);
    }

    if (reinforcementResult.status === 'fulfilled' && reinforcementResult.value.success) {
      reinforcementRecommendation.value = parseReinforcementRecommendation(reinforcementResult.value.data);
    }

    if (challengeResult.status === 'fulfilled' && challengeResult.value.success) {
      challengeRecommendations.value = parseRecommendationList(challengeResult.value.data);
    }

    if (!hasAnyForYouData.value) {
      forYouError.value = 'Chua co du du lieu de tao goi y ca nhan.';
    }

    hasLoadedForYou.value = true;
  } catch {
    forYouError.value = 'Khong the tai goi y ca nhan ngay luc nay.';
  } finally {
    forYouLoading.value = false;
  }
};

watch(
  () => [isStudentLoggedIn.value, showForYouSection.value],
  ([isStudent, shouldShow]) => {
    if (!isStudent) {
      resetForYouState();
      return;
    }

    if (shouldShow) {
      void fetchForYouData();
    }
  },
  { immediate: true }
);

const goToCourseFromRecommendation = async (courseId: string, slug?: string | null) => {
  await router.push(getCoursePath(courseId, slug));
};

const handleNextLearningClick = async () => {
  if (!nextLearningItem.value) {
    return;
  }

  if (nextLearningItem.value.type === 'lecture' && nextLearningItem.value.item.courseId) {
    await router.push(`/courses/${nextLearningItem.value.item.courseId}`);
    return;
  }

  await router.push(`/courses/${nextLearningItem.value.item.id}`);
};

const getRecommendationLabel = (category: CourseRecommendation['category']): string => {
  switch (category) {
    case 'grade_match':
      return 'Dung lop';
    case 'popular':
      return 'Pho bien';
    case 'challenge':
      return 'Thu thach';
    case 'reinforcement':
      return 'On tap';
    default:
      return 'Goi y';
  }
};

const normalizeBaseUrl = (value: string): string => {
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const siteUrl = computed(() => {
  return normalizeBaseUrl(String(runtimeConfig.public.siteUrl || 'http://localhost:3000'));
});

const canonicalUrl = computed(() => {
  const url = new URL('/courses', `${siteUrl.value}/`);

  if (selectedSubject.value) {
    url.searchParams.set('subject', selectedSubject.value);
  }

  if (selectedGrade.value) {
    url.searchParams.set('grade', selectedGrade.value);
  }

  if (searchQuery.value.trim()) {
    url.searchParams.set('search', searchQuery.value.trim());
  }

  if (currentPage.value > 1) {
    url.searchParams.set('page', String(currentPage.value));
  }

  return url.toString();
});

const seoTitle = computed(() => {
  if (sectionTitle.value === 'Tat ca khoa hoc') {
    return 'Khoa hoc cho hoc sinh tieu hoc | EduForKids';
  }
  return `${sectionTitle.value} | EduForKids`;
});

const seoDescription = computed(() => {
  const parts = ['Kham pha khoa hoc danh cho hoc sinh tieu hoc tren EduForKids'];

  if (selectedGrade.value) {
    parts.push(`loc theo ${getGradeName(selectedGrade.value)}`);
  }

  if (selectedSubject.value) {
    parts.push(`mon ${getSubjectName(selectedSubject.value)}`);
  }

  if (searchQuery.value.trim()) {
    parts.push(`tu khoa ${searchQuery.value.trim()}`);
  }

  return `${parts.join(', ')}.`;
});

const itemListJsonLd = computed(() => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Danh sach khoa hoc EduForKids',
    numberOfItems: paginatedCourses.value.length,
    itemListElement: paginatedCourses.value.map((course, index) => ({
      '@type': 'ListItem',
      position: (currentPage.value - 1) * itemsPerPage + index + 1,
      name: course.title,
      url: `${siteUrl.value}${getCoursePath(course.id, course.slug)}`,
    })),
  };
});

useHead(() => ({
  title: seoTitle.value,
  meta: [
    {
      name: 'description',
      content: seoDescription.value,
    },
    {
      property: 'og:title',
      content: seoTitle.value,
    },
    {
      property: 'og:description',
      content: seoDescription.value,
    },
    {
      property: 'og:url',
      content: canonicalUrl.value,
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl.value,
    },
  ],
  script: [
    {
      key: 'courses-itemlist-jsonld',
      type: 'application/ld+json',
      children: JSON.stringify(itemListJsonLd.value),
    },
  ],
}));
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

html {
  scroll-behavior: smooth;
}
</style>