# Bottleneck Specification v0.1 — Référence

> Document source qui a guidé le scaffold. Préservé tel quel pour traçabilité.
> Toute évolution future incrémente la version (v0.2, v0.3, ...).

## Préambule méthodologique

**Logique d'arbitrage** : un patient est rattaché à 1 bottleneck dominant (max 2 co-dominants). Le moteur ne traite jamais 3 bottlenecks simultanément.

**Choix des 3 pilotes** :
1. **Insulinorésistance** — prévalence massive (>40% adultes occidentaux en zone grise IR), EBM-F la plus solide en nutrition, leviers culinaires les plus directs et mesurables.
2. **Inflammaging** — convergence du portfolio, traduction culinaire claire via signature lipidomique + polyphénols.
3. **Dysbiose** — levier culinaire pur, différenciation maximale vs concurrents.

**Extension v0.2 précoce** :
0. **Charge allostatique** — bottleneck amont de récupération neuro-endocrine/autonomique. Ajouté comme couche de priorisation avant IR lorsque sommeil, HRV et HPA axis suggèrent une surcharge adaptative qui entretient cravings, instabilité glycémique et inflammation.

**Convention EBM-F tiering** : voir `EBM_TIERING.md`.

---

## Bottleneck #0 — Charge allostatique

### Définition fonctionnelle

Surcharge adaptative neuro-endocrine et autonomique : activation HPA/sympathique persistante, récupération parasympathique insuffisante, sommeil non restaurateur et instabilité énergétique diurne. Cible prioritaire lorsque le terrain de stress/sommeil entretient IR, inflammaging ou dysbiose.

### Priorité dans cascade

**ALLOSTATIC_LOAD > IR > INFLAM > DYSBIOSE**. On restaure la capacité de récupération avant d’empiler des modulateurs métaboliques/inflammatoires.

### Critères d'entrée — biomarqueurs + signaux

| Biomarqueur / signal | Cible fonctionnelle | Seuil d'alerte | Poids |
|---|---|---|---|
| HRV RMSSD nocturne | >35 ms ou baseline individuelle | <25 ms | Majeur |
| PSQI | ≤5 | >8 | Majeur |
| Cortisol salivaire soir | bas / <3 nmol/L | >5 nmol/L | Majeur |
| Cortisol AM | 8-18 nmol/L selon contexte | <5 ou >20 | Modéré |
| DHEA-S | age/sex adjusted | bas, proxy <80 µg/dL | Modéré |
| Efficacité sommeil | >90% | <85% | Modéré |
| WASO | <30 min | >45 min | Modéré |
| Fréquence cardiaque repos | <65 bpm ou baseline | >75 bpm persistant | Modéré |
| Caféine après 14h / <8h coucher | absent | positive | Modéré |

**Règle de classification** : ≥2 critères majeurs OR ≥1 majeur + ≥3 modérés.

### Architecture plat récupération / charge allostatique

```
50% végétaux : polyphénols + magnésium + fibres douces (feuilles, crucifères doux, baies/kiwi selon horaire)
20-30% protéines : signal satiété stable, glycine/collagène ou protéines complètes selon repas
20% lipides : EVOO/noix/graines, stabilité énergétique et biodisponibilité
Modulateurs :
  - arrêt caféine ≥8h avant coucher
  - dîner non hyperlipidique tardif, éviter alcool
  - option pré-coucher : glycine 3g OU 2 kiwis 1h avant coucher selon profil IR/reflux
```

### Anti-patterns

Caféine tardive, alcool comme anxiolytique du soir, dîner hypergras tardif, snack sucré isolé nocturne, restriction calorique agressive sous stress, jeûne tardif si réveils nocturnes/cortisol haut, entraînement intense tardif.

### Leviers ajoutés

| Levier | Nom FR | EBM tier | Référence pivot | Dose/protocole |
|---|---|---|---|---|
| L_CAFFEINE_CUTOFF_8H | Arrêt caféine ≥8h avant coucher | T1 | Drake 2013 | Dernière prise ≥8h avant coucher |
| L_GLYCINE_PRE_BED | Glycine 3g avant coucher | T2 | Bannai 2012 | 3g 30-60 min avant coucher |
| L_MAGNESIUM_FOOD | Apport Mg alimentaire ≥350mg/j | T2 | Arab 2022 | 300-400mg/j via aliments |
| L_KIWI_PRE_BED | Deux kiwis 1h avant coucher | T2 | Lin 2011 | 2 kiwis 1h avant coucher, 4 semaines |
| L_PROTEIN_BREAKFAST_STABLE_ENERGY | Petit-déjeuner protéiné 25-35g | T2 | evidence appetite/cravings | 25-35g protéines au premier repas |

---

## Bottleneck #1 — Insulinorésistance (IR fonctionnelle)

### Définition fonctionnelle

Perte précoce du signal insulinique avant tout critère diabétique. **Zone d'intérêt = HOMA-IR 1.5-2.5**, soit la zone aveugle de la médecine conventionnelle.

### Critères d'entrée — biomarqueurs

| Biomarqueur | Cible fonctionnelle | Seuil d'alerte | Poids |
|---|---|---|---|
| HOMA-IR | <1.3 | >1.5 | Majeur |
| Insulinémie à jeun | <6 µU/mL | >8 | Majeur |
| HbA1c | <5.4% | 5.4-5.6% (gris) / >5.7% | Majeur |
| TG/HDL ratio | <1.0 | >1.5 | Majeur |
| Glycémie à jeun | <0.95 g/L | 0.95-1.05 (gris) / >1.10 | Modéré |
| Triglycérides | <0.80 g/L | >1.2 | Modéré |
| ALT | <22 U/L | >25 (NAFLD silencieuse) | Modéré |
| Acide urique | H<5.5 / F<4.5 mg/dL | >6 | Mineur |
| Tour taille / taille | <0.5 | >0.55 | Modéré |
| Apo B | <0.90 g/L | >1.0 | Modéré |
| CGM SD (si dispo) | SD <15 mg/dL | SD >20 | Discriminant |

**Règle de classification** : ≥3 critères majeurs OR ≥2 majeurs + ≥3 modérés.

### Architecture de plat anti-IR

```
50% végétaux non-amylacés (haricots verts, brocoli, courgette, kale, épinards)
20-30% protéines (poisson gras, œufs, légumineuses, volaille)
20% lipides MUFA + ω-3 (huile olive EVOO, amandes, noix)
Modulateurs T1 obligatoires :
  - Vinaigre/citron 15 ml en entrée
  - Séquence forcée : légumes → protéines → glucides
  - Si glucides : légumineuses ou riz/pâtes/pdt refroidis ≥24h
  - Marche 10 min en sortie de table
```

### Anti-patterns

Smoothies fruits liquides au réveil, céréales sucrées, pain blanc isolé, jus de fruits, fruits secs en collation isolée, riz blanc fraîchement cuit sans accompagnement protéique, grignotage continu.

---

## Bottleneck #2 — Inflammaging

### Définition fonctionnelle

Inflammation chronique de bas grade liée à l'âge. Marqueur central = **CRP-us en zone 1-3 mg/L sans inflammation aiguë**.

### Critères d'entrée — biomarqueurs

| Biomarqueur | Cible fonctionnelle | Seuil d'alerte | Poids |
|---|---|---|---|
| CRP-us | <1 mg/L | 1-3 (gris) / >3 chronique | Majeur |
| Omega-3 Index | >8% | <6% / <4% sévère | Majeur |
| AA/EPA ratio | <3 | >7-10 | Majeur |
| IL-6 (si dispo) | <2 pg/mL | >3 | Majeur |
| Neutrophiles/Lymphocytes | <2 | >2.5 | Modéré |
| Ferritine (hors carence martiale) | F 50-150 / H 80-300 | >300 sans Fe | Modéré |
| Albumine | >42 g/L | <40 | Modéré |
| Fibrinogène | <3.5 g/L | >4 | Modéré |
| HbA1c | — | >5.6 = aggravant | Modéré |
| HDL | H>1.0 / F>1.2 mmol/L | bas + TG haut | Modéré |
| DEXA visceral fat (si dispo) | <100 cm² | >130 | Discriminant |

**Règle** : CRP-us >1 mg/L persistante + ≥1 critère majeur secondaire.

### Architecture plat anti-inflammaging

```
50% végétaux ventilés en 3 sous-blocs :
  - 1/3 crucifères vapeur ≤4 min
  - 1/3 baies/anthocyanes (frais ou décongelés)
  - 1/3 légumes feuilles + alliacés (ail, oignon, poireau)
20-30% protéines : poisson gras prioritaire ≥2x/sem, œuf, légumineuses
20% lipides : EVOO, noix, graines lin moulues
Modulateurs : curcuma + pipérine + lipide chaud, gingembre frais, herbes
Cuisson : vapeur, papillote, basse T° ≤120°C
```

### Anti-patterns

Barbecue/grillade prolongée hebdomadaire, fritures, huiles ω-6 raffinées en cuisson chaude, charcuterie quotidienne, alcool >1 v/j femme / 2 v/j homme, sucres rapides en isolé, ultra-transformés industriels.

---

## Bottleneck #3 — Dysbiose

### Définition fonctionnelle

Altération composition microbiote intestinal : ↓ diversité, ↓ butyrate-producteurs, ↑ Proteobacteria, perte intégrité barrière.

### Critères d'entrée — biomarqueurs + symptomatologie

| Critère | Cible | Alerte | Poids |
|---|---|---|---|
| Bristol stool scale | 3-5 | 1-2 ou 6-7 chroniques | Majeur clinique |
| Fréquence ballonnements | <2/sem | quotidien | Majeur clinique |
| Calprotectine fécale | <50 µg/g | >50 | Majeur |
| Tests respiratoires SIBO H2/CH4 | négatif | positif | Discriminant |
| Microbiote analyse (16S/shotgun) | diversité Shannon >3.5 | <3 | Discriminant |
| Histoire abx >3 cures lifetime | — | positive | Modéré |
| IPP chronique >6 mois | — | positif | Modéré |
| Apport fibres estimé | >25g/j | <15g/j | Modéré |
| Diversité plantes/sem | ≥30 | <15 | Modéré |

**Règle** : ≥2 critères cliniques majeurs persistants ≥3 mois + ≥1 facteur historique aggravant.

### Architecture plat pro-microbiote

```
50% végétaux : diversité maximale 5-7 espèces dans assiette
  - inclure ≥1 prébiotique (ail, oignon, poireau, asperge, topinambour)
  - inclure ≥1 cru et ≥1 cuit pour diversité fibres
20-30% protéines : variées sur la semaine, priorité légumineuses 3x/sem + poisson + œuf
20% lipides : EVOO, noix
Modulateurs : 1 portion fermenté/repas (kéfir, choucroute, miso, yaourt fermenté)
Préparation : vapeur, fermentation, refroidissement amidon
```

### Anti-patterns

Aliments ultra-transformés industriels (E407, E466, polysorbate 80, carraghénanes), régime monotone <15 plantes/sem, édulcorants artificiels (sucralose, saccharine — Suez 2014/2022), alcool >1 v/j, abx réflexe, IPP au long cours sans indication.

---

## Matrice transversale — convergence des leviers

8 "leviers étoile" transversaux ≥2 bottlenecks T1 → forment **le socle universel** du moteur Functional Chef. ~70% de la valeur thérapeutique en 8 leviers. Voir `lever_bottleneck_map` seed pour le détail tier × bottleneck.

| Levier étoile | IR | INFLAM | DYSBIOSE |
|---|---|---|---|
| EVOO ≥40 ml/j | T1 | T1 | T2 |
| Légumineuses 3-4x/sem | T1 | T2 | T1 |
| Refroidissement amidon | T1 | — | T2 |
| Diversité plantes ≥30/sem | T2 | T2 | T1 |
| Aliments fermentés diversifiés | T2 | T2 | T1 |
| Crucifères vapeur courte | T2 | T1 | T2 |
| Anthocyanes 200-400g/sem | T2 | T1 | T2 |
| Poisson gras 2-3x/sem | T2 | T1 | — |

---

## Algorithme de classification (réf. `bottleneck-classifier.ts`)

```
ÉTAPE 1 — Scoring
  Pour chaque bottleneck :
    points = somme pondérée (major=3, moderate=2, minor=1, discriminant=2)
  Triggers :
    IR       : ≥3 majors OR (≥2 majors AND ≥3 moderates)
    INFLAM   : CRP_US breach + ≥2 majors total
    DYSBIOSE : ≥2 majors + ≥1 moderate

ÉTAPE 2 — Dominance
  1 triggered  → dominant
  2 triggered  → dominant = highest score (tie-break: priority_rank)
  3 triggered  → cascade IR > INFLAM > DYSBIOSE

ÉTAPE 3 — Filtres sécurité (HARD_RULES)
  Voir safety-filters.ts
  Exclusion levers + collection warnings

ÉTAPE 4 — Sélection leviers
  ≥4 universal stars (par tier_for_dominant_bottleneck)
  + max 4 targeted dominant
  + max 2 targeted co-dominant si présent
  Cap total : 10

ÉTAPE 5 — Composition Claude
  System prompt : philosophie + contrat + JSON schema
  User message  : intent + classification + patient + leviers
  Output : ComposedDish strict JSON
```

---

## Cas-pivot v0.1 — validation interne

| Cas | Profil | Bottleneck attendu |
|---|---|---|
| **A** | F 48 ans, HOMA-IR 2.1, TG/HDL 1.8, ALT 28, tour taille/taille 0.55, CRP-us 0.8 | IR isolée |
| **B** | H 62 ans, CRP-us 2.4, OmegaIndex 4.5%, AA/EPA 12, NLR 2.8, HOMA-IR 1.2 | INFLAM isolé |
| **C** | F 35 ans, ballonnements quotidiens, Bristol 6, calpro 80, abx ×5 lifetime, fibres ~12g/j, CRP 1.1, HOMA-IR 1.4 | DYSBIOSE dominante + INFLAM secondaire |

Les trois cas sont préchargés dans `IntentForm.tsx` pour validation immédiate du moteur.

---

## Évolutions à venir

- **v0.2** : référentiel `culinary_levers` à 60 lignes
- **v0.3** : ajout des 4 bottlenecks suivants (charge allostatique, méthylation, oxydation, signal endocrinien) — chacun avec sa propre matrice
- **v1.0** : 12 bottlenecks couvrant le périmètre complet de la médecine fonctionnelle, avec règles d'interaction multi-bottlenecks
