export default async function sitemap() {
  const baseUrl = 'https://smart-logomaker.com';

  const routes = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/how-it-works',
    '/guides',
    '/templates',
    '/case-studies',
    '/create',
    '/logo-maker-for-startups',
    '/logo-maker-for-youtube',
    '/logo-maker-for-clothing-brand',
    '/free-ai-logo-generator',
    '/blog/how-to-design-startup-logo-2026',
    '/blog/best-logo-colors',
    '/blog/ai-vs-human-design',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
