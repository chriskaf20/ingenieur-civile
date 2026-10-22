import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Génie Civil Académie',
    short_name: 'GC Académie',
    description: 'Du bac à l’ingénieur civil confirmé, consultable hors ligne.',
    lang: 'fr',
    start_url: '/',
    display: 'standalone',
    background_color: '#e7e2d6',
    theme_color: '#1d3a8a',
    icons: [{ src: '/icone.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
