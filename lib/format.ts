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

/** Décomposition x = m × 10^e avec 1 ≤ |m| < 10 (x non nul). */
export function notationScientifique(x: number): { m: number; e: number } {
  if (x === 0 || !Number.isFinite(x)) return { m: x, e: 0 };
  let e = Math.floor(Math.log10(Math.abs(x)));
  let m = Number((x / 10 ** e).toPrecision(15)); // élimine les résidus binaires (ex. 9,9999999…)
  if (Math.abs(m) >= 10) {
    m /= 10;
    e += 1;
  }
  return { m, e };
}

/** Arrondi à `cs` chiffres significatifs : arrondiSignificatif(0.0012345, 3) → 0,00123. */
export function arrondiSignificatif(x: number, cs: number): number {
  if (x === 0 || !Number.isFinite(x)) return x;
  const { m, e } = notationScientifique(x);
  const r = arrondi(m, cs - 1);
  // 9,995 à 3 CS → 10,0 : on renormalise
  return Number(`${r}e${e}`);
}

const EXPOSANTS: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

/** Écriture scientifique à `cs` chiffres significatifs : « 1,23 × 10⁻³ ». */
export function scientifique(x: number, cs = 3): string {
  if (x === 0) return nombre(0, cs - 1);
  const { m, e } = notationScientifique(arrondiSignificatif(x, cs));
  const exp = String(e)
    .split('')
    .map((c) => EXPOSANTS[c] ?? c)
    .join('');
  return e === 0 ? nombre(m, cs - 1) : `${nombre(m, cs - 1)} × 10${exp}`;
}

/** Exposant écrit en caractères suscrits : exposantTexte(-2) → « ⁻² ». */
export function exposantTexte(n: number): string {
  return String(n)
    .split('')
    .map((c) => EXPOSANTS[c] ?? c)
    .join('');
}

/** Puissance de dix lisible : puissanceDix(-3) → « 10⁻³ ». */
export function puissanceDix(n: number): string {
  return `10${exposantTexte(n)}`;
}

const formatsCourts = new Map<number, Intl.NumberFormat>();

/** Nombre sans zéros inutiles, au plus `maxDecimales` décimales : nombreCourt(2.50) → « 2,5 ». */
export function nombreCourt(x: number, maxDecimales = 6): string {
  if (!Number.isFinite(x)) return '—';
  let f = formatsCourts.get(maxDecimales);
  if (!f) {
    f = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: maxDecimales });
    formatsCourts.set(maxDecimales, f);
  }
  return f.format(arrondi(x, maxDecimales));
}
