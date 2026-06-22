/**
 * ============================================================
 * Functional Chef — Research Agent
 * ============================================================
 *
 * Literature-facing curation draft:
 * problem → candidate bottleneck spec → biological impact points →
 * ingredient levers → ready-to-use recipes.
 *
 * This module intentionally lives outside `reasoning/`: outputs are draft
 * knowledge assets and must be reviewed before entering the deterministic
 * prescription engine.
 */

import { anthropic, MODELS } from '../anthropic/client';
import type { ResearchAgentInput, ResearchAgentOutput } from './types';
import { validateResearchAgentOutput } from './types';

export class ResearchAgentError extends Error {
  constructor(
    message: string,
    public readonly raw_response?: string,
    public readonly cause_data?: unknown
  ) {
    super(message);
    this.name = 'ResearchAgentError';
  }
}

export interface ResearchAgentResult {
  brief: ResearchAgentOutput;
  meta: {
    model: string;
    input_tokens?: number;
    output_tokens?: number;
    latency_ms: number;
  };
}

const SYSTEM_PROMPT = `Tu es Functional Chef Research Agent.

MISSION
Transformer une problématique de santé ou du quotidien en draft scientifique exploitable par un humain expert :
1. identifier le ou les bottlenecks physiologiques/biochimiques plausibles ;
2. isoler les points d'impact biologiques actionnables ;
3. proposer des leviers par ingrédients d'alimentation fonctionnelle ;
4. livrer 2 recettes prêtes à l'emploi.

CONTRAINTES SCIENTIFIQUES
- Tu raisonnes comme un curateur EBM-F, pas comme un générateur de wellness claims.
- Si une bibliographie est fournie, tu l'utilises en priorité et tu cites uniquement les PMID/DOI/URL fournis.
- Si aucune bibliographie n'est fournie, tu peux utiliser tes connaissances générales, mais tu n'inventes jamais de PMID, DOI ou citation précise. Dans ce cas, mets "reference_to_verify: ..." dans reference_pivot.
- Chaque claim mécanistique doit être classé T1/T2/T3 :
  T1 = intervention humaine robuste / méta-analyse / RCT directement transposable ;
  T2 = RCT limitée, cohorte forte, biomarqueur humain robuste ;
  T3 = mécanistique, animal, in vitro, plausibilité nutritionnelle.
- Tu distingues signal fort, extrapolation et incertitude dans evidence_map.
- Tu ne poses pas de diagnostic et tu n'émets pas de claim thérapeutique curatif.

CADRE FUNCTIONAL CHEF
- Cascades connues : IR > INFLAM > DYSBIOSE.
- Si le bottleneck proposé est nouveau (ex: charge allostatique), indique sa position par rapport à IR/INFLAM/DYSBIOSE.
- Architecture de plat obligatoire : 50% végétaux, 20-30% protéines, 20% lipides, modulateurs spécifiques.
- Les leviers doivent être traduisibles en ingrédients, dose/protocole, timing, séquence ou préparation culinaire.

OUTPUT
Réponds exclusivement en JSON valide selon ce shape exact :
{
  "bottleneck": {
    "id": "string uppercase snake-like, ex ALLOSTATIC_LOAD",
    "name_fr": "string",
    "functional_definition": "2-3 lignes",
    "priority_in_cascade": "ex: après INFLAM, avant DYSBIOSE",
    "confidence": "high | moderate | low | insufficient",
    "rationale": "string"
  },
  "entry_criteria": [
    {
      "biomarker": "string",
      "target": "string",
      "alert_threshold": "string",
      "weight": "major | moderate | minor | discriminant",
      "rationale": "string",
      "overlap_with": ["IR | INFLAM | DYSBIOSE | autre"]
    }
  ],
  "classification_rule": "string, ex ≥2 majors OR (≥1 major AND ≥3 moderates)",
  "biological_impact_points": [
    {
      "pathway": "string",
      "biological_target": "string",
      "desired_direction": "string",
      "timeframe": "postprandial_2_4h | short_term_4_weeks | long_term_12_weeks",
      "ebm_tier": "T1 | T2 | T3",
      "reference_pivot": "string"
    }
  ],
  "plate_architecture": {
    "vegetables_50_pct": "string",
    "protein_20_30_pct": "string",
    "lipids_20_pct": "string",
    "required_modulators": ["string"]
  },
  "anti_patterns": ["string"],
  "levers": [
    {
      "lever_id": "L_UPPER_SNAKE",
      "name_fr": "string",
      "ebm_tier": "T1 | T2 | T3",
      "reference_pivot": "string",
      "dose_or_protocol": "string",
      "mechanism": "string",
      "ingredient_candidates": ["string"],
      "safety_notes": ["string"]
    }
  ],
  "recipes": [
    {
      "title": "string",
      "meal_type": "breakfast | lunch | dinner | snack | full_day",
      "servings": 2,
      "total_time_min": 30,
      "architecture_notes": "string",
      "ingredients": [
        { "name": "string", "quantity": "string", "functional_role": "string" }
      ],
      "steps": [
        { "order": 1, "instruction": "string", "lever_id": "L_UPPER_SNAKE optional" }
      ],
      "levers_activated": ["L_UPPER_SNAKE"],
      "safety_notes": ["string"]
    }
  ],
  "evidence_map": [
    {
      "claim": "string",
      "ebm_tier": "T1 | T2 | T3",
      "references": ["string"],
      "uncertainty": "string"
    }
  ],
  "research_gaps": ["string"],
  "warnings": ["string"]
}`;

function stripFences(text: string): string {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
  const match = trimmed.match(fence);
  return match ? match[1].trim() : trimmed;
}

function buildUserMessage(input: ResearchAgentInput): string {
  const context = input.context ?? {};
  const literature = input.literature ?? [];

  const literatureBlock =
    literature.length > 0
      ? literature
          .map((paper, index) => {
            const citationId = paper.pmid
              ? `PMID:${paper.pmid}`
              : paper.doi
              ? `DOI:${paper.doi}`
              : paper.url
              ? paper.url
              : `SOURCE_${index + 1}`;
            return [
              `### ${citationId}`,
              `Titre: ${paper.title}`,
              paper.authors?.length ? `Auteurs: ${paper.authors.join(', ')}` : undefined,
              paper.journal ? `Journal: ${paper.journal}` : undefined,
              paper.year ? `Année: ${paper.year}` : undefined,
              paper.abstract ? `Abstract: ${paper.abstract}` : undefined,
              paper.key_findings?.length
                ? `Key findings: ${paper.key_findings.join(' | ')}`
                : undefined,
            ]
              .filter(Boolean)
              .join('\n');
          })
          .join('\n\n')
      : 'Aucune bibliographie fournie. Utiliser connaissances générales sans inventer PMID/DOI ; marquer les références comme reference_to_verify.';

  return `## PROBLÉMATIQUE
${input.problem}

## BOTTLENECK CIBLE SI FOURNI
${input.target_bottleneck_name ?? 'NR'}

## CONTEXTE
- Population: ${context.population ?? 'NR'}
- Situation quotidienne: ${context.daily_context ?? 'NR'}
- Cuisine préférée: ${context.preferred_cuisine ?? 'flexible'}
- Type de repas: ${context.meal_type ?? 'lunch'}
- Exclusions / contraintes: ${JSON.stringify(context.exclusions ?? [])}
- Langue: ${context.language ?? 'fr'}

## LITTÉRATURE FOURNIE
${literatureBlock}

## LIVRABLE
Produis une fiche complète au format JSON strict. Elle doit suivre la structure de type "Bottleneck — Charge allostatique" : définition, priorité dans cascade, critères d'entrée, règle de classification, architecture du plat, anti-patterns, leviers et recettes prêtes à l'emploi.`;
}

export async function runResearchAgent(input: ResearchAgentInput): Promise<ResearchAgentResult> {
  const model = MODELS.COMPLEX;
  const userMessage = buildUserMessage(input);
  const t0 = Date.now();

  let response;
  try {
    response = await anthropic.messages.create({
      model,
      max_tokens: 6000,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });
  } catch (err) {
    throw new ResearchAgentError(
      `Anthropic API error: ${err instanceof Error ? err.message : 'unknown'}`,
      undefined,
      err
    );
  }

  const latency_ms = Date.now() - t0;
  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new ResearchAgentError('No text block in Anthropic response', JSON.stringify(response.content));
  }

  const cleaned = stripFences(textBlock.text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new ResearchAgentError(
      `Invalid JSON from research agent: ${err instanceof Error ? err.message : 'unknown'}`,
      cleaned
    );
  }

  if (!validateResearchAgentOutput(parsed)) {
    throw new ResearchAgentError('Research agent output does not match expected schema', cleaned, parsed);
  }

  return {
    brief: parsed,
    meta: {
      model,
      input_tokens: response.usage?.input_tokens,
      output_tokens: response.usage?.output_tokens,
      latency_ms,
    },
  };
}
