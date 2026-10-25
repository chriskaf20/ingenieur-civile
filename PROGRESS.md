# Avancement

**Phase en cours :** 4 (contenu module par module). Module N0.6 terminé, en attente de « continue ».

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- N0.1 à N0.5 : méthode, algèbre, unités, trigonométrie, géométrie (leçons, mini-projets, examens).
- N0.6 Vecteurs : 5 leçons, mini-projet (mât haubané), examen ; calculs `lib/calc/vecteurs.ts` ; 6 fiches (`components/calculs/vecteurs.tsx`) ; schémas et vues 3D en trièdre direct (`projeterIsoDirect`) dans `components/schemas/Vecteurs.tsx`.
- Corrigé pendant N0.6 : `arrondi` renvoyait NaN pour un nombre écrit avec exposant (touchait aussi N0.4.4) ; `colonnes={4}` des QCM enfin pris en compte ; unités longues des fiches sans chevauchement ; registre des fiches typé (clé en double refusée à la compilation).
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à N0.6 tiennent en A4.
- 153 tests au vert, build au vert.

**Prochaine étape :** module N0.7 (physique de base).

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
