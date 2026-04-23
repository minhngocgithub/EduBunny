interface ApiResponse<T> {
  success: boolean;
  data?: T;
}

interface SitemapCourseItem {
  id: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

const normalizeBaseUrl = (value: string): string => {
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const escapeXml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const siteUrl = normalizeBaseUrl((runtimeConfig.public.siteUrl as string) || 'http://localhost:3000');
  const apiBaseUrl = normalizeBaseUrl((runtimeConfig.public.apiBaseUrl as string) || 'http://localhost:3001/api');

  const nowIso = new Date().toISOString();
  let courses: SitemapCourseItem[] = [];

  try {
    const response = await $fetch<ApiResponse<SitemapCourseItem[]>>(`${apiBaseUrl}/courses`, {
      query: {
        page: 1,
        limit: 100,
        isPublished: true,
      },
    });

    if (response.success && Array.isArray(response.data)) {
      courses = response.data;
    }
  } catch {
    courses = [];
  }

  const urls = [
    {
      loc: `${siteUrl}/courses`,
      lastmod: nowIso,
    },
    ...courses.map((course) => ({
      loc: `${siteUrl}/courses/${course.slug || course.id}`,
      lastmod: course.updatedAt || course.createdAt || nowIso,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (entry) =>
        `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n  </url>`
    )
    .join('\n')}\n</urlset>`;

  setHeader(event, 'content-type', 'application/xml; charset=utf-8');
  return body;
});
