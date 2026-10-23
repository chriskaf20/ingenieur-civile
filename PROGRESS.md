# Avancement

**Phase en cours :** 4 (contenu module par module). Module N0.5 terminé, en attente de « continue ».

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- N0.1 à N0.4 : méthode, algèbre, unités, trigonométrie (leçons, mini-projets, examens).
- N0.5 Géométrie plane et dans l'espace : 6 leçons, mini-projet (petite maison), examen ; calculs `lib/calc/geometrie.ts` ; 7 fiches (`components/calculs/geometrie.tsx`) ; schémas, vues 3D et planches `components/schemas/Geometrie.tsx`.
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à N0.5 tiennent en A4.
- 134 tests au vert, build au vert (123 pages).

**Prochaine étape :** module N0.6 (vecteurs).

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
