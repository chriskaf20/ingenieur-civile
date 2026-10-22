import Link from 'next/link';

export const metadata = { title: 'Hors ligne' };

export default function HorsLigne() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-technique text-3xl font-bold text-encre">Tu es hors ligne</h1>
      <p className="mt-3">
        Cette page n’a pas encore été enregistrée sur ton appareil. Les leçons déjà ouvertes restent consultables sans connexion.
      </p>
      <p className="mt-4">
        <Link href="/" className="text-encre underline">
          Revenir à l’accueil
        </Link>
      </p>
    </div>
  );
}
