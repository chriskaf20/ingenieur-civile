import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LeconContexte } from '@/components/page/LeconContexte';
import { Lecteur } from '@/components/page/Lecteur';
import { PageObjectifs } from '@/components/page/PageObjectifs';
import { leconParSlug, lecons, voisines } from '@/lib/contenu';

export const dynamicParams = false;

export function generateStaticParams() {
  return lecons().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = leconParSlug(slug);
  return l ? { title: `${l.meta.id} ${l.meta.titre}`, description: l.cursus.objectif } : {};
}

export default async function PageLecon({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lecon = leconParSlug(slug);
  if (!lecon) notFound();
  const { default: Contenu } = await import(`@/content/lecons/${slug}.mdx`);
  const { precedente, suivante } = voisines(lecon.meta.id);
  const lien = (l: typeof precedente) => (l ? { href: `/lecons/${l.slug}`, titre: `${l.meta.id} ${l.meta.titre}` } : undefined);
  return (
    <LeconContexte
      valeur={{ id: lecon.meta.id, titre: lecon.meta.titre, moduleId: lecon.module.id, moduleTitre: lecon.module.titre, relecture: lecon.meta.relecture }}
    >
      <Lecteur precedente={lien(precedente)} suivante={lien(suivante)}>
        <PageObjectifs lecon={lecon} />
        <Contenu />
      </Lecteur>
    </LeconContexte>
  );
}
