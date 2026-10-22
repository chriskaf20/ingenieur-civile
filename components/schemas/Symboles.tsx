import { BarreCoupe } from '@/components/drawing/Armatures';
import { Cote } from '@/components/drawing/Cote';
import { Figure, Renvoi } from '@/components/drawing/Figure';
import { creerRepere } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { Axe, Niveau, NiveauPlan, Nord, RepereCoupe } from '@/components/drawing/Reperes';

interface Symbole {
  id: string;
  nom: string;
  sens: string;
  dessin: React.ReactNode;
}

const W = 150;
const H = 54;

export const SYMBOLES: Record<'traits' | 'reperes' | 'elements', Symbole[]> = {
  traits: [
    { id: 'fort', nom: 'Trait continu fort', sens: 'Contours vus et parties coupées par le plan de coupe.', dessin: <line x1={10} y1={27} x2={140} y2={27} className="t-fort" strokeWidth={2.4} /> },
    { id: 'fin', nom: 'Trait continu fin', sens: 'Lignes de cote, de rappel et de renvoi ; hachures.', dessin: <line x1={10} y1={27} x2={140} y2={27} className="t-fin" strokeWidth={0.8} /> },
    { id: 'cache', nom: 'Trait interrompu', sens: 'Contours et arêtes cachés (une fondation sous le sol, par exemple).', dessin: <line x1={10} y1={27} x2={140} y2={27} className="t-cache" strokeWidth={1.1} /> },
    { id: 'axe', nom: 'Trait mixte fin', sens: 'Axes, plans de symétrie, traces des plans de coupe.', dessin: <line x1={10} y1={27} x2={140} y2={27} className="t-axe" strokeWidth={0.9} /> },
    { id: 'cote', nom: 'Ligne de cote', sens: 'Dimension réelle, quelle que soit l’échelle. Extrémités en traits obliques (bâtiment) ou en flèches.', dessin: <><line x1={18} y1={14} x2={18} y2={44} className="t-fin" /><line x1={132} y1={14} x2={132} y2={44} className="t-fin" /><Cote x1={18} y1={40} x2={132} y2={40} decalage={0} texte="3,60" /></> },
  ],
  reperes: [
    { id: 'niv-coupe', nom: 'Niveau en coupe ou en élévation', sens: 'Altitude par rapport au niveau de référence ±0,00 (en m).', dessin: <><line x1={10} y1={36} x2={140} y2={36} className="t-fort" /><Niveau x={40} y={36} texte="+2,80" longueur={60} /></> },
    { id: 'niv-plan', nom: 'Niveau en plan', sens: 'Altitude d’un plancher ou d’un sol fini, inscrite sur le plan.', dessin: <NiveauPlan x={30} y={28} texte="+0,15" /> },
    { id: 'file', nom: 'Repère de file', sens: 'Axe d’une file de poteaux ou de murs ; lettres dans un sens, chiffres dans l’autre.', dessin: <Axe x1={38} y1={27} x2={140} y2={27} repere="B" /> },
    { id: 'coupe', nom: 'Repère de coupe', sens: 'Trace du plan de coupe ; les flèches montrent le sens d’observation. La vue s’appelle « coupe 1-1 ».', dessin: <RepereCoupe x1={30} y1={34} x2={120} y2={34} nom="1" sens={-1} /> },
    { id: 'nord', nom: 'Nord', sens: 'Orientation du plan.', dessin: <Nord x={75} y={32} taille={13} /> },
    { id: 'pente', nom: 'Pente', sens: 'Sens de l’écoulement de l’eau et pente en %.', dessin: <><line x1={20} y1={30} x2={118} y2={30} className="t-moyen" /><polygon points="130,30 116,25 116,35" fill="var(--trait)" /><text x={60} y={22} fontSize={12} textAnchor="middle">2 %</text></> },
  ],
  elements: [
    { id: 'poteau', nom: 'Poteau en béton armé (plan)', sens: 'Section coupée par le plan horizontal : hachurée ou noircie.', dessin: <><Hachures prefixe="sy-pot" types={['ba']} /><rect x={58} y={10} width={34} height={34} fill={hachure('sy-pot', 'ba')} className="t-fort" /></> },
    { id: 'mur', nom: 'Mur en maçonnerie (plan)', sens: 'Mur coupé : deux traits forts et hachures de maçonnerie.', dessin: <><Hachures prefixe="sy-mur" types={['maconnerie']} /><rect x={10} y={20} width={130} height={14} fill={hachure('sy-mur', 'maconnerie')} className="t-fort" /></> },
    { id: 'porte', nom: 'Porte battante (plan)', sens: 'L’arc montre le sens d’ouverture du vantail.', dessin: <><rect x={10} y={40} width={40} height={8} fill="var(--fond-macon)" className="t-fort" /><rect x={100} y={40} width={40} height={8} fill="var(--fond-macon)" className="t-fort" /><line x1={50} y1={40} x2={50} y2={6} className="t-moyen" /><path d="M50 6 A34 34 0 0 1 84 40" className="t-fin" /></> },
    { id: 'fenetre', nom: 'Fenêtre (plan)', sens: 'Baie dans le mur ; le trait fin médian figure le vitrage.', dessin: <><rect x={10} y={22} width={45} height={12} fill="var(--fond-macon)" className="t-fort" /><rect x={95} y={22} width={45} height={12} fill="var(--fond-macon)" className="t-fort" /><path d="M55 22h40M55 34h40M55 28h40" className="t-fin" /></> },
    { id: 'tremie', nom: 'Trémie', sens: 'Ouverture dans un plancher (escalier, gaine) : rectangle barré.', dessin: <path d="M45 8h60v38H45zM45 8l60 38M105 8L45 46" className="t-moyen" /> },
    { id: 'barre', nom: 'Barre HA en coupe', sens: '« 4 HA 12 » : 4 barres à haute adhérence de 12 mm de diamètre.', dessin: <><BarreCoupe cx={40} cy={27} r={6} /><text x={56} y={31} fontSize={13}>4 HA 12</text></> },
    { id: 'espacement', nom: 'Armatures réparties', sens: '« HA 8 e = 15 » : barres de 8 mm espacées de 15 cm (e = espacement).', dessin: <><path d="M14 12v30M34 12v30M54 12v30M74 12v30" className="t-armature" /><text x={86} y={32} fontSize={12}>HA 8 e = 15</text></> },
  ],
};

/** Tableau symbole → nom → signification, pour la fiche mémo. */
export function TableauSymboles({ groupe }: { groupe: keyof typeof SYMBOLES }) {
  return (
    <div className="tableau">
      <table>
        <thead>
          <tr>
            <th style={{ width: 160 }}>Symbole</th>
            <th>Nom</th>
            <th>Signification</th>
          </tr>
        </thead>
        <tbody>
          {SYMBOLES[groupe].map((s) => (
            <tr key={s.id}>
              <td className="!p-0.5">
                <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="dessin block" role="img" aria-label={s.nom}>
                  {s.dessin}
                </svg>
              </td>
              <td className="font-semibold">{s.nom}</td>
              <td>{s.sens}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Données du plan de pièce d'exemple (L1.6.5), en m : murs axés sur les files. */
export const PIECE = { entraxeX: 4.2, entraxeY: 3.4, mur: 0.2, poteau: 0.25, porte: [0.6, 1.5], fenetre: [1.0, 2.4], niveau: '+0,15' } as const;

/** Plan d'une pièce où chaque symbole de la fiche apparaît en situation. */
export function PlanPiece({ largeur = 620 }: { largeur?: number }) {
  const P = PIECE;
  const rep = creerRepere({ xmin: -1.25, xmax: P.entraxeX + 1.1, ymin: -1.2, ymax: P.entraxeY + 1.0 }, largeur, 10);
  const e = P.mur / 2;
  const R = (x0: number, y0: number, x1: number, y1: number) => ({ x: rep.x(x0), y: rep.y(y1), width: rep.lx(x1 - x0), height: rep.lx(y1 - y0) });
  const [p0, p1] = P.porte;
  const [f0, f1] = P.fenetre;
  const murs = [
    R(-e, -e, p0, e), R(p1, -e, P.entraxeX + e, e), // mur bas, coupé par la porte
    R(-e, P.entraxeY - e, P.entraxeX + e, P.entraxeY + e), // mur haut
    R(-e, -e, e, P.entraxeY + e), // mur gauche
    R(P.entraxeX - e, -e, P.entraxeX + e, f0), R(P.entraxeX - e, f1, P.entraxeX + e, P.entraxeY + e), // mur droit, coupé par la fenêtre
  ];
  const poteaux = [[0, 0], [P.entraxeX, 0], [P.entraxeX, P.entraxeY], [0, P.entraxeY]] as const;
  const h = P.poteau / 2;
  const largeurPorte = p1 - p0;
  return (
    <Figure alt="Plan d'une pièce : murs, poteaux, porte, fenêtre, axes repérés, cotes, niveau, repère de coupe et nord" largeur={rep.largeur} hauteur={rep.hauteur} className="mx-auto max-w-[560px]">
      <Hachures prefixe="pp" types={['maconnerie', 'ba']} />
      {murs.map((m, i) => (
        <rect key={i} {...m} fill={hachure('pp', 'maconnerie')} className="t-fort" />
      ))}
      {poteaux.map(([x, y], i) => (
        <rect key={i} {...R(x - h, y - h, x + h, y + h)} fill={hachure('pp', 'ba')} className="t-fort" />
      ))}
      <path d={`M${rep.x(p0)} ${rep.y(e)} L${rep.x(p0)} ${rep.y(e + largeurPorte)} A ${rep.lx(largeurPorte)} ${rep.lx(largeurPorte)} 0 0 1 ${rep.x(p1)} ${rep.y(e)}`} className="t-fin" />
      <line x1={rep.x(p0)} y1={rep.y(e)} x2={rep.x(p0)} y2={rep.y(e + largeurPorte)} className="t-moyen" />
      <path d={`M${rep.x(P.entraxeX - e)} ${rep.y(f0)} V${rep.y(f1)} M${rep.x(P.entraxeX)} ${rep.y(f0)} V${rep.y(f1)} M${rep.x(P.entraxeX + e)} ${rep.y(f0)} V${rep.y(f1)}`} className="t-fin" />
      <Axe x1={rep.x(0)} y1={rep.y(-0.75)} x2={rep.x(0)} y2={rep.y(P.entraxeY + 0.45)} repere="A" />
      <Axe x1={rep.x(P.entraxeX)} y1={rep.y(-0.75)} x2={rep.x(P.entraxeX)} y2={rep.y(P.entraxeY + 0.45)} repere="B" />
      <Axe x1={rep.x(-0.85)} y1={rep.y(0)} x2={rep.x(P.entraxeX + 0.45)} y2={rep.y(0)} repere="1" />
      <Axe x1={rep.x(-0.85)} y1={rep.y(P.entraxeY)} x2={rep.x(P.entraxeX + 0.45)} y2={rep.y(P.entraxeY)} repere="2" />
      <Cote x1={rep.x(0)} y1={rep.y(-0.6)} x2={rep.x(P.entraxeX)} y2={rep.y(-0.6)} texte={nombre(P.entraxeX, 2)} />
      <Cote x1={rep.x(e)} y1={rep.y(P.entraxeY / 2 + 0.6)} x2={rep.x(P.entraxeX - e)} y2={rep.y(P.entraxeY / 2 + 0.6)} texte={nombre(P.entraxeX - P.mur, 2)} />
      <Cote x1={rep.x(-0.6)} y1={rep.y(0)} x2={rep.x(-0.6)} y2={rep.y(P.entraxeY)} texte={nombre(P.entraxeY, 2)} />
      <Cote x1={rep.x(p0)} y1={rep.y(-0.3)} x2={rep.x(p1)} y2={rep.y(-0.3)} texte={nombre(largeurPorte, 2)} taille={10.5} />
      <NiveauPlan x={rep.x(1.2)} y={rep.y(1.3)} texte={P.niveau} />
      <RepereCoupe x1={rep.x(2.6)} y1={rep.y(P.entraxeY + 0.6)} x2={rep.x(2.6)} y2={rep.y(-0.35)} nom="1" />
      <Nord x={rep.x(P.entraxeX + 0.75)} y={rep.y(P.entraxeY + 0.55)} taille={13} />
      <Renvoi de={[rep.x(P.entraxeX + 0.3), rep.y(f1 + 0.4)]} vers={[rep.x(P.entraxeX), rep.y((f0 + f1) / 2)]} texte="fenêtre" />
      <Renvoi de={[rep.x(1.9), rep.y(0.75)]} vers={[rep.x(p0 + 0.45), rep.y(0.45)]} texte="porte" />
    </Figure>
  );
}
