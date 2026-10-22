import { positionsBarres } from '@/components/drawing/Armatures';
import { Cote } from '@/components/drawing/Cote';
import { Etiquette, Figure } from '@/components/drawing/Figure';
import { hachure, Hachures } from '@/components/drawing/Hachures';
import { Calque } from '@/components/gabarits/Vue3D';
import { positionsCadres, type DonneesPoteau, type ResultatPoteau } from '@/lib/calc/ba/poteau';
import { boite2D, projeterIso, type Point3 } from '@/lib/drawing/iso';
import { creerRepere, points } from '@/lib/drawing/repere';
import { nombre } from '@/lib/format';

function geometrie(d: DonneesPoteau, r: ResultatPoteau) {
  const a = Math.min(d.a, d.b);
  const b = Math.max(d.a, d.b);
  const c = r.ec2.enrobage.cnom / 1000;
  const t = r.ec2.phiT / 1000;
  const dp = c + t + r.ec2.barres.phi / 2000;
  const zone = Math.min(r.ec2.zoneExtremite, d.l / 2);
  const cadres = positionsCadres(d.l, zone, r.ec2.sMaxExtremites, r.ec2.sMax);
  return { a, b, c, t, dp, zone, cadres };
}

/** Poteau en perspective : béton en transparence, barres longitudinales, cadres, cotes. */
export function PoteauIso({ d, r, largeur = 360, hauteurMax = 600 }: { d: DonneesPoteau; r: ResultatPoteau; largeur?: number; hauteurMax?: number }) {
  const { a, b, c, t, dp, cadres } = geometrie(d, r);
  const coins: Point3[] = [
    [0, 0, 0], [a, 0, 0], [a, b, 0], [0, b, 0],
    [0, 0, d.l], [a, 0, d.l], [a, b, d.l], [0, b, d.l],
  ];
  const extra: Point3[] = [[a + 0.45, b + 0.45, -0.1], [-0.2, -0.2, d.l + 0.2]];
  const bx = boite2D([...coins, ...extra].map(projeterIso));
  const marge = 22;
  // Un poteau est élancé : on ajuste l'échelle à la hauteur disponible si besoin.
  const k = Math.min((largeur - 2 * marge) / (bx.xmax - bx.xmin), (hauteurMax - 2 * marge) / (bx.ymax - bx.ymin));
  const largeurUtile = (bx.xmax - bx.xmin) * k + 2 * marge;
  const hauteur = (bx.ymax - bx.ymin) * k + 2 * marge;
  const P = (p: Point3) => {
    const [u, v] = projeterIso(p);
    return [(u - bx.xmin) * k + marge, (v - bx.ymin) * k + marge] as const;
  };
  const pts = (l: Point3[]) => points(l.map(P));
  const barres = positionsBarres(r.ec2.barres.n, dp, dp, a - dp, b - dp);
  const ax = c + t / 2;
  const cadre = (z: number): Point3[] => [[ax, ax, z], [a - ax, ax, z], [a - ax, b - ax, z], [ax, b - ax, z], [ax, ax, z]];
  const visibles = [
    [[0, 0, d.l], [a, 0, d.l], [a, b, d.l], [0, b, d.l]], // dessus
    [[a, 0, 0], [a, b, 0], [a, b, d.l], [a, 0, d.l]], // face +x
    [[0, b, 0], [a, b, 0], [a, b, d.l], [0, b, d.l]], // face +y
  ] as Point3[][];
  return (
    <Figure
      alt={`Poteau ${nombre(a * 100, 0)} × ${nombre(b * 100, 0)} cm de ${nombre(d.l, 2)} m en perspective : ${r.ec2.barres.n} HA ${r.ec2.barres.phi} et ${cadres.length} cadres HA ${r.ec2.phiT}, resserrés près des planchers`}
      largeur={largeurUtile}
      hauteur={hauteur}
      largeurMin={largeurUtile}
    >
      <polyline points={pts([[0, 0, 0], [a, 0, 0]])} className="t-cache" />
      <polyline points={pts([[0, 0, 0], [0, b, 0]])} className="t-cache" />
      <polyline points={pts([[0, 0, 0], [0, 0, d.l]])} className="t-cache" />
      <Calque id="longitudinales">
        {barres.map(([x, y], i) => (
          <polyline key={i} points={pts([[x, y, 0], [x, y, d.l]])} className="t-armature" strokeWidth={2.2} />
        ))}
      </Calque>
      <Calque id="cadres">
        {cadres.map((z) => (
          <polyline key={z} points={pts(cadre(z))} className="t-armature" strokeWidth={0.9} />
        ))}
      </Calque>
      <Calque id="beton">
        {visibles.map((f, i) => (
          <polygon key={i} points={pts(f)} fill="var(--color-beton)" fillOpacity={i === 0 ? 0.28 : i === 1 ? 0.16 : 0.22} className="t-moyen" />
        ))}
      </Calque>
      <Calque id="cotes">
        <Cote {...seg(P([0, b, 0]), P([a, b, 0]))} decalage={-14} texte={`a ${nombre(a * 100, 0)}`} taille={11} />
        <Cote {...seg(P([a, 0, 0]), P([a, b, 0]))} decalage={14} texte={`b ${nombre(b * 100, 0)}`} taille={11} />
        <Cote {...seg(P([a, b + 0.3, 0]), P([a, b + 0.3, d.l]))} texte={`l = ${nombre(d.l, 2)} m`} taille={11} />
      </Calque>
    </Figure>
  );
}

function seg(p: readonly [number, number], q: readonly [number, number]) {
  return { x1: p[0], y1: p[1], x2: q[0], y2: q[1] };
}

/** Élévation du ferraillage : zones d'extrémité à espacement réduit et partie courante. */
export function PoteauElevation({ d, r, largeur = 300 }: { d: DonneesPoteau; r: ResultatPoteau; largeur?: number }) {
  const { b, c, dp, zone, cadres } = geometrie(d, r);
  const rep = creerRepere({ xmin: -0.55, xmax: b + 0.75, ymin: -0.25, ymax: d.l + 0.25 }, largeur, 14);
  const R = (x0: number, z0: number, x1: number, z1: number) => ({ x: rep.x(x0), y: rep.y(z1), width: rep.lx(x1 - x0), height: rep.ly(z1 - z0) });
  return (
    <Figure alt={`Élévation du poteau : cadres tous les ${nombre(r.ec2.sMaxExtremites * 100, 0)} cm au plus sur ${nombre(zone, 2)} m près des planchers, tous les ${nombre(r.ec2.sMax * 100, 0)} cm au plus ailleurs`} largeur={rep.largeur} hauteur={rep.hauteur} largeurMin={240}>
      <Hachures prefixe="pe" types={['ba']} />
      <rect {...R(-0.5, d.l, b + 0.5, d.l + 0.2)} fill={hachure('pe', 'ba')} className="t-moyen" />
      <rect {...R(-0.5, -0.2, b + 0.5, 0)} fill={hachure('pe', 'ba')} className="t-moyen" />
      <rect {...R(0, 0, b, d.l)} fill="var(--fond-beton)" className="t-fort" />
      {[dp, b - dp].map((x) => (
        <line key={x} x1={rep.x(x)} y1={rep.y(-0.12)} x2={rep.x(x)} y2={rep.y(d.l + 0.12)} className="t-armature" strokeWidth={2} />
      ))}
      {cadres.map((z) => (
        <line key={z} x1={rep.x(c)} y1={rep.y(z)} x2={rep.x(b - c)} y2={rep.y(z)} className="t-armature" strokeWidth={1} />
      ))}
      <Cote x1={rep.x(b)} y1={rep.y(0)} x2={rep.x(b)} y2={rep.y(zone)} decalage={-16} texte={`${nombre(zone, 2)}`} taille={10.5} />
      <Cote x1={rep.x(b)} y1={rep.y(d.l - zone)} x2={rep.x(b)} y2={rep.y(d.l)} decalage={-16} texte={`${nombre(zone, 2)}`} taille={10.5} />
      <Etiquette x={rep.x(b) + 34} y={rep.y(zone / 2) + 4} taille={10.5}>
        s ≤ {nombre(r.ec2.sMaxExtremites * 100, 0)} cm
      </Etiquette>
      <Etiquette x={rep.x(b) + 34} y={rep.y(d.l / 2) + 4} taille={10.5}>
        s ≤ {nombre(r.ec2.sMax * 100, 0)} cm
      </Etiquette>
      <Etiquette x={rep.x(b) + 34} y={rep.y(d.l - zone / 2) + 4} taille={10.5}>
        s ≤ {nombre(r.ec2.sMaxExtremites * 100, 0)} cm
      </Etiquette>
      <Etiquette x={rep.x(b / 2)} y={rep.y(d.l + 0.2) - 4} ancre="middle" taille={10.5}>
        plancher haut
      </Etiquette>
      <Etiquette x={rep.x(b / 2)} y={rep.y(-0.2) + 13} ancre="middle" taille={10.5}>
        plancher bas
      </Etiquette>
    </Figure>
  );
}

/** Bande horizontale : le poteau « couché », chaque trait rouge est un cadre (pour l'infographie). */
export function PoteauCadresBande({ d, r, largeur = 320 }: { d: DonneesPoteau; r: ResultatPoteau; largeur?: number }) {
  const { zone, cadres } = geometrie(d, r);
  const marge = 16;
  const k = (largeur - 2 * marge) / d.l;
  const x = (z: number) => marge + z * k;
  const haut = 20;
  const bas = 46;
  return (
    <Figure alt={`Répartition des ${cadres.length} cadres le long du poteau : resserrés sur ${nombre(zone, 2)} m en pied et en tête`} largeur={largeur} hauteur={92} largeurMin={260}>
      <rect x={x(0)} y={haut} width={d.l * k} height={bas - haut} fill="var(--fond-beton)" className="t-moyen" />
      {cadres.map((z) => (
        <line key={z} x1={x(z)} y1={haut + 2} x2={x(z)} y2={bas - 2} className="t-armature" strokeWidth={1.2} />
      ))}
      <Etiquette x={x(0)} y={haut - 5} taille={10.5}>pied</Etiquette>
      <Etiquette x={x(d.l)} y={haut - 5} ancre="end" taille={10.5}>tête</Etiquette>
      <Cote x1={x(0)} y1={bas} x2={x(zone)} y2={bas} decalage={-12} texte={`≤ ${nombre(r.ec2.sMaxExtremites * 100, 0)}`} taille={10.5} />
      <Cote x1={x(zone)} y1={bas} x2={x(d.l - zone)} y2={bas} decalage={-12} texte={`s ≤ ${nombre(r.ec2.sMax * 100, 0)} cm`} taille={10.5} />
      <Cote x1={x(d.l - zone)} y1={bas} x2={x(d.l)} y2={bas} decalage={-12} texte={`≤ ${nombre(r.ec2.sMaxExtremites * 100, 0)}`} taille={10.5} />
    </Figure>
  );
}
