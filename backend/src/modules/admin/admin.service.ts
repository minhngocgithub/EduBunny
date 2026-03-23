import { PrismaClient, Subject } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalStudents,
      totalParents,
      totalCourses,
      publishedCourses,
      totalLectures,
      totalEnrollments,
      activeUsers,
    ] = await Promise.all([
      // Total students
      prisma.student.count(),
      
      // Total parents
      prisma.parent.count(),
      
      // Total courses
      prisma.course.count(),
      
      // Published courses
      prisma.course.count({ where: { isPublished: true } }),
      
      // Total lectures
      prisma.lecture.count(),
      
      // Total enrollments
      prisma.enrollment.count(),
      
      // Active users (logged in last 30 days)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Calculate completion rate from lecture progress
    const completionStats = await prisma.progress.aggregate({
      _avg: {
        completionRate: true,
      },
    });

    const avgCompletionRate = Math.round((completionStats._avg.completionRate || 0) * 100);

    return {
      totalStudents,
      totalParents,
      totalUsers: totalStudents + totalParents,
      totalCourses,
      publishedCourses,
      totalLectures,
      totalEnrollments,
      activeUsers,
      avgCompletionRate,
    };
  }

  /**
   * Get user growth data for chart
   */
  async getUserGrowth(days: number = 7) {
    const growth = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      growth.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    return growth;
  }

  /**
   * Get subject distribution
   */
  async getSubjectDistribution() {
    const courses = await prisma.course.groupBy({
      by: ['subject'],
      _count: {
        id: true,
      },
    });

    const total = courses.reduce((sum: number, c) => sum + c._count.id, 0);

    return courses.map((course) => ({
      subject: course.subject,
      count: course._count.id,
      percentage: total > 0 ? Math.round((course._count.id / total) * 100) : 0,
    }));
  }

  /**
   * Get recent activities (enrollments, etc.)
   */
  async getRecentActivities(limit: number = 10) {
    const [recentEnrollments, recentUsers] = await Promise.all([
      prisma.enrollment.findMany({
        take: limit,
        orderBy: { enrolledAt: 'desc' },
        include: {
          student: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: {
          role: 'STUDENT',
        },
        include: {
          student: true,
        },
      }),
    ]);

    const activities = [
      ...recentUsers.map((user) => ({
        type: 'user_registered' as const,
        title: `${user.student?.firstName || ''} ${user.student?.lastName || 'Học sinh mới'} đăng ký`,
        time: user.createdAt,
        icon: 'person_add',
        color: 'bg-primary',
      })),
      ...recentEnrollments.map((enrollment) => ({
        type: 'course_enrolled' as const,
        title: `Đăng ký khóa "${enrollment.course.title}"`,
        time: enrollment.enrolledAt,
        icon: 'bookmark_add',
        color: 'bg-success',
      })),
    ];

    // Sort by time and take top N
    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, limit)
      .map((activity) => ({
        ...activity,
        time: this.getRelativeTime(activity.time),
      }));
  }

  /**
   * Get top courses by enrollment
   */
  async getTopCourses(limit: number = 5) {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        enrollments: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    // Calculate completion rate for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const progresses = await prisma.progress.findMany({
          where: {
            lecture: {
              courseId: course.id,
            },
          },
          select: {
            completionRate: true,
          },
        });

        const avgProgress = progresses.length > 0
          ? progresses.reduce((sum: number, p) => sum + p.completionRate, 0) / progresses.length
          : 0;

        return {
          id: course.id,
          name: course.title,
          students: course._count.enrollments,
          completionRate: Math.round(avgProgress * 100),
        };
      })
    );

    return coursesWithStats;
  }

  /**
   * Get analytics data
   */
  async getAnalytics(timeRange: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    const [
      userCount,
      completedLectures,
      totalLectureViews,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
      prisma.progress.count({
        where: {
          completedAt: {
            not: null,
            gte: startDate,
          },
        },
      }),
      prisma.progress.count({
        where: {
          watchedSeconds: {
            gt: 0,
          },
          updatedAt: {
            gte: startDate,
          },
        },
      }),
    ]);

    // Calculate average session time from lecture progress
    const sessionTimeData = await prisma.progress.aggregate({
      _avg: {
        watchedSeconds: true,
      },
      where: {
        updatedAt: {
          gte: startDate,
        },
      },
    });

    const avgSessionTime = sessionTimeData._avg.watchedSeconds || 0;

    return {
      activeUsers: userCount,
      avgSessionTime: Math.round(avgSessionTime / 60), // Convert to minutes
      completionRate: totalLectureViews > 0 
        ? Math.round((completedLectures / totalLectureViews) * 100) 
        : 0,
      engagementData: [
        { label: 'Đăng nhập hàng ngày', value: '85%', percentage: 85 },
        { label: 'Hoàn thành bài học', value: '72%', percentage: 72 },
        { label: 'Thời gian học trung bình', value: `${Math.round(avgSessionTime / 60)}p`, percentage: 75 },
      ],
    };
  }

  /**
   * Get popular content
   */
  async getPopularContent(limit: number = 5) {
    const lectures = await prisma.lecture.findMany({
      include: {
        course: {
          select: {
            title: true,
          },
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
    });

    // Sort by progress count and take top N
    const sortedLectures = lectures
      .sort((a, b) => b._count.progress - a._count.progress)
      .slice(0, limit);

    return sortedLectures.map((lecture) => ({
      id: lecture.id,
      title: lecture.title,
      type: 'Bài giảng',
      views: lecture._count.progress,
      course: lecture.course.title,
      completionRate: 85, // Placeholder, would need more complex query
    }));
  }

  /**
   * Get subject progress
   */
  async getSubjectProgress() {
    const enrollmentsBySubject = await prisma.enrollment.groupBy({
      by: ['courseId'],
      _count: {
        id: true,
      },
    });

    const courses = await prisma.course.findMany({
      select: {
        id: true,
        subject: true,
      },
    });

    const subjectCounts: Record<string, number> = {};
    for (const enrollment of enrollmentsBySubject) {
      const course = courses.find(c => c.id === enrollment.courseId);
      if (course) {
        subjectCounts[course.subject] = (subjectCounts[course.subject] || 0) + enrollment._count.id;
      }
    }

    const subjects = Object.entries(subjectCounts).map(([subject, count]) => ({
      subject,
      _count: { id: count },
    }));

    return subjects.map((subject) => ({
      name: this.getSubjectName(subject.subject as Subject),
      percentage: Math.min(Math.round(Math.random() * 40 + 60), 100), // Placeholder
      students: subject._count.id,
    }));
  }

  // Helper methods
  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  }

  private getSubjectName(subject: Subject): string {
    const names: Record<Subject, string> = {
      MATH: 'Toán học',
      VIETNAMESE: 'Tiếng Việt',
      ENGLISH: 'Tiếng Anh',
      SCIENCE: 'Khoa học',
      HISTORY: 'Lịch sử',
      GEOGRAPHY: 'Địa lý',
      ART: 'Mỹ thuật',
      MUSIC: 'Âm nhạc',
      PE: 'Thể dục',
      LIFE_SKILLS: 'Kỹ năng sống',
    };
    return names[subject] || subject;
  }
}

export const adminService = new AdminService();
