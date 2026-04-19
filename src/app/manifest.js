export default function manifest() {
  return {
    name: 'Smart Logo Maker',
    short_name: 'SmartLogo',
    description: 'Create professional logos in seconds with AI.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/assets/icons/logo_app.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
