// Formatage des nombres à la française (virgule décimale, espace fine insécable
// pour les milliers) et arrondis explicites (demi à l'écart de zéro).

const formats = new Map<number, Intl.NumberFormat>();

function formateur(decimales: number): Intl.NumberFormat {
  let f = formats.get(decimales);
  if (!f) {
    f = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });
    formats.set(decimales, f);
  }
  return f;
}

/** Arrondit à `decimales` chiffres après la virgule, demi à l'écart de zéro. */
export function arrondi(x: number, decimales = 0): number {
  if (!Number.isFinite(x)) return x;
  const signe = x < 0 ? -1 : 1;
  const r = Number(`${Math.round(Number(`${Math.abs(x)}e${decimales}`))}e-${decimales}`);
  return r === 0 ? 0 : signe * r;
}

/** Arrondi au multiple supérieur de `pas` (ex. quantités à commander). */
export function arrondiSup(x: number, pas = 1): number {
  return Math.ceil(arrondi(x / pas, 9)) * pas;
}

/** Arrondi au multiple inférieur de `pas` (ex. espacement maximal d'armatures). */
export function arrondiInf(x: number, pas = 1): number {
  return Math.floor(arrondi(x / pas, 9)) * pas;
}

/** Nombre écrit à la française : nombre(1234.5, 2) → « 1 234,50 ». */
export function nombre(x: number, decimales = 2): string {
  if (!Number.isFinite(x)) return '—';
  return formateur(decimales).format(arrondi(x, decimales));
}

/** Nombre suivi de son unité, séparés par une espace insécable. */
export function grandeur(x: number, decimales: number, unite: string): string {
  return `${nombre(x, decimales)} ${unite}`;
}

/** Angle en degrés à partir de radians. */
export function degres(rad: number): number {
  return (rad * 180) / Math.PI;
}
