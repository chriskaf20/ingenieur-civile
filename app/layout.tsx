import 'katex/dist/katex.min.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Kalam, Source_Sans_3 } from 'next/font/google';
import { EnregistrementSW } from '@/components/pwa/EnregistrementSW';
import { EnTeteSite } from '@/components/site/EnTeteSite';
import { SCRIPT_THEME } from '@/components/site/ChoixTheme';

const source = Source_Sans_3({ subsets: ['latin', 'latin-ext'], variable: '--font-source', display: 'swap' });
const barlow = Barlow_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
});
const kalam = Kalam({ subsets: ['latin', 'latin-ext'], weight: ['400', '700'], variable: '--font-kalam', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Génie Civil Académie', template: '%s · Génie Civil Académie' },
  description: 'Du bac à l’ingénieur civil confirmé : cours, fiches de calcul, planches et exercices.',
  applicationName: 'Génie Civil Académie',
  icons: { icon: '/icone.svg' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1d3a8a' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1216' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${source.variable} ${barlow.variable} ${kalam.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body className="min-h-screen">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-surface focus:p-2">
          Aller au contenu
        </a>
        <EnTeteSite />
        <main id="contenu">{children}</main>
        <EnregistrementSW />
      </body>
    </html>
  );
}
