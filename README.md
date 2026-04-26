# Functional Chef

> IA cuisinière EBM-driven — moteur de prescription nutritionnelle ciblée par bottleneck physiopathologique.

**Statut** : scaffold v0.1 (foundation)
**Stack** : Next.js 14 (App Router) · TypeScript · Supabase (Postgres + pgvector) · Anthropic API (Claude Sonnet 4 / Opus 4.7) · Tailwind CSS · Vercel
**Auteur** : Dr Rafik Gounane × Claude

---

## Philosophie produit

Functional Chef ne génère pas des recettes. Il traduit un **objectif physiopathologique** (lever d'un bottleneck métabolique, inflammatoire, microbien) en **architecture culinaire opérationnelle** (matrice 50/20-30/20, leviers de cuisson, séquences, timing chronobio), avec **EBM tiering explicite** (T1/T2/T3) sur chaque levier mobilisé.

> *On ne cuisine pas des aliments mais des voies métaboliques.*

---

## Trois bottlenecks pilotes (v0.1)

| Code | Bottleneck | Critère pivot d'entrée |
|---|---|---|
| **IR** | Insulinorésistance fonctionnelle | HOMA-IR 1.5–2.5 / TG/HDL >1.5 / HbA1c 5.4–5.6% |
| **INFLAM** | Inflammaging | CRP-us 1–3 mg/L persistant / OmegaIndex <6% / AA/EPA >7 |
| **DYSBIOSE** | Dysbiose | Bristol 1-2 ou 6-7 / ballonnements quotidiens / fibres <15g/j |

Hiérarchie de priorité en cas de triple co-dominance : **IR > INFLAM > DYSBIOSE** (cascade causale amont→aval).

---

## Architecture du moteur

```
INPUT (intent + biomarkers + contraintes)
    │
    ▼
[ÉTAPE 1] bottleneck-classifier.ts
    → Score chaque bottleneck (majeurs/modérés pondérés)
    → Détermine bottleneck dominant (max 2 co-dominants)
    │
    ▼
[ÉTAPE 2] safety-filters.ts
    → Applique filtres durs (MICI active, anticoagulants, allergies, etc.)
    │
    ▼
[ÉTAPE 3] lever-selector.ts
    → Sélectionne ≥4 "leviers étoile" (transversaux T1)
    → Ajoute leviers ciblés du bottleneck dominant
    → Retourne liste tiered avec rationale
    │
    ▼
[ÉTAPE 4] dish-composer.ts (Anthropic API)
    → Prompt structuré → JSON de plat
    → Architecture 50/20-30/20 + cuisson + timing
    │
    ▼
OUTPUT
    → Plat + liste courses + protocole cuisson
    → Justification physiopathologique par levier
    → Badge EBM-F par levier (T1/T2/T3)
    → Effets attendus : postprandial 2-4h | court terme 4 sem | long terme 12 sem
```

---

## Structure du repo

```
functional-chef/
├── README.md                          # Ce fichier
├── ARCHITECTURE.md                    # Décisions techniques détaillées (docs/)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── .env.example                       # Variables d'env requises
│
├── supabase/
│   ├── migrations/
│   │   └── 001_init_schema.sql        # Schéma complet (8 tables)
│   └── seed/
│       ├── 01_bottlenecks.sql         # 3 bottlenecks pilotes
│       ├── 02_biomarkers.sql          # ~20 biomarqueurs
│       ├── 03_biomarker_thresholds.sql
│       ├── 04_culinary_levers.sql     # ~25 leviers tiered EBM-F
│       ├── 05_lever_bottleneck_map.sql
│       └── 06_bioavailability_synergies.sql
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing
│   │   ├── globals.css
│   │   ├── consultation/
│   │   │   └── page.tsx               # UI de consultation (intent → output)
│   │   └── api/
│   │       ├── classify/route.ts      # POST → bottleneck classification
│   │       └── compose/route.ts       # POST → dish composition (Claude)
│   │
│   ├── components/
│   │   ├── IntentForm.tsx             # Formulaire intent + biomarqueurs
│   │   ├── DishOutput.tsx             # Render plat
│   │   └── EBMBadge.tsx               # Badge T1/T2/T3
│   │
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts              # Client browser
│       │   └── server.ts              # Client server-side
│       ├── anthropic/
│       │   ├── client.ts              # SDK wrapper
│       │   └── prompts.ts             # System prompts du moteur
│       ├── reasoning/
│       │   ├── types.ts               # Types canoniques
│       │   ├── bottleneck-classifier.ts
│       │   ├── lever-selector.ts
│       │   ├── dish-composer.ts
│       │   └── safety-filters.ts
│       └── utils.ts
│
└── docs/
    ├── ARCHITECTURE.md
    ├── EBM_TIERING.md                 # Méthode de classement T1/T2/T3
    └── BOTTLENECK_SPEC.md             # Spec v0.1 complète (référence)
```

---

## Quick start

```bash
# 1. Cloner et installer
git clone <repo>
cd functional-chef
npm install

# 2. Configurer Supabase
# Créer un projet sur https://supabase.com puis :
cp .env.example .env.local
# Remplir SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# Remplir ANTHROPIC_API_KEY

# 3. Appliquer le schéma
# Via Supabase CLI :
supabase link --project-ref <ref>
supabase db push
# Ou via le SQL editor du dashboard : copier supabase/migrations/001_init_schema.sql

# 4. Seed la base
# Dans le SQL editor, exécuter dans l'ordre :
# 01_bottlenecks.sql → 02_biomarkers.sql → 03_biomarker_thresholds.sql
# → 04_culinary_levers.sql → 05_lever_bottleneck_map.sql → 06_bioavailability_synergies.sql

# 5. Lancer en dev
npm run dev
# → http://localhost:3000
```

---

## Tests de validation v0.1

Trois cas-pivot pour vérifier la cohérence du moteur (cf. spec §7) :

| Cas | Profil | Bottleneck attendu |
|---|---|---|
| **A** | F 48 ans, HOMA-IR 2.1, TG/HDL 1.8, ALT 28 | IR isolée |
| **B** | H 62 ans, CRP-us 2.4, OmegaIndex 4.5%, AA/EPA 12 | INFLAM isolé |
| **C** | F 35 ans, Bristol 6, ballonnements quotidiens, fibres ~12g/j | DYSBIOSE dominante |

Disponibles via la consultation UI ou par appel direct `POST /api/classify`.

---

## Roadmap v0.2 → v1.0

- **v0.2** (4-6 sem) : référentiel `culinary_levers` étendu à 200 lignes · UX 4 écrans finalisée · validation interne sur 10 cas ZOI réels
- **v0.3** (8-10 sem) : intégration ZOI Analyse Patient (sortie nutritionnelle pluggée) · pilote 20 patients ZOI sur 4 sem
- **v1.0** (90 jours) : decision gate B2C app vs B2B clinique · feedback praticien + biomarqueur J0/J90

---

## Sécurité & limites

- Pas de claim thérapeutique direct. Outil pédagogique de prescription nutritionnelle, **pas un dispositif médical** en v0.1 (réévaluation MDR à v1.0).
- Filtres durs sur : MICI active, anticoagulants + curcuma high-dose, hémochromatose + Fe, allergies, grossesse/allaitement, cancer/chimio actif.
- Validation médicale humaine **requise** avant transmission patient.
- Sources EBM tracées par PMID dans la base. Aucune génération sans tier explicite.

---

## Convergence portfolio

Functional Chef est conçu comme **brique horizontale** (couche nutrition partagée) :
- **ZOI Analyse Patient** : remplace la sortie nutrition générique
- **ADAPTIVE / MEI** : module nutrition natif manquant
- **DU-MFL** : TP pédagogique du module nutrition fonctionnelle
- **EBM-F framework** : première application produit du framework
- **MedTube** : générateur de scripts "1 plat, 1 voie métabolique"

---

## Licence

Privé, propriétaire. Tous droits réservés Dr Rafik Gounane.
