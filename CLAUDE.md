# Génie Civil Académie — règles durables

## Session
- Lire d'abord CLAUDE.md et PROGRESS.md. Dans CURRICULUM.md, lire uniquement la section du module en cours.
- Ne pas relire `references/` : le style est résumé ci-dessous.
- Contenu, interface et messages de commit en français. Instruction ambiguë → poser la question, ne pas deviner.
- Pas de sous-agents ni de recherche web sans demande explicite. Réponses courtes, pas de code recopié dans le chat.

## Stack
- Next.js (App Router, dernière stable), TypeScript strict, Tailwind CSS ; pages générées statiquement ; cible Vercel ; PWA hors ligne.
- MDX via `@next/mdx` + remark-frontmatter + remark-mdx-frontmatter : compilé au build, et le MDX importe directement `lib/calc/` et les composants.
- Une leçon = un fichier MDX ; frontmatter validé par Zod ; `relecture: false` par défaut.
- Formules : KaTeX (remark-math + rehype-katex).
- Schémas : composants React SVG faits main dans `components/drawing/`, paramétriques ; aucune image raster, aucun décor sans contenu technique ; texte alternatif obligatoire.
- Calculs : fonctions pures dans `lib/calc/`, testées avec Vitest.
- Progression : localStorage derrière une interface d'accès abstraite (Supabase branché plus tard sans réécriture).
- Interdit : Three.js, GSAP, librairies d'animation, toute dépendance lourde. SVG + CSS suffisent.

## Style visuel (provisoire : images de `references/` absentes en Phase 0, résumé tiré des descriptions)
- Cahier : quadrillage 5 mm ou lignes, marge rouge, titres soulignés, annotations manuscrites (Kalam ou Patrick Hand), encres bleue/rouge/verte, étapes numérotées, résultat dans une bulle encadrée.
- Planche : cadre, cartouche, vues repérées (plan, élévation, coupes 1-1, 2-2), cotes, axes, hachures normalisées, légende, notes ; option « plan bleu ».
- Infographie : panneaux numérotés (icône + titre coloré), flux logique, encadrés Exemple / Attention / À retenir, tableau récapitulatif.
- Isométrie : dessin annoté (cotes, noms des éléments), calques activables.
- Polices : sans-serif technique pour planches et infographies ; manuscrite réservée aux annotations de cahier. Contraste AA.
- Palette en tokens Tailwind : encre (bleu), correction (rouge), validation (vert), béton (gris), brique, terre, acier.
- Les références viennent des réseaux sociaux : ne reprendre aucune valeur sans la recalculer.

## Format page
- Ordinateur : A4 portrait (1:1,414) centré, ombre légère. Mobile ≥ 360 px : pleine largeur fluide, sans zoom.
- Impression : `@media print`, une page = une feuille A4. En-tête (module, leçon, n° de page) et pied de page sur chaque page.
- Gabarits (composants MDX) : A `<FicheCalcul>` (cahier, entrées modifiables, recalcul en direct schéma compris), B `<PlancheTechnique>`, C `<Infographie>`, D `<FicheMemo>`, E `<Vue3D>`.

## Structure d'une leçon (ordre fixe)
1 Objectifs (3–5 verbes d'action) + prérequis liés · 2 Intuition (analogie avant toute formule) · 3 Cours (simple puis rigoureux, chaque symbole défini avec son unité) · 4 Schémas · 5 Exemple résolu (FicheCalcul, le « pourquoi » de chaque étape) · 6 Erreurs fréquentes · 7 Sur le terrain · 8 Fiche mémo · 9 Exercices facile/moyen/difficile, indices et corrigés masqués · 10 Quiz 5–10 QCM expliqués.
- Chaque module se termine par un mini-projet de synthèse et un examen.
- Ton : excellent professeur face à un étudiant de 18 ans ; clair, bienveillant, exigeant ; phrases courtes ; aucun jargon non expliqué.

## Exactitude (non négociable)
- Toute valeur numérique affichée vient d'une fonction de `lib/calc/` ; jamais de nombre de résultat tapé à la main dans le MDX.
- Chaque fonction de calcul a des tests Vitest, dont au moins un cas vérifié à la main, détaillé en commentaire.
- Arrondis explicites et cohérents ; une unité à chaque ligne d'application numérique. Unités SI, virgule décimale.
- Ne jamais inventer une valeur normative : citer la référence (ex. « EC2 §4.4.1 »). En cas de doute : badge « À vérifier » + entrée dans A_VERIFIER.md.
- Toujours distinguer règle normative, règle de l'art et simplification pédagogique.
- Eurocodes (EC0, 1, 2, 3, 5, 7, 8) en référence principale ; signaler et comparer BAEL 91 / anciennes règles françaises quand elles restent pratiquées en Afrique francophone.
- Intégrer des cas d'Afrique centrale (RDC) : latérites, argiles gonflantes, climat tropical, drainage, routes en terre, zones minières, matériaux locaux.

## Méthode
- Phases : 0 init · 1 cursus (STOP) · 2 socle + 5 gabarits + SVG + 5 leçons vitrines (STOP) · 3 fonctionnalités · 4 contenu module par module (STOP après chaque module, attendre « continue ») · 5 Supabase sur demande.
- Fin de module : `npm run build 2>&1 | tail -20` et `npx vitest run --reporter=dot` au vert, puis mise à jour de PROGRESS.md et A_VERIFIER.md, résumé en 5 lignes maximum.
- Ne jamais déclarer une tâche terminée si le build ou les tests échouent. Build et tests seulement en fin de module.
- Commits git atomiques, messages clairs en français.
- Ne jamais relire un fichier entier quand une partie suffit.
- PROGRESS.md : 20 lignes max (dernier module terminé, prochaine étape, points bloquants). CLAUDE.md : 60 lignes max, règles uniquement.
