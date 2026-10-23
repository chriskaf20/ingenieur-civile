# Avancement

**Phase en cours :** 4 (contenu module par module). Module N0.3 terminé, en attente de « continue ».

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- N0.1 Méthode de travail et N0.2 Algèbre et fonctions : leçons, mini-projets, examens.
- N0.3 Unités, conversions, ordres de grandeur : 7 leçons, mini-projet, examen ; calculs `lib/calc/unites.ts`, `materiauxCourants.ts`, `dimensions.ts`, `ordres.ts` ; 10 fiches interactives (`components/calculs/unites.tsx`) ; schémas `components/schemas/Unites.tsx`.
- Correction globale : les attributs `fill` et `font-size` des textes SVG sont désormais respectés (CSS `.dessin`).
- Contrôle A4 automatisé (Chrome headless) sur toutes les leçons, aucune erreur console.
- 100 tests au vert, build au vert (107 pages).

**Prochaine étape :** module N0.4 (trigonométrie).

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
