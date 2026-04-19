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
    '/gaming-logo-maker',
    '/logo-maker-for-startups',
    '/logo-maker-for-youtube',
    '/logo-maker-for-clothing-brand',
    '/free-ai-logo-generator',
    '/blog/best-nft-logo-maker-2026',
    '/blog/smart-logo-maker-vs-looka-2026',
    '/blog/smart-logo-maker-vs-brandmark-2026',
    '/blog/best-real-estate-logo-maker-2026',
    '/blog/best-ai-logo-maker-for-small-business-2026',
    '/blog/smart-logo-maker-vs-tailor-brands-2026',
    '/blog/smart-logo-maker-vs-wix-2026',
    '/blog/smart-logo-maker-vs-canva-2026',
    '/blog/best-logo-maker-for-professional-services-2026',
    '/blog/best-free-ai-logo-generator-no-signup-2026',
    '/blog/best-youtube-logo-maker-2026',
    '/blog/best-logo-maker-for-clothing-brands-2026',
    '/blog/ultimate-ai-logo-design-guide-2026',
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
