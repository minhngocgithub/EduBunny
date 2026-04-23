import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { courseController } from './course.controller';
import { authMiddleware, optionalAuthMiddleware, requireAdmin } from '@/shared/config/passport.config';
import { validateRequest, validateQuery } from '@/shared/middleware/validation.middleware';
import {
    CreateCourseSchema,
    UpdateCourseSchema,
    CourseQuerySchema,
    AdminListCoursesQuerySchema,
} from './course.dto';

const router = Router();

const COURSE_THUMBNAIL_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'courses');
const COURSE_THUMBNAIL_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
]);

if (!fs.existsSync(COURSE_THUMBNAIL_UPLOAD_DIR)) {
    fs.mkdirSync(COURSE_THUMBNAIL_UPLOAD_DIR, { recursive: true });
}

const thumbnailUploadStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, COURSE_THUMBNAIL_UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
        const fileName = path
            .basename(file.originalname, extension)
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 40) || 'thumbnail';

        cb(null, `${Date.now()}-${fileName}${extension}`);
    },
});

const thumbnailUpload = multer({
    storage: thumbnailUploadStorage,
    limits: {
        fileSize: COURSE_THUMBNAIL_MAX_SIZE_BYTES,
    },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
            cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'));
            return;
        }

        cb(null, true);
    },
});

// Admin routes (protected)
router.get(
    '/admin/all',
    authMiddleware,
    requireAdmin,
    validateQuery(AdminListCoursesQuerySchema),
    courseController.getAllCoursesForAdmin.bind(courseController)
);

router.post(
    '/upload-thumbnail',
    authMiddleware,
    requireAdmin,
    thumbnailUpload.single('thumbnail'),
    courseController.uploadThumbnail.bind(courseController)
);

router.post(
    '/',
    authMiddleware,
    requireAdmin,
    validateRequest(CreateCourseSchema),
    courseController.createCourse.bind(courseController)
);

router.patch(
    '/:id',
    authMiddleware,
    requireAdmin,
    validateRequest(UpdateCourseSchema),
    courseController.updateCourse.bind(courseController)
);

router.delete(
    '/:id',
    authMiddleware,
    requireAdmin,
    courseController.deleteCourse.bind(courseController)
);

// Public routes
router.get('/', optionalAuthMiddleware, validateQuery(CourseQuerySchema), courseController.getCourses.bind(courseController));
router.get('/slug/:slug', optionalAuthMiddleware, courseController.getCourseBySlug.bind(courseController));
router.get('/:id', optionalAuthMiddleware, courseController.getCourseById.bind(courseController));
router.get('/:id/reviews', courseController.getCourseReviews.bind(courseController));

export default router;

