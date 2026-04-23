const normalizeBaseUrl = (value: string): string => {
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const siteUrl = normalizeBaseUrl((runtimeConfig.public.siteUrl as string) || 'http://localhost:3000');

  const body = [
    'User-Agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');

  setHeader(event, 'content-type', 'text/plain; charset=utf-8');
  return body;
});
