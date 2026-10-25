# Avancement

**Phase en cours :** 4 (contenu module par module). Module N0.7 terminé, en attente de « continue ».

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- N0.1 à N0.6 : méthode, algèbre, unités, trigonométrie, géométrie, vecteurs (leçons, mini-projets, examens).
- N0.7 Physique de base : 7 leçons, mini-projet (château d'eau), examen ; calculs `lib/calc/physique.ts` ; 8 fiches (`components/calculs/physique.tsx`) ; schémas, vue 3D de la rampe et planche de la cuve enterrée dans `components/schemas/Physique.tsx`.
- Outils de perspective partagés : `components/drawing/Iso3D.tsx` (trièdre direct).
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à N0.7 tiennent en A4.
- 171 tests au vert, build au vert.

**Prochaine étape :** le niveau N0 est complet ; module L1.1 (introduction au génie civil et aux métiers du BTP).

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22, 26, 27 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23, 24, 25, 28 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
