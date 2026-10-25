# Avancement

**Phase en cours :** 4 (contenu module par module). Module L1.1 terminé, en attente de « continue ».

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- Niveau N0 complet (N0.1 à N0.7) : leçons, mini-projets, examens.
- L1.1 Introduction au génie civil : 8 leçons, mini-projet (rapport de visite de chantier), examen ; calculs `lib/calc/projet.ts` (planning, descente de charges simplifiée, garanties) ; 2 fiches (`components/calculs/projet.tsx`) ; schémas, organigrammes et bâtiment 3D en calques dans `components/schemas/Introduction.tsx`.
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à L1.1 tiennent en A4.
- 175 tests au vert, build au vert.

**Prochaine étape :** module L1.2 (analyse : dérivées et intégrales).

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22, 26, 27 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23, 24, 25, 28, 29, 30, 31 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
