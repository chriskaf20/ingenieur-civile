import 'katex/dist/katex.min.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Kalam, Source_Sans_3 } from 'next/font/google';
import Link from 'next/link';
import { EnregistrementSW } from '@/components/pwa/EnregistrementSW';

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

export const viewport: Viewport = { themeColor: '#1d3a8a' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${source.variable} ${barlow.variable} ${kalam.variable}`}>
      <body className="min-h-screen">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:p-2">
          Aller au contenu
        </a>
        <header className="ne-pas-imprimer border-b border-black/10 bg-papier/90">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 font-technique">
            <Link href="/" className="text-lg font-bold tracking-wide text-encre">
              Génie Civil Académie
            </Link>
            <span className="text-sm text-beton">Phase 2 · aperçu des gabarits</span>
          </nav>
        </header>
        <main id="contenu">{children}</main>
        <EnregistrementSW />
      </body>
    </html>
  );
}
