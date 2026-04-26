# Architecture — Functional Chef v0.1

## Principes directeurs

1. **Rules + LLM, pas LLM seul.** Le moteur de raisonnement (classification, filtres sécurité, sélection leviers) est **déterministe TypeScript**. Le LLM (Claude API) n'intervient qu'en *dernière étape* pour la composition culinaire à partir de leviers déjà sélectionnés. Cette discipline élimine les hallucinations sur l'étape critique (quel levier mobiliser pour quel patient) et concentre le LLM sur ce qu'il fait de mieux : produire du texte cuisinier crédible.
2. **Traçabilité totale.** Chaque consultation persiste en base : input patient, scores par bottleneck, leviers sélectionnés/exclus, JSON sortie LLM, métadonnées (modèle, tokens, latence). Auditable au cabinet. Critique en B2B clinique.
3. **EBM tiering explicite, jamais déduit.** Aucun levier n'entre dans le pipeline sans tier T1/T2/T3 documenté + référence pivot (PMID idéalement). Le LLM ne peut pas inventer une référence : il copie celles fournies.
4. **Filtres durs, pas disclaimers.** En v0.1, les contre-indications médicales (MICI active, anticoagulants haute dose, etc.) **excluent les leviers** avant qu'ils n'atteignent le composer. Pas de "sortie produite + warning". Choix défendable au regard du risque.

## Pipeline détaillé

```
PatientProfile (zod-validated)
        │
        ▼
┌───────────────────────┐
│ classify              │  POST /api/classify
│ (deterministic TS)    │  ou inline dans /api/compose
└───────────────────────┘
        │
        ▼
ClassificationResult { dominant, co_dominant, scores[], rationale }
        │
        ▼
┌───────────────────────┐
│ applySafetyFilters    │
│ (HARD_RULES matrix)   │  → exclude levers + collect warnings
└───────────────────────┘
        │
        ▼
filtered_levers, excluded[], warnings[], forbidden_ingredients[]
        │
        ▼
┌───────────────────────┐
│ selectLevers          │
│ ≥4 universal stars    │  → SelectedLever[]
│ + targeted dominant   │
│ + targeted co-domin.  │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ composeDish           │
│ (Claude API)          │  → ComposedDish (JSON)
└───────────────────────┘
        │
        ▼
ConsultationResult — persisted in `consultations` table
```

## Choix techniques

### Stack

| Couche | Technologie | Pourquoi |
|---|---|---|
| Frontend | Next.js 14 App Router + Tailwind | Déjà la stack ZOI, vélocité maximale |
| Types | TypeScript strict | Single source of truth dans `src/lib/reasoning/types.ts` |
| Validation | Zod | Validation runtime sur API boundaries |
| DB | Supabase (Postgres) | jsonb pour flexibilité biomarkers, RLS prêt pour multi-tenant |
| LLM | Anthropic SDK (Sonnet 4 défaut, Opus 4.7 si triple co-dominance) | Coût/qualité optimal, JSON output fiable |
| Hosting | Vercel | Déploiement zero-config, edge functions |

### Modèle de données (8 tables)

| Table | Rôle | Notes |
|---|---|---|
| `bottlenecks` | 3 pilotes v0.1 | `priority_rank` = tie-breaker cascade IR>INFLAM>DYSBIOSE |
| `biomarkers` | Catalogue référence | numérique + cliniques (Bristol, ballonnements) |
| `biomarker_thresholds` | Matrix bottleneck × biomarqueur | `weight` ∈ {major, moderate, minor, discriminant} |
| `culinary_levers` | **L'IP**. ~25 leviers v0.1 | `pubmed_ids[]`, `contraindications[]`, `is_universal_star` |
| `lever_bottleneck_map` | M:N : un levier sert plusieurs bottlenecks à des tiers différents | EVOO = T1/IR, T1/INFLAM, T2/DYSBIOSE |
| `bioavailability_synergies` | Couples molécule × matrice | Positives + anti-synergies |
| `patient_profiles` | Input flexible (jsonb) | Évolution biomarkers sans migration |
| `consultations` | Audit trail | Trace LLM + scoring + leviers, validable médecin |

### Choix de design notables

- **`alert_threshold_high` et `alert_threshold_low` peuvent être tous les deux `NULL`** pour les biomarqueurs catégoriels (SIBO breath positif/négatif). Le classifier gère via `alert_categorical_value`.
- **Bristol score** : cas particulier (cible = bande 3-5, alerte si <3 OU >5). Encoded dans le seed avec `alert_threshold_low=3, alert_threshold_high=5` et le classifier détecte les *deux queues* du intervalle.
- **`patient_profiles.biomarker_values` et `clinical_signals` en jsonb** : permet d'évoluer la liste des biomarqueurs sans migration SQL. Indexe via GIN pour requêtes futures.
- **`consultations.llm_*` columns** : trace coût et latence pour pilotage économique du produit (cible coût/consultation < 0.10 €).

### Filtres sécurité — v0.1 hard rules

Implémentés dans `src/lib/reasoning/safety-filters.ts` :

| Condition patient | Conséquence |
|---|---|
| MICI active / flare | Exclusion fibres insolubles, prébiotiques fermentescibles, légumineuses |
| Anticoagulants haute dose / AVK | Exclusion curcumine ≥1g, ail concentré, ω-3 ≥3g |
| Pré-chirurgical 14j | Exclusion idem ci-dessus |
| Cœliaque | Exclusion gluten strict |
| SIBO actif | Exclusion prébiotiques fermentescibles |
| IBS sévère | Exclusion fibres insolubles brutes, FODMAP non-gradué |
| Allergies (nuts, fish, gluten, soy, sesame, eggs, milk, shellfish, peanuts) | Liste d'ingrédients interdits passée au composer |
| Régimes (vegan/vegetarian/pescatarian) | Exclusion famille protéines correspondante |

**Note** : hémochromatose, grossesse, allaitement, hypothyroïdie sévère, lithiase oxalique → **warnings** plutôt que blocages durs (les leviers concernés sont à modérer, pas à exclure).

### Anti-hallucination du composer

Le système prompt impose :
- **Pas d'ajout de levier** hors liste fournie
- **Pas d'invention de PMID** ou de référence
- **JSON strict only** (no markdown fences, parsed defensively avec `stripFences`)
- **Validation de shape** via `validateComposedDish` avant retour client

En cas de divergence (JSON invalide, schema mismatch), `ComposerError` remonte avec la `raw_response` pour debug. La route `/api/compose` retourne 502 (Bad Gateway) pour signaler une défaillance moteur LLM.

## Performances cibles

| Étape | Latence cible | Notes |
|---|---|---|
| Classify | <50ms | Pure TS sur ~30 thresholds |
| Safety filter | <10ms | Matrix lookup |
| Lever selector | <20ms | Sort + slice sur ~25 leviers |
| Composer (Sonnet 4) | 8-15s | Goulot principal |
| Composer (Opus 4.7) | 20-40s | Réservé triple co-dominance |
| Persist consultation | <100ms | Single insert |
| **Total bout-en-bout** | **8-16s** | Acceptable en consultation |

## Roadmap technique v0.2 → v1.0

### v0.2 (4-6 sem)
- Référentiel `culinary_levers` à 60 lignes (ajout : graines de lin, kéfir spécifique, kombucha, gingembre frais, romarin/thym, chrome alimentaire, glycine, taurine alimentaire, yaourt entier vs écrémé, miso longue fermentation, etc.)
- Référentiel `bioavailability_synergies` à 30+ couples
- Tests unitaires sur les 3 cas-pivot (caseA/B/C) — assertion sur bottleneck dominant détecté
- Tests d'intégration sur le composer (mock Anthropic API)
- UI : édition fine biomarqueur par biomarqueur avec autocomplete + zones de référence inline

### v0.3 (8-10 sem)
- Auth Supabase (médecin × patients)
- RLS policies activées
- Intégration ZOI Analyse Patient (sortie nutritionnelle pluggée)
- API `/api/consultations/:id/validate` pour validation médecin avant envoi patient
- Export PDF du plat (ReportLab via worker Python ou React-PDF)
- Pilote 20 patients ZOI sur 4 sem

### v1.0
- Decision gate B2C app vs B2B clinique pure
- Multi-langue (FR/EN, anglais marché AMWC + int.)
- Stripe / facturation cabinet
- Dashboard analytics (tier mix par praticien, leviers les plus mobilisés, etc.)
- Export Notion / Google Doc pour transmission patient
- Multi-cuisines (méditerranéenne par défaut, ajout : maghrebi, asiatique, africaine)

## Conventions de code

- **Pas de fichiers fourre-tout.** Chaque module a un rôle unique.
- **Imports : `@/*` pour le code, paths absolus** via `tsconfig.paths`.
- **Tests** (à venir) : `__tests__` colocalisés avec le module testé.
- **Comments en haut de fichier** : section `============` indiquant le rôle du module + référence à la spec.
- **Pas de TODO en core path.** Si quelque chose est incomplet, le commenter explicitement et créer un issue tracker.

## Sécurité & conformité

- **Pas de PHI sensible en logs.** Les biomarqueurs ne transitent en logs qu'en dev.
- **Service role key** : strictement server-only (`createServiceClient`). Jamais browser.
- **Anonymisation patient** : `external_id` optionnel (lien ZOI) sinon UUID standalone.
- **MDR** : v0.1 est un outil pédagogique de prescription nutritionnelle, pas un dispositif médical. Réévaluation MDR à v1.0 si claim diagnostic.
- **RGPD** : à activer en v0.3 avec auth (politique rétention, droit à l'oubli sur `consultations`).
