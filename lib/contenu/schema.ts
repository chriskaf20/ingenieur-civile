import { z } from 'zod';

/** Frontmatter d'une leçon MDX. La structure (module, durée, prérequis) vient de content/cursus.json. */
export const schemaFrontmatter = z
  .object({
    id: z.string().regex(/^(N0|L1|L2|L3|M1|M2|PP)\.\d+\.(\d+|P|EX)$/, 'identifiant de leçon invalide'),
    titre: z.string().min(3),
    objectifs: z.array(z.string().min(5)).min(3).max(5),
    relecture: z.boolean().default(false),
    normes: z.array(z.string()).default([]),
    glossaire: z.array(z.object({ terme: z.string(), definition: z.string() })).default([]),
    symboles: z.array(z.object({ symbole: z.string(), signification: z.string(), unite: z.string().optional() })).default([]),
    formules: z.array(z.object({ nom: z.string(), tex: z.string(), domaine: z.string() })).default([]),
  })
  .strict();

export type Frontmatter = z.infer<typeof schemaFrontmatter>;
