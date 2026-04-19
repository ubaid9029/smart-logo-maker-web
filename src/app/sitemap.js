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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
