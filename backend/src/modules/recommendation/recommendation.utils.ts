import { Grade, Subject, Course, CourseLevel } from '@prisma/client';
import { CourseRecommendation } from './recommendation.types';

/**
 * Get next grade level (for challenge courses)
 */
export function getNextGrade(grade: Grade): Grade | null {
    const gradeOrder: Grade[] = [
        Grade.GRADE_1,
        Grade.GRADE_2,
        Grade.GRADE_3,
        Grade.GRADE_4,
        Grade.GRADE_5,
    ];

    const currentIndex = gradeOrder.indexOf(grade);
    if (currentIndex === -1 || currentIndex === gradeOrder.length - 1) {
        return null; // Already at highest grade
    }

    return gradeOrder[currentIndex + 1];
}

/**
 * Calculate recommendation score based on various factors
 */
export function calculateRecommendationScore(
    course: Course,
    studentGrade: Grade,
    isEnrolled: boolean,
    avgRating: number | null,
    enrollmentCount: number
): number {
    let score = 0;

    // Grade match (60% weight for 60-20-20 rule)
    if (course.grade === studentGrade) {
        score += 60;
    } else {
        const nextGrade = getNextGrade(studentGrade);
        if (nextGrade && course.grade === nextGrade) {
            score += 20; // Challenge course
        }
    }

    // Rating factor (20% weight)
    if (avgRating) {
        score += (avgRating / 5) * 20;
    }

    // Popularity factor (enrollment count)
    if (enrollmentCount > 0) {
        // Normalize enrollment count (assume 100+ enrollments = very popular)
        const popularityScore = Math.min((enrollmentCount / 100) * 10, 10);
        score += popularityScore;
    }

    // Penalize if already enrolled
    if (isEnrolled) {
        score *= 0.5;
    }

    return Math.min(score, 100);
}

/**
 * Filter courses by grade matching (60% of recommendations)
 */
export function filterGradeMatchingCourses(
    courses: Course[],
    grade: Grade,
    limit: number
): Course[] {
    return courses
        .filter(course => course.grade === grade && course.isPublished)
        .slice(0, limit);
}

/**
 * Filter popular courses (20% of recommendations)
 */
export function filterPopularCourses(
    courses: Course[],
    limit: number
): Course[] {
    return courses
        .filter(course => course.isPublished)
        .sort((a, b) => {
            // Sort by enrollment count and rating
            const aScore = (a.avgRating || 0) * 20 + (a.reviewCount || 0);
            const bScore = (b.avgRating || 0) * 20 + (b.reviewCount || 0);
            return bScore - aScore;
        })
        .slice(0, limit);
}

/**
 * Filter challenge courses (grade + 1, 20% of recommendations)
 */
export function filterChallengeCourses(
    courses: Course[],
    grade: Grade,
    limit: number
): Course[] {
    const nextGrade = getNextGrade(grade);
    if (!nextGrade) {
        return [];
    }

    return courses
        .filter(course => course.grade === nextGrade && course.isPublished)
        .slice(0, limit);
}

/**
 * Apply 60-20-20 rule to distribute recommendations
 */
export function apply602020Rule(
    gradeMatchCourses: Course[],
    popularCourses: Course[],
    challengeCourses: Course[],
    totalLimit: number
): CourseRecommendation[] {
    const gradeLimit = Math.floor(totalLimit * 0.6);
    const popularLimit = Math.floor(totalLimit * 0.2);
    const challengeLimit = Math.floor(totalLimit * 0.2);

    const recommendations: CourseRecommendation[] = [];

    // 60% grade matching
    gradeMatchCourses.slice(0, gradeLimit).forEach(course => {
        recommendations.push({
            course,
            reason: `Phù hợp với lớp ${course.grade}`,
            score: 60,
            category: 'grade_match',
        });
    });

    // 20% popular
    popularCourses
        .filter(c => !recommendations.some(r => r.course.id === c.id))
        .slice(0, popularLimit)
        .forEach(course => {
            recommendations.push({
                course,
                reason: 'Khóa học phổ biến',
                score: 20,
                category: 'popular',
            });
        });

    // 20% challenge
    challengeCourses
        .filter(c => !recommendations.some(r => r.course.id === c.id))
        .slice(0, challengeLimit)
        .forEach(course => {
            recommendations.push({
                course,
                reason: 'Khóa học thử thách',
                score: 20,
                category: 'challenge',
            });
        });

    // Fill remaining slots with any available courses
    const remaining = totalLimit - recommendations.length;
    const allCourses = [...gradeMatchCourses, ...popularCourses, ...challengeCourses]
        .filter(c => !recommendations.some(r => r.course.id === c.id));

    allCourses.slice(0, remaining).forEach(course => {
        recommendations.push({
            course,
            reason: 'Khóa học đề xuất',
            score: 10,
            category: 'grade_match',
        });
    });

    return recommendations;
}

