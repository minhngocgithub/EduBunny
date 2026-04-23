export interface Lecture {
  id: string
  courseId: string
  title: string
  slug: string
  description: string | null
  videoUrl: string | null
  duration: number
  order: number
  isPreview: boolean
  createdAt: string
  updatedAt: string
}

export interface LectureListItem {
  id: string
  courseId: string
  title: string
  slug: string
  description: string | null
  videoUrl: string | null
  duration: number
  order: number
  isPreview: boolean
  isCompleted?: boolean
  watchedSeconds?: number
  completionRate?: number
  canPlay?: boolean
  isLocked?: boolean
}

export interface CreateLectureInput {
  courseId: string
  title: string
  description?: string | null
  videoUrl?: string | null
  duration: number
  order?: number
  isPreview?: boolean
}

export interface UpdateLectureInput {
  title?: string
  description?: string | null
  videoUrl?: string | null
  duration?: number
  order?: number
  isPreview?: boolean
}

export interface LectureWithCourse extends Lecture {
  course: {
    id: string
    title: string
    slug: string
  }
}
