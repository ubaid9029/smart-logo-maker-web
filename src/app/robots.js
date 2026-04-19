export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/editor', '/results', '/generating', '/favorites', '/saved', '/downloads', '/profile', '/my-designs'],
    },
    sitemap: 'https://smart-logomaker.com/sitemap.xml',
  }
}
