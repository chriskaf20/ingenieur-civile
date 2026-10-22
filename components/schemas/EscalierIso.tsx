import { Cote } from '@/components/drawing/Cote';
import { Figure, Renvoi } from '@/components/drawing/Figure';
import { Calque } from '@/components/gabarits/Vue3D';
import { escalierDroit, profilEscalier, type DonneesEscalier } from '@/lib/calc/escalier';
import { boite2D, profondeurIso, projeterIso, centre, type Point3 } from '@/lib/drawing/iso';
import { points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

/**
 * Escalier droit autoporteur à deux volées, en perspective isométrique.
 * La paillasse va d'un plancher à l'autre sans appui intermédiaire.
 */
export function EscalierIso({ d, largeur = 660 }: { d: DonneesEscalier; largeur?: number }) {
  const r = escalierDroit(d);
  const { dessus, dessous } = profilEscalier(d, r);
  const E = d.emmarchement;
  const R = r.reculement;
  const ep = 0.2; // épaisseur des planchers dessinés (illustration)

  // Boîtes des planchers (contexte)
  const dalle = (x0: number, x1: number, z0: number, z1: number) => {
    const y0 = -0.3;
    const y1 = E + 0.3;
    return [
      [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], // dessus
      [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], // face +x
      [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], // face +y
    ] as Point3[][];
  };
  const dalleBas = dalle(R, R + 1.3, -ep, 0);
  const dalleHaut = dalle(-1.3, 0, d.H - ep, d.H);

  // Faces visibles de l'escalier : marches et contremarches (extrusion du profil selon y), puis flanc y = E
  const faces: Point3[][] = [];
  for (let i = 0; i < dessus.length - 1; i++) {
    const [x1, z1] = dessus[i]!;
    const [x2, z2] = dessus[i + 1]!;
    faces.push([[x1, 0, z1], [x2, 0, z2], [x2, E, z2], [x1, E, z1]]);
  }
  faces.sort((a, b) => profondeurIso(centre(a)) - profondeurIso(centre(b)));
  const flanc: Point3[] = [...dessus, ...dessous].map(([x, z]) => [x, E, z] as Point3);

  // Mise à l'échelle de la projection
  const tous = [...dalleBas.flat(), ...dalleHaut.flat(), ...flanc, [R + 1.6, E + 0.9, -0.3] as Point3, [-1.3, -0.4, d.H + 0.5] as Point3].map(projeterIso);
  const b = boite2D(tous);
  const marge = 26;
  const k = (largeur - 2 * marge) / (b.xmax - b.xmin);
  const hauteur = (b.ymax - b.ymin) * k + 2 * marge;
  const P = (p: Point3) => {
    const [u, v] = projeterIso(p);
    return [(u - b.xmin) * k + marge, (v - b.ymin) * k + marge] as const;
  };
  const poly = (pts: Point3[]) => points(pts.map(P));

  const xPalier0 = (r.n2 - 1) * r.g;
  const xPalier1 = xPalier0 + d.palier;
  const zP = r.hauteurPalier;
  // Armatures principales de la paillasse (principe), à 3,5 cm au-dessus du dessous
  const fil = (y: number) => points(dessous.map(([x, z]) => P([x, y, z + 0.035])));

  return (
    <Figure
      alt={`Escalier droit autoporteur en perspective : ${r.n} contremarches de ${nombre(r.h * 100, 1)} cm, giron ${nombre(r.g * 100, 1)} cm, palier intermédiaire de ${nombre(d.palier, 2)} m sans appui`}
      legende="Perspective isométrique (dimensions de l’exemple, recalculées par la fonction de tracé)"
      largeur={largeur}
      hauteur={hauteur}
      className="mx-auto max-w-[610px]"
    >
      <Calque id="planchers">
        {[...dalleHaut, ...dalleBas].map((f, i) => (
          <polygon key={i} points={poly(f)} fill="var(--fond-ba)" className="t-moyen" />
        ))}
      </Calque>
      {faces.map((f, i) => {
        const horizontale = Math.abs(f[0]![2] - f[1]![2]) < 1e-9;
        return <polygon key={i} points={poly(f)} fill={horizontale ? '#f4f1ea' : '#d9d4c7'} className="t-moyen" />;
      })}
      <polygon points={poly(flanc)} fill="#bfb8a8" className="t-fort" />

      <Calque id="ferraillage">
        {[0.15, E / 2, E - 0.15].map((y) => (
          <polyline key={y} points={fil(y)} className="t-armature" strokeDasharray="7 3" />
        ))}
        <Renvoi de={[P([R * 0.62, E, 0])[0] + 30, P([R * 0.62, E, 0])[1] + 40]} vers={P([R - 1.3, E / 2, 0.035 + (1.3 * r.h) / r.g - 0.17])} texte="armatures principales (principe)" />
      </Calque>

      <Calque id="noms">
        {/* Les étiquettes sont placées au-dessus de l'arête arrière (y = 0), zone libre du dessin. */}
        <Renvoi de={decale(P([R - 1.5 * r.g, 0, 2 * r.h]), 58, 24)} vers={P([R - 1.5 * r.g, E * 0.55, 2 * r.h])} texte="marche (giron)" />
        <Renvoi de={decale(P([R - 2 * r.g, 0, 2.5 * r.h]), 88, -14)} vers={P([R - 2 * r.g, E * 0.45, 2.5 * r.h])} texte="contremarche" />
        <Renvoi de={decale(P([R - 3 * r.g, 0, 4 * r.h]), 78, -46)} vers={P([R - 3 * r.g, E * 0.12, 4 * r.h])} texte="nez de marche" />
        <Renvoi de={decale(P([R - 6 * r.g, 0, 7 * r.h]), 92, -54)} vers={P([R - 6.5 * r.g, E * 0.5, 7 * r.h])} texte="volée 1" />
        <Renvoi de={decale(P([xPalier1, 0, zP]), 70, -50)} vers={P([(xPalier0 + xPalier1) / 2, E * 0.45, zP])} texte="palier intermédiaire" />
        <Renvoi de={decale(P([3.5 * r.g, 0, d.H - 4 * r.h]), 92, -50)} vers={P([3.5 * r.g, E * 0.5, d.H - 4 * r.h])} texte="volée 2" />
        <Renvoi de={decale(P([(xPalier0 + xPalier1) / 2, E, zP - 0.6]), -12, 58)} vers={P([(xPalier0 + xPalier1) / 2, E, zP - 0.12])} texte="paillasse" ancre="end" />
        <Renvoi de={decale(P([-0.9, -0.3, d.H]), -10, -18)} vers={P([-0.7, E * 0.3, d.H])} texte="plancher haut" ancre="end" />
        <Renvoi de={decale(P([R + 1.3, E + 0.3, -0.2]), 10, 22)} vers={P([R + 1.0, E * 0.75, 0])} texte="plancher bas" />
      </Calque>

      <Calque id="cotes">
        <Cote {...ligne(P([R, E, 0]), P([R, E, r.h]))} decalage={-14} texte={`h ${nombre(r.h * 100, 1)}`} taille={11} />
        <Cote {...ligne(P([R - r.g, E, r.h]), P([R, E, r.h]))} decalage={14} texte={`g ${nombre(r.g * 100, 1)}`} taille={11} />
        <Cote {...ligne(P([R + 0.75, 0, 0]), P([R + 0.75, E, 0]))} decalage={0} texte={`emmarchement ${nombre(E, 2)}`} taille={11} />
        <Cote {...ligne(P([xPalier0, E, zP]), P([xPalier1, E, zP]))} decalage={14} texte={`palier ${nombre(d.palier, 2)}`} taille={11} />
        <Cote {...ligne(P([0, E + 0.35, 0]), P([R, E + 0.35, 0]))} decalage={-10} texte={`reculement ${nombre(R, 2)} m`} taille={11} />
        <Cote {...ligne(P([0, E + 0.6, 0]), P([0, E + 0.6, d.H]))} decalage={0} texte={`H ${nombre(d.H, 2)} m`} taille={11} />
      </Calque>
    </Figure>
  );
}

function decale(p: readonly [number, number], dx: number, dy: number): readonly [number, number] {
  return [p[0] + dx, p[1] + dy];
}

function ligne(a: readonly [number, number], b: readonly [number, number]) {
  return { x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
}
