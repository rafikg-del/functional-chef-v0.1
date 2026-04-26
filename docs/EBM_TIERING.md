# EBM-F Tiering Methodology

## Principe

Chaque levier culinaire dans la base `culinary_levers` porte un tier EBM-F (`ebm_tier`) **global** et un tier **par bottleneck** (`lever_bottleneck_map.tier_for_bottleneck`). Cette double granularité reflète une réalité du terrain : un levier peut être T1 pour une cible et T2 ou T3 pour une autre.

> **Exemple** : l'huile d'olive extra vierge est T1 pour l'inflammaging (PREDIMED, Estruch 2013 NEJM), T1 pour l'IR (PREDIMED secondary analysis), mais T2 pour la dysbiose (données émergentes, mécanisme partiellement caractérisé).

## Échelle

| Tier | Critère | Exemple |
|---|---|---|
| **T1** | ≥1 méta-analyse de RCT humains avec effet reproductible et translation clinique mesurable | Vinaigre pré-prandial (Shishehbor 2017 méta), légumineuses 3-4×/sem ↓ HbA1c -0.48% (Sievenpiper 2009 méta), refroidissement amidon → ↑ amidon résistant + ↓ AUC |
| **T2** | RCT humains avec hétérogénéité ou taille modeste, OU cohorte solide | Whey 20g pré-prandial (Jakubowicz 2014 RCT n=30), curcumine + pipérine (Sahebkar 2016 méta — formulation-dépendante) |
| **T3** | Mécanistique forte, observationnel, OU RCT n<50 isolé | Bouillon d'os (mécanistique seule), café noir avec repas glucidique (résultats conflictuels) |

## Garde-fous éditoriaux

### 1. Pas d'inflation de tier par enthousiasme

Tendance courante dans la médecine fonctionnelle : présenter une étude de cas, une *in vitro*, ou un mécanisme cellulaire comme s'il s'agissait d'une preuve d'effet clinique humain. Functional Chef rejette explicitement cette inflation. Si une intervention n'a que de la mécanistique, elle est T3, sans honte. Le tier T3 n'est pas une disqualification — c'est une honnêteté.

### 2. Référence pivot obligatoire

Chaque levier porte au minimum un `primary_reference` (ex : "Shishehbor 2017 méta") et idéalement un ou plusieurs `pubmed_ids`. Un levier sans référence pivot ne peut pas entrer en base. Pas d'exception.

### 3. Re-tiering périodique

L'evidence évolue. Cible : revoir 100% du référentiel `culinary_levers` tous les 6 mois pour ajuster les tiers selon nouvelles publications. Champs `updated_at` automatique sur la table.

### 4. Translation clinique vs effet biochimique

Un effet *in vivo* humain sur un biomarqueur (ex : ↓ CRP-us de 0.3 mg/L) est différent d'un effet clinique tangible (↓ événements CV, amélioration symptomatique). Pour les leviers où la translation clinique est débattue (ex : AGE alimentaires et inflammation systémique humaine), le tier reste T2 ou T3 même si le mécanisme est solide.

## Exemples de gradation justifiée

### EVOO ≥40 ml/jour
- **Tier global : T1**
- **Bottleneck IR : T1** — PREDIMED secondary analysis 2014, ↑ sensibilité insulinique vs SFA en pattern méditerranéen complet
- **Bottleneck INFLAM : T1** — PREDIMED (Estruch 2013 NEJM, n=7447), ↓ événements CV majeurs ; oléocanthal effet COX-like
- **Bottleneck DYSBIOSE : T2** — Effet modulateur microbiote favorable, données humaines émergentes mais translation clinique pas encore consolidée

### Vinaigre pré-prandial 15-30 ml
- **Tier global : T1**
- **Bottleneck IR : T1** — Shishehbor 2017 méta-analyse n=11 RCT, effet reproductible -20% AUC glucose 2h
- **Bottleneck INFLAM : non listé** — pas de levier sur cette cible
- **Bottleneck DYSBIOSE : non listé** — non pertinent

### Bouillon d'os 12-24h
- **Tier global : T3**
- **Bottleneck DYSBIOSE : T3** — données mécanistiques (collagène, glycine, glutamine pour barrière intestinale), études cliniques humaines limitées
- Pas de revendication T1/T2 même si très répandu en médecine fonctionnelle

### Curcumine + pipérine + lipide chaud
- **Tier global : T2** (cuisine) / T1 supplémentation
- **Bottleneck INFLAM : T2** — Sahebkar 2016 méta-analyse mais hétérogénéité forte, formulation-dépendante. La cuisine (curcuma poudre) atteint des concentrations plasmatiques inférieures aux études cliniques (formulations lipidiques).
- **Bottleneck IR : T3** — données indirectes
- **Bottleneck DYSBIOSE : T2** — modulation microbiote documentée

## Communication patient/médecin du tier

L'UI affiche le badge T1/T2/T3 pour chaque levier mobilisé, avec tooltip :

| Badge | Interprétation patient/médecin |
|---|---|
| **T1** | Effet documenté en méta-analyse de RCT humains. Recommandé sans réserve. |
| **T2** | Effet probable, RCT modeste ou cohorte solide. Mobilisable. |
| **T3** | Effet plausible (mécanistique/observationnel). Optionnel, à pondérer. |

Cette transparence est **un argument commercial** : la concurrence (Yuka, Foodvisor, ChatGPT) ne tier pas. Functional Chef est le seul à offrir cette granularité d'evidence sur chaque levier mobilisé.

## Audit et corrections

Si un utilisateur (médecin) signale une référence obsolète ou une mauvaise gradation :
1. Issue tracker dédié (en v0.2)
2. Re-tiering documenté avec changelog
3. Notification aux consultations passées si la révision change le badge

L'engagement est : **aucun T1 ne peut être attribué sans qu'au moins un médecin du conseil scientifique ait validé la référence pivot**. C'est le contrôle qualité fondamental.
