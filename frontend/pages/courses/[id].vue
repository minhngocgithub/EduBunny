<script setup lang="ts">
import type { CourseDetail, CourseDetailLecture, Subject, Grade } from '~/types/course';
import type { LectureListItem } from '~/types/lecture';
import { API_ENDPOINTS } from '~/types/api';

declare global {
    interface Window {
        YT?: {
            Player: new (element: string | HTMLElement, options: any) => any;
            PlayerState: {
                UNSTARTED: number;
                ENDED: number;
                PLAYING: number;
                PAUSED: number;
                BUFFERING: number;
                CUED: number;
            };
        };
        onYouTubeIframeAPIReady?: () => void;
    }
}

definePageMeta({
    middleware: [],
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { apiClient } = useApiClient();
const { showToast } = useToast();
const courseId = route.params.id as string;

const loading = ref(true);
const course = ref<CourseDetail | null>(null);
const selectedLectureId = ref<string | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
const learningPanelRef = ref<HTMLElement | null>(null);
const youtubePlayerContainerRef = ref<HTMLElement | null>(null);
const youtubePlayer = ref<any | null>(null);
const youtubePlayerVideoId = ref<string>('');
const youtubeTrackingIntervalId = ref<ReturnType<typeof setInterval> | null>(null);
const progressSavingByLectureId = ref<Record<string, boolean>>({});
const lastTrackedWatchedSeconds = ref<Record<string, number>>({});
const progressTrackingEnabled = ref(true);
const isLectureListExpanded = ref(false);
const desktopLearningPanelHeight = ref(0);

let learningPanelResizeObserver: ResizeObserver | null = null;

const LECTURE_COLLAPSE_THRESHOLD = 12;

const PROGRESS_TRACK_INTERVAL_SECONDS = 10;
let youtubeApiLoaderPromise: Promise<void> | null = null;

const isAuthenticated = computed(() => authStore.isLoggedIn);
const canTrackLearningProgress = computed(() => {
    return (
        isAuthenticated.value &&
        progressTrackingEnabled.value &&
        (authStore.userRole === 'STUDENT' || !authStore.userRole)
    );
});

const selectedLecture = computed(() => {
    if (!course.value || !selectedLectureId.value) return null;
    return course.value.lectures.find((lecture) => lecture.id === selectedLectureId.value) || null;
});

const currentLectureIndex = computed(() => {
    if (!course.value || !selectedLecture.value) {
        return -1;
    }

    return course.value.lectures.findIndex((lecture) => lecture.id === selectedLecture.value?.id);
});

const nextLecture = computed<CourseDetailLecture | null>(() => {
    if (!course.value || currentLectureIndex.value < 0) {
        return null;
    }

    return course.value.lectures[currentLectureIndex.value + 1] || null;
});

const showNextLectureButton = computed(() => {
    return Boolean(selectedLecture.value && nextLecture.value && isLectureCompleted(selectedLecture.value));
});

const shouldCollapseLectureList = computed(() => {
    return (course.value?.lectures.length || 0) > LECTURE_COLLAPSE_THRESHOLD;
});

const hiddenLectureCount = computed(() => {
    const total = course.value?.lectures.length || 0;
    return Math.max(0, total - LECTURE_COLLAPSE_THRESHOLD);
});

const lectureListToggleLabel = computed(() => {
    const total = course.value?.lectures.length || 0;

    if (isLectureListExpanded.value) {
        return 'Thu gọn danh sách';
    }

    return `Xem tất cả ${total} bài học`;
});

const lectureListAsideStyle = computed(() => {
    if (desktopLearningPanelHeight.value <= 0) {
        return undefined;
    }

    return {
        height: `${desktopLearningPanelHeight.value}px`,
    };
});

const isDesktopLectureSyncActive = computed(() => {
    return desktopLearningPanelHeight.value > 0;
});

const canPlayLecture = (lecture: CourseDetailLecture) => {
    if (typeof lecture.canPlay === 'boolean') {
        return lecture.canPlay;
    }

    if (typeof lecture.isLocked === 'boolean') {
        return !lecture.isLocked;
    }

    return Boolean(lecture.videoUrl);
};

const getLectureCompletionRate = (lecture: CourseDetailLecture): number => {
    if (typeof lecture.completionRate === 'number') {
        return Math.max(0, Math.min(100, Math.round(lecture.completionRate)));
    }

    if (typeof lecture.watchedSeconds === 'number' && lecture.duration > 0) {
        const calculated = (lecture.watchedSeconds / lecture.duration) * 100;
        return Math.max(0, Math.min(100, Math.round(calculated)));
    }

    return 0;
};

const isLectureCompleted = (lecture: CourseDetailLecture): boolean => {
    return lecture.isCompleted === true || getLectureCompletionRate(lecture) >= 90;
};

const isLectureInProgress = (lecture: CourseDetailLecture): boolean => {
    return !isLectureCompleted(lecture) && getLectureCompletionRate(lecture) > 0;
};

const getYouTubeVideoId = (url: string): string | null => {
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch?.[1]) return shortMatch[1];

    const longMatch = url.match(/[?&]v=([^?&]+)/);
    if (longMatch?.[1]) return longMatch[1];

    const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
    if (embedMatch?.[1]) return embedMatch[1];

    return null;
};

const getYouTubeEmbedUrl = (url: string): string | null => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;

    return `https://www.youtube.com/embed/${videoId}`;
};

const currentVideoSource = computed(() => {
    const url = selectedLecture.value?.videoUrl;
    if (!url) return { type: 'none' as const, src: '' };

    const yt = getYouTubeEmbedUrl(url);
    if (yt) {
        return {
            type: 'youtube' as const,
            src: yt,
            videoId: getYouTubeVideoId(url) || '',
        };
    }

    return { type: 'video' as const, src: url };
});

const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

const subjectLabel = (subject: Subject) => {
    const map: Record<Subject, string> = {
        MATH: 'Toán học',
        VIETNAMESE: 'Tiếng Việt',
        ENGLISH: 'Tiếng Anh',
        SCIENCE: 'Khoa học',
        ART: 'Mỹ thuật',
        MUSIC: 'Âm nhạc',
        PE: 'Thể chất',
        HISTORY: 'Lịch sử',
        GEOGRAPHY: 'Địa lý',
        LIFE_SKILLS: 'Kỹ năng sống',
    };
    return map[subject] || subject;
};

const gradeLabel = (grade: Grade) => {
    const map: Record<Grade, string> = {
        GRADE_1: 'Lớp 1',
        GRADE_2: 'Lớp 2',
        GRADE_3: 'Lớp 3',
        GRADE_4: 'Lớp 4',
        GRADE_5: 'Lớp 5',
    };
    return map[grade] || grade;
};

const mergeLectureLearningState = (lectureItems: LectureListItem[]) => {
    if (!course.value || !Array.isArray(course.value.lectures) || !Array.isArray(lectureItems)) {
        return;
    }

    const lectureStateMap = new Map(lectureItems.map((item) => [item.id, item]));

    course.value.lectures = course.value.lectures.map((lecture) => {
        const state = lectureStateMap.get(lecture.id);
        if (!state) {
            return lecture;
        }

        const mergedLecture: CourseDetailLecture = {
            ...lecture,
            videoUrl: state.videoUrl ?? lecture.videoUrl,
            canPlay: typeof state.canPlay === 'boolean' ? state.canPlay : lecture.canPlay,
            isLocked: typeof state.isLocked === 'boolean' ? state.isLocked : lecture.isLocked,
            isCompleted: state.isCompleted ?? false,
            watchedSeconds: state.watchedSeconds ?? 0,
            completionRate: state.completionRate ?? 0,
        };

        if (typeof mergedLecture.watchedSeconds === 'number') {
            lastTrackedWatchedSeconds.value[mergedLecture.id] = Math.max(
                lastTrackedWatchedSeconds.value[mergedLecture.id] || 0,
                Math.floor(mergedLecture.watchedSeconds)
            );
        }

        return mergedLecture;
    });
};

const fetchLectureLearningState = async () => {
    if (!isAuthenticated.value) {
        return;
    }

    try {
        const response = await apiClient.get<LectureListItem[]>(API_ENDPOINTS.LECTURE.LIST_BY_COURSE(courseId));
        if (response.success && response.data) {
            mergeLectureLearningState(response.data);
        }
    } catch (error) {
        // Keep graceful fallback if lecture status endpoint is unavailable for current role.
    }
};

const loadYouTubeIframeApi = async (): Promise<void> => {
    if (typeof window === 'undefined') {
        return;
    }

    if (window.YT?.Player) {
        return;
    }

    if (!youtubeApiLoaderPromise) {
        youtubeApiLoaderPromise = new Promise<void>((resolve) => {
            const existingScript = document.querySelector<HTMLScriptElement>('script[data-youtube-iframe-api="true"]');

            if (!existingScript) {
                const script = document.createElement('script');
                script.src = 'https://www.youtube.com/iframe_api';
                script.async = true;
                script.dataset.youtubeIframeApi = 'true';
                document.head.appendChild(script);
            }

            const previousReadyCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                previousReadyCallback?.();
                resolve();
            };

            if (window.YT?.Player) {
                resolve();
            }
        });
    }

    await youtubeApiLoaderPromise;
};

const clearYouTubeTrackingInterval = () => {
    if (youtubeTrackingIntervalId.value) {
        clearInterval(youtubeTrackingIntervalId.value);
        youtubeTrackingIntervalId.value = null;
    }
};

const getCurrentYouTubeSeconds = (): number => {
    if (!youtubePlayer.value || typeof youtubePlayer.value.getCurrentTime !== 'function') {
        return 0;
    }

    const currentTime = Number(youtubePlayer.value.getCurrentTime());
    if (!Number.isFinite(currentTime) || currentTime <= 0) {
        return 0;
    }

    return Math.floor(currentTime);
};

const startYouTubeTrackingInterval = () => {
    if (youtubeTrackingIntervalId.value) {
        return;
    }

    youtubeTrackingIntervalId.value = setInterval(() => {
        if (currentVideoSource.value.type !== 'youtube' || !selectedLecture.value) {
            return;
        }

        const watchedSeconds = getCurrentYouTubeSeconds();
        if (watchedSeconds <= 0) {
            return;
        }

        void persistLectureProgress(selectedLecture.value.id, watchedSeconds);
    }, PROGRESS_TRACK_INTERVAL_SECONDS * 1000);
};

const handleYouTubeStateChange = (event: { data: number }) => {
    if (typeof window === 'undefined' || !window.YT || !selectedLecture.value) {
        return;
    }

    const playerState = window.YT.PlayerState;

    if (event.data === playerState.PLAYING) {
        startYouTubeTrackingInterval();
        return;
    }

    if (event.data === playerState.ENDED) {
        clearYouTubeTrackingInterval();

        const lectureId = selectedLecture.value.id;
        const watchedSeconds = Math.max(getCurrentYouTubeSeconds(), selectedLecture.value.duration || 0);
        void persistLectureProgress(lectureId, watchedSeconds);
        void markLectureAsCompleted(lectureId);
        return;
    }

    clearYouTubeTrackingInterval();
};

const destroyYouTubePlayer = () => {
    clearYouTubeTrackingInterval();

    if (youtubePlayer.value && typeof youtubePlayer.value.destroy === 'function') {
        youtubePlayer.value.destroy();
    }

    youtubePlayer.value = null;
    youtubePlayerVideoId.value = '';
};

const ensureYouTubePlayer = async () => {
    if (currentVideoSource.value.type !== 'youtube' || !selectedLecture.value || !youtubePlayerContainerRef.value) {
        destroyYouTubePlayer();
        return;
    }

    const videoId = currentVideoSource.value.videoId;
    if (!videoId) {
        destroyYouTubePlayer();
        return;
    }

    if (youtubePlayer.value && youtubePlayerVideoId.value === videoId) {
        return;
    }

    await loadYouTubeIframeApi();

    if (!window.YT?.Player || !youtubePlayerContainerRef.value) {
        return;
    }

    destroyYouTubePlayer();

    youtubePlayer.value = new window.YT.Player(youtubePlayerContainerRef.value, {
        videoId,
        playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
        },
        events: {
            onReady: () => {
                if (!selectedLecture.value || !youtubePlayer.value || typeof youtubePlayer.value.seekTo !== 'function') {
                    return;
                }

                const resumeSeconds = Math.floor(selectedLecture.value.watchedSeconds || 0);
                if (resumeSeconds > 0) {
                    youtubePlayer.value.seekTo(resumeSeconds, true);
                }
            },
            onStateChange: handleYouTubeStateChange,
        },
    });

    youtubePlayerVideoId.value = videoId;
};

const updateLocalLectureProgress = (lectureId: string, watchedSeconds: number, completed = false) => {
    if (!course.value) {
        return;
    }

    const lecture = course.value.lectures.find((item) => item.id === lectureId);
    if (!lecture) {
        return;
    }

    const safeWatchedSeconds = Math.max(0, Math.floor(watchedSeconds));
    const previousWatched = typeof lecture.watchedSeconds === 'number' ? lecture.watchedSeconds : 0;
    const mergedWatched = Math.max(previousWatched, safeWatchedSeconds);

    lecture.watchedSeconds = mergedWatched;

    const calculatedRate = lecture.duration > 0 ? (mergedWatched / lecture.duration) * 100 : 0;
    const previousRate = typeof lecture.completionRate === 'number' ? lecture.completionRate : 0;
    lecture.completionRate = Math.max(previousRate, Math.min(100, calculatedRate));

    if (completed || lecture.completionRate >= 90) {
        lecture.isCompleted = true;
        lecture.completionRate = 100;
    }
};

const isHttpAuthError = (error: unknown): boolean => {
    const statusCode =
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        typeof (error as { statusCode?: unknown }).statusCode === 'number'
            ? (error as { statusCode: number }).statusCode
            : 0;

    return statusCode === 401 || statusCode === 403;
};

const persistLectureProgress = async (lectureId: string, watchedSeconds: number) => {
    if (!canTrackLearningProgress.value) {
        return;
    }

    if (progressSavingByLectureId.value[lectureId]) {
        return;
    }

    const safeWatchedSeconds = Math.max(0, Math.floor(watchedSeconds));
    const lastTracked = lastTrackedWatchedSeconds.value[lectureId] || 0;
    if (safeWatchedSeconds <= lastTracked) {
        return;
    }

    progressSavingByLectureId.value[lectureId] = true;

    try {
        const response = await apiClient.post(
            API_ENDPOINTS.PROGRESS.TRACK_LECTURE(lectureId),
            {
                lectureId,
                watchedSeconds: safeWatchedSeconds,
            }
        );

        if (response.success) {
            lastTrackedWatchedSeconds.value[lectureId] = safeWatchedSeconds;
            updateLocalLectureProgress(lectureId, safeWatchedSeconds);
        }
    } catch (error) {
        if (isHttpAuthError(error)) {
            progressTrackingEnabled.value = false;
        }
    } finally {
        progressSavingByLectureId.value[lectureId] = false;
    }
};

const markLectureAsCompleted = async (lectureId: string) => {
    if (!canTrackLearningProgress.value) {
        return;
    }

    try {
        const response = await apiClient.patch(API_ENDPOINTS.PROGRESS.COMPLETE_LECTURE(lectureId), {});
        if (response.success) {
            const lecture = course.value?.lectures.find((item) => item.id === lectureId);
            const watchedSeconds = lecture?.duration || lastTrackedWatchedSeconds.value[lectureId] || 0;
            lastTrackedWatchedSeconds.value[lectureId] = watchedSeconds;
            updateLocalLectureProgress(lectureId, watchedSeconds, true);
        }
    } catch (error) {
        if (isHttpAuthError(error)) {
            progressTrackingEnabled.value = false;
        }
    }
};

const flushCurrentVideoProgress = async () => {
    if (!selectedLecture.value) {
        return;
    }

    const lectureId = selectedLecture.value.id;

    if (currentVideoSource.value.type === 'video' && videoRef.value) {
        const watchedSeconds = Math.floor(videoRef.value.currentTime);
        if (watchedSeconds > 0) {
            await persistLectureProgress(lectureId, watchedSeconds);
        }
        return;
    }

    if (currentVideoSource.value.type === 'youtube') {
        const watchedSeconds = getCurrentYouTubeSeconds();
        if (watchedSeconds > 0) {
            await persistLectureProgress(lectureId, watchedSeconds);
        }
    }
};

const handleVideoLoadedMetadata = () => {
    if (!videoRef.value || !selectedLecture.value) {
        return;
    }

    const resumeSeconds = Math.floor(selectedLecture.value.watchedSeconds || 0);
    const canResume =
        resumeSeconds > 0 &&
        Number.isFinite(videoRef.value.duration) &&
        resumeSeconds < Math.max(0, Math.floor(videoRef.value.duration) - 5);

    if (canResume) {
        videoRef.value.currentTime = resumeSeconds;
    }
};

const handleVideoTimeUpdate = async () => {
    if (currentVideoSource.value.type !== 'video' || !videoRef.value || !selectedLecture.value) {
        return;
    }

    const watchedSeconds = Math.floor(videoRef.value.currentTime);
    const lectureId = selectedLecture.value.id;
    const lastTracked = lastTrackedWatchedSeconds.value[lectureId] || 0;
    const shouldTrack = watchedSeconds - lastTracked >= PROGRESS_TRACK_INTERVAL_SECONDS;

    if (!shouldTrack) {
        return;
    }

    await persistLectureProgress(lectureId, watchedSeconds);
};

const handleVideoEnded = async () => {
    if (!selectedLecture.value) {
        return;
    }

    const lectureId = selectedLecture.value.id;
    const fallbackWatchedSeconds = selectedLecture.value.duration || 0;
    const watchedSeconds = videoRef.value ? Math.floor(videoRef.value.currentTime) : fallbackWatchedSeconds;

    await persistLectureProgress(lectureId, Math.max(watchedSeconds, fallbackWatchedSeconds));
    await markLectureAsCompleted(lectureId);
};

const fetchCourse = async () => {
    loading.value = true;
    try {
        const response = await apiClient.get<CourseDetail>(API_ENDPOINTS.COURSE.DETAIL(courseId));
        if (response.success && response.data) {
            course.value = response.data;

            await fetchLectureLearningState();

            if (!response.data.isPublished) {
                showToast({ type: 'info', message: 'Khóa học này chưa được phát hành.' });
                await router.replace('/courses');
                return;
            }

            if (course.value.lectures.length > 0) {
                const firstPlayable = course.value.lectures.find(canPlayLecture) || course.value.lectures[0];
                selectedLectureId.value = firstPlayable.id;
            }
        } else {
            showToast({ type: 'error', message: 'Không tìm thấy khóa học.' });
            await router.replace('/courses');
        }
    } catch (error) {
        showToast({ type: 'error', message: 'Không thể tải chi tiết khóa học.' });
        await router.replace('/courses');
    } finally {
        loading.value = false;
    }
};

const selectLecture = async (lecture: CourseDetailLecture) => {
    if (!canPlayLecture(lecture)) {
        if (!isAuthenticated.value) {
            showToast({ type: 'info', message: 'Vui lòng đăng nhập để học bài và làm quiz.' });
            router.push({ path: '/auth', query: { redirect: route.fullPath } });
            return;
        }

        showToast({ type: 'info', message: 'Khóa học đang bị giới hạn quyền học. Bạn có thể xem lại bài đã hoàn thành trước đó.' });
        return;
    }

    await flushCurrentVideoProgress();
    selectedLectureId.value = lecture.id;
};

const goToNextLecture = async () => {
    if (!nextLecture.value) {
        return;
    }

    await selectLecture(nextLecture.value);
};

const toggleLectureList = () => {
    if (!shouldCollapseLectureList.value) {
        return;
    }

    isLectureListExpanded.value = !isLectureListExpanded.value;
};

const handleBack = async () => {
    await router.push('/courses');
};

const syncLearningPanelHeight = () => {
    if (typeof window === 'undefined') {
        return;
    }

    if (window.innerWidth < 1024) {
        desktopLearningPanelHeight.value = 0;
        return;
    }

    const panelHeight = learningPanelRef.value?.getBoundingClientRect().height || 0;
    desktopLearningPanelHeight.value = panelHeight > 0 ? Math.round(panelHeight) : 0;
};

onMounted(() => {
    void fetchCourse();

    if (typeof window !== 'undefined') {
        window.addEventListener('resize', syncLearningPanelHeight);
    }
});

watch(
    () => course.value?.lectures.length || 0,
    (lectureCount) => {
        isLectureListExpanded.value = lectureCount <= LECTURE_COLLAPSE_THRESHOLD;
    },
    { immediate: true }
);

watch(
    () => [loading.value, selectedLectureId.value, selectedLecture.value?.title || ''],
    async () => {
        await nextTick();

        if (learningPanelResizeObserver) {
            learningPanelResizeObserver.disconnect();
            learningPanelResizeObserver = null;
        }

        if (typeof window !== 'undefined' && typeof ResizeObserver !== 'undefined' && learningPanelRef.value) {
            learningPanelResizeObserver = new ResizeObserver(() => {
                syncLearningPanelHeight();
            });
            learningPanelResizeObserver.observe(learningPanelRef.value);
        }

        syncLearningPanelHeight();
    },
    { immediate: true }
);

watch(
    () => [
        selectedLectureId.value,
        currentVideoSource.value.type,
        currentVideoSource.value.type === 'youtube' ? currentVideoSource.value.videoId : '',
    ],
    async () => {
        await nextTick();

        if (currentVideoSource.value.type === 'youtube') {
            await ensureYouTubePlayer();
            return;
        }

        destroyYouTubePlayer();
    }
);

onBeforeUnmount(() => {
    void flushCurrentVideoProgress();
    destroyYouTubePlayer();

    if (typeof window !== 'undefined') {
        window.removeEventListener('resize', syncLearningPanelHeight);
    }

    if (learningPanelResizeObserver) {
        learningPanelResizeObserver.disconnect();
        learningPanelResizeObserver = null;
    }
});

useHead({
    title: `Khóa học - EduForKids`,
    meta: [
        { name: 'description', content: 'Chi tiết khóa học' },
    ],
});
</script>

<template>
    <div class="min-h-screen px-4 pt-20 pb-8">
        <div class="max-w-6xl mx-auto space-y-6">
            <!-- Back Button -->
            <button @click.prevent="handleBack"
                class="inline-flex items-center gap-2 px-3 py-2 text-gray-600 transition-colors rounded-xl dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800/70">
                <span class="material-symbols-outlined">arrow_back</span>
                <span>Quay lại</span>
            </button>

            <div v-if="loading" class="flex items-center justify-center py-20">
                <div class="text-center">
                    <div class="mb-4 text-6xl animate-bounce">🐰</div>
                    <p class="font-bold text-gray-600 dark:text-slate-400">Đang tải khóa học...</p>
                </div>
            </div>

            <div v-else-if="course" class="space-y-6">
                <div class="overflow-hidden bg-white shadow-xl dark:bg-slate-800 rounded-3xl">
                    <div class="relative h-56 bg-slate-100 dark:bg-slate-900 sm:h-72">
                        <img v-if="course.thumbnail" :src="course.thumbnail" :alt="course.title"
                            class="object-cover w-full h-full" />
                        <div v-else class="flex items-center justify-center w-full h-full text-6xl">📚</div>
                    </div>

                    <div class="p-6 space-y-3">
                        <div class="flex flex-wrap items-center gap-2 text-xs font-bold">
                            <span class="px-3 py-1 text-green-700 bg-green-100 rounded-full"
                                v-if="course.isFree">Miễn phí</span>
                            <span class="px-3 py-1 text-blue-700 bg-blue-100 rounded-full">{{
                                subjectLabel(course.subject) }}</span>
                            <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-700">{{
                                gradeLabel(course.grade) }}</span>
                            <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-700">{{
                                formatDuration(course.duration) }}</span>
                        </div>

                        <h1 class="text-2xl font-bold text-gray-800 font-display dark:text-white">{{ course.title }}
                        </h1>
                        <p class="text-sm text-gray-600 dark:text-slate-300">{{ course.description || 'Chưa có mô tả.' }}</p>
                    </div>
                </div>

                <div class="grid gap-6 lg:grid-cols-3 lg:items-start">
                    <div class="lg:col-span-2 lg:self-start">
                        <div ref="learningPanelRef" class="p-5 bg-white shadow-xl dark:bg-slate-800 rounded-3xl lg:self-start">
                        <h2 class="mb-4 text-lg font-bold text-gray-800 dark:text-white">Bài học đang xem</h2>

                        <div v-if="selectedLecture" class="space-y-4">
                            <div class="overflow-hidden aspect-video rounded-2xl bg-slate-100 dark:bg-slate-900">
                                <div v-if="selectedLecture && !canPlayLecture(selectedLecture)"
                                    class="flex items-center justify-center w-full h-full px-6 text-center">
                                    <p class="text-sm font-semibold text-slate-500">Bài học này đang bị khóa. Đăng ký
                                        gói học để tiếp tục, hoặc xem lại các bài đã hoàn thành.</p>
                                </div>

                                <div v-else-if="currentVideoSource.type === 'youtube'" ref="youtubePlayerContainerRef"
                                    class="w-full h-full" />

                                <video
                                    v-else-if="currentVideoSource.type === 'video'"
                                    ref="videoRef"
                                    class="w-full h-full"
                                    controls
                                    :src="currentVideoSource.src"
                                    @loadedmetadata="handleVideoLoadedMetadata"
                                    @timeupdate="handleVideoTimeUpdate"
                                    @ended="handleVideoEnded"
                                />

                                <div v-else
                                    class="flex items-center justify-center w-full h-full text-sm text-slate-500">
                                    Bài học này chưa có video.
                                </div>
                            </div>

                            <div>
                                <h3 class="text-lg font-bold text-gray-800 dark:text-white">{{ selectedLecture.title }}
                                </h3>
                                <p class="text-sm text-gray-600 dark:text-slate-300">{{ selectedLecture.description ||
                                    'Không có mô tả cho bài học này.' }}</p>

                                <button
                                    v-if="showNextLectureButton && nextLecture"
                                    @click="goToNextLecture"
                                    class="inline-flex items-center gap-2 px-4 py-2 mt-3 text-sm font-bold text-white transition-colors rounded-full bg-primary hover:bg-primary/90"
                                >
                                    Bài tiếp theo: {{ nextLecture.order }}. {{ nextLecture.title }}
                                    <span class="text-base material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                            <p v-else class="text-sm text-slate-500">Khóa học chưa có bài giảng.</p>
                        </div>
                    </div>

                    <aside :style="lectureListAsideStyle"
                        class="flex flex-col min-h-0 p-5 bg-white shadow-xl dark:bg-slate-800 rounded-3xl lg:self-start">
                        <div class="flex items-center justify-between gap-3 mb-4">
                            <h2 class="text-lg font-bold text-gray-800 dark:text-white">Danh sách bài học</h2>

                            <button
                                v-if="shouldCollapseLectureList"
                                @click="toggleLectureList"
                                class="inline-flex items-center gap-1 text-xs font-bold rounded-full border border-primary/40 bg-primary/10 text-primary px-3 py-1.5 hover:bg-primary/15 transition-colors"
                            >
                                <span>{{ lectureListToggleLabel }}</span>
                                <span
                                    class="text-base leading-none transition-transform duration-300 material-symbols-outlined"
                                    :class="isLectureListExpanded ? 'rotate-180' : ''"
                                >expand_more</span>
                            </button>
                        </div>

                        <div v-if="course.lectures.length === 0" class="text-sm text-slate-500">Chưa có bài học nào.</div>

                        <div v-else class="relative flex-1 min-h-0">
                            <div
                                class="space-y-3 transition-[max-height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] course-lectures-scroll"
                                :class="isLectureListExpanded || !shouldCollapseLectureList
                                    ? 'h-full overflow-y-auto'
                                    : isDesktopLectureSyncActive
                                        ? 'h-full overflow-hidden'
                                        : 'max-h-[18rem] sm:max-h-[20rem] overflow-hidden'"
                            >
                                <button v-for="lecture in course.lectures" :key="lecture.id" @click="selectLecture(lecture)"
                                    class="w-full p-3 text-left transition-all border rounded-2xl" :class="selectedLectureId === lecture.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary/40'">
                                    <div class="flex items-start justify-between gap-2">
                                        <p class="text-sm font-semibold text-gray-800 dark:text-slate-200">{{ lecture.order }}.
                                            {{ lecture.title }}</p>
                                        <div class="flex items-center gap-2 shrink-0">
                                            <span
                                                v-if="isLectureCompleted(lecture)"
                                                class="text-xl text-green-600 material-symbols-outlined"
                                                title="Đã hoàn thành"
                                            >check_circle</span>
                                            <span
                                                v-else-if="isLectureInProgress(lecture)"
                                                class="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700"
                                            >Đang học</span>
                                            <span
                                                v-else-if="lecture.isPreview"
                                                class="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700"
                                            >Preview</span>
                                            <span
                                                v-else-if="!canPlayLecture(lecture)"
                                                class="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600"
                                            >Khóa</span>
                                        </div>
                                    </div>
                                    <p class="mt-1 text-xs text-slate-500">
                                        {{ formatDuration(lecture.duration) }}
                                        <span v-if="isLectureInProgress(lecture)" class="font-semibold text-orange-500">
                                            • {{ getLectureCompletionRate(lecture) }}%
                                        </span>
                                    </p>
                                </button>
                            </div>

                            <div
                                v-if="shouldCollapseLectureList && !isLectureListExpanded"
                                class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-800 dark:via-slate-800/95"
                            />
                        </div>

                        <p
                            v-if="shouldCollapseLectureList && !isLectureListExpanded"
                            class="mt-3 text-xs font-medium text-slate-500"
                        >
                            +{{ hiddenLectureCount }} bài học đang được thu gọn.
                        </p>

                        <p v-if="!isAuthenticated" class="mt-4 text-xs text-slate-500">
                            Bạn có thể xem syllabus khóa học. Đăng nhập để xem bài học, quiz và lưu tiến độ.
                        </p>

                        <p v-else-if="course && !course.canAccessLearningContent && !course.isFree"
                            class="mt-4 text-xs text-slate-500">
                            Gói học hiện tại không còn hiệu lực. Bạn vẫn có thể xem lại bài đã hoàn thành trước đó.
                        </p>
                    </aside>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.course-lectures-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.course-lectures-scroll::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
}
</style>
