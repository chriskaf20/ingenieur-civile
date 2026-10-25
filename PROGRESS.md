# Avancement

**Phase en cours :** 4 (contenu module par module). Module L1.2 terminé ; L1.3 à L1.5 enchaînés à la demande de l'utilisateur.

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- Niveau N0 complet (N0.1 à N0.7) et L1.1 (introduction au génie civil).
- L1.2 Analyse : 10 leçons, mini-projet (section en T), examen ; calculs `lib/calc/analyse.ts` (limites, dérivées, extremums, approximations, intégrales, inerties, dérivées partielles, cubatures) ; 11 fiches (`components/calculs/analyse.tsx`) ; tracés de fonctions `components/drawing/Graphe.tsx` ; schémas et cuve 3D en calques `components/schemas/Analyse.tsx`.
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à L1.2 tiennent en A4.
- 213 tests au vert, build au vert.

**Prochaine étape :** module L1.3 (mécanique générale et statique).

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22, 26, 27 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23, 24, 25, 28 à 32 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
