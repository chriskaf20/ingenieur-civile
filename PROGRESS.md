# Avancement

**Phase en cours :** 4 (contenu module par module). Modules L1.2 et L1.3 terminés ; L1.4 et L1.5 enchaînés à la demande de l'utilisateur.

**Fait :**
- Phases 0 à 3 validées. Seuil de validation des quiz et examens : 65 % (`SEUIL_VALIDATION`), en conseil non bloquant.
- Niveau N0 complet (N0.1 à N0.7), L1.1 (introduction) et L1.2 (analyse).
- L1.3 Mécanique générale et statique : 12 leçons, mini-projet (ferme de toiture en bois), examen ; calculs `lib/calc/statique.ts` (charges, moments, torseur, équilibre, réactions, hyperstaticité, solveur de treillis, Ritter, mur poids, centres de gravité, trois appuis) ; 13 fiches (`components/calculs/statique.tsx`) ; schémas, planches et vues 3D en calques dans `components/schemas/Statique.tsx`.
- Contrôles automatiques : identifiants SVG en double (`postbuild`), A4 et console (Chrome headless) ; toutes les feuilles de N0.1 à L1.3 tiennent en A4.
- 232 tests au vert, build au vert.

**Prochaine étape :** module L1.4 (algèbre linéaire).

**Points bloquants :**
- `references/` toujours vide : style fondé sur les descriptions du prompt.
- A_VERIFIER.md n° 3, 4, 5, 15, 18, 22, 26, 27, 34 (hypothèses) ; 10, 11, 13, 14, 16, 19, 20, 21, 23, 24, 25, 28 à 33 (à confirmer).
- L3.8.7 : feuilles 5 et 6 mesurées à 301 mm (A4 = 297 mm) : à reprendre.
