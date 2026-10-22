import { EnTete, MentionRelecture } from './EnTete';
import { ETAPES, type Etape } from './etapes';

export type VarianteFeuille = 'cours' | 'cahier' | 'planche' | 'infographie';

interface Props {
  etape?: Etape;
  titre?: React.ReactNode;
  variante?: VarianteFeuille;
  className?: string;
  children: React.ReactNode;
}

/** Une page A4 de leçon, avec en-tête (module, leçon) et pied (étape, numéro de page). */
export function Feuille({ etape, titre, variante = 'cours', className = '', children }: Props) {
  const cahier = variante === 'cahier';
  return (
    <section className={`feuille feuille--${variante} ${className}`} aria-label={typeof titre === 'string' ? titre : undefined}>
      <EnTete />
      <div className="feuille-corps">
        {titre ? (
          cahier ? (
            <h2 className="titre-souligne mb-3">{titre}</h2>
          ) : (
            <h2 className="mb-3 font-technique text-[1.6rem] font-bold leading-tight text-encre">{titre}</h2>
          )
        ) : null}
        <div className="contenu flex-1">{children}</div>
      </div>
      <div className="feuille-pied">
        <span>Génie Civil Académie</span>
        <span>{etape ? ETAPES[etape] : ''}</span>
        <span className="flex gap-3">
          <MentionRelecture />
          <span>
            p. <span className="numero-page" />
          </span>
        </span>
      </div>
    </section>
  );
}

/** Alias utilisé dans le MDX : une page de cours ordinaire. */
export function Page(props: Props) {
  return <Feuille {...props} />;
}
