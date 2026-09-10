# LIV-16 — Fiche de revue de levier (template)

> **Identifiant** : FC-TPL-EBM / LIV-16
> **Version** : 1.0 (brouillon)
> **Statut** : **Brouillon — signature humaine requise**
> **Procédure** : [LIV-15](LIV-15_PROCEDURE_LEVIER_CULINAIRE.md)
> **Copier vers** : `docs/quality/reviews/LIV-16-<LEVER_ID>-<YYYYMMDD>.md`

Champs demandés par la roadmap : PMID, tier proposé, tier validé, reviewer, date, réévaluation.

**Interdit** : pré-signer, copier-coller un PMID non ouvert sur PubMed, marquer T1 « validé » par un agent.

---

## 0. Identification

| Champ | Valeur |
|-------|--------|
| ID levier | `L_…` |
| Nom FR | |
| Catégorie seed | preparation / ingredient / timing / sequence / cooking / fermentation / dose / avoidance |
| Type de changement | A éditorial / B mineur / C tier / D nouveau / E retrait |
| SHA / PR | |
| Levier `active` après merge | true / false |

## 1. Destination clinique

Bottlenecks visés (cocher) et **tier proposé par bottleneck** :

| Bottleneck | Mapping actuel (si existant) | Tier proposé | Priorité proposée |
|------------|------------------------------|--------------|-------------------|
| IR | | T1 / T2 / T3 / non listé | |
| INFLAM | | T1 / T2 / T3 / non listé | |
| DYSBIOSE | | T1 / T2 / T3 / non listé | |

Tier **global** proposé (`culinary_levers.ebm_tier`) : T1 / T2 / T3

Étoile universelle ? oui / non — justification (T1 sur ≥2 bottlenecks) :

## 2. Preuve

| Champ | Valeur |
|-------|--------|
| Référence pivot (Auteur Année journal) | |
| PMID principal | _numérique uniquement, ou « aucun — justifier »_ |
| PMID secondaires | |
| URL PubMed vérifiée le | |
| Titre PubMed **égal** à la référence déclarée ? | oui / non — si non : **ne pas valider** |
| Type d’étude | méta-RCT / RCT / cohorte / mécanistique / reco société |
| Population (n, pathologie) | |
| Issue mesurée | biomarqueur / clinique / autre |
| Translation clinique (EBM_TIERING §4) | suffisante / débattue / absente |

Notes (limites, hétérogénéité, formulation culinaire vs supplément) :

## 3. Sécurité

| Champ | Valeur |
|-------|--------|
| Contre-indications seed | |
| Précautions | |
| Interactions (AVK, CYP, chirurgie…) | |
| Allergènes | |
| Couverture `safety-filters.ts` | déjà / à ajouter (issue) / N/A |

## 4. Décision CS

| Champ | Avant | Proposé | **Validé CS** |
|-------|-------|---------|----------------|
| Tier global | | | |
| IR | | | |
| INFLAM | | | |
| DYSBIOSE | | | |
| PMIDs retenus | | | |

Décision :

- [ ] Approuvé tel quel
- [ ] Approuvé sous réserve (préciser)
- [ ] Refusé (rester au tier actuel / ne pas insérer)
- [ ] Reporté — CS non disponible (**défaut actuel du projet**)

Date de **réévaluation** (≤ 6 mois) : ____ / ____ / ________

## 5. Signatures (vacantes)

| Rôle | Nom | Date | Décision | Signature / paraphe |
|------|-----|------|----------|---------------------|
| Rédacteur fiche | | | | |
| Reviewer CS — médecin | | | Approuvé / sous réserve / refusé | |
| 2ᵉ reviewer CS (si T1 nouveau) | | | | |
| Responsable seed / merge | | | Prise d’acte | |

Réserves :

> _

## 6. Traçabilité post-merge

| Action | Fait |
|--------|------|
| Seed 04/05 mergé | |
| `npm run changelog:ebm` | |
| Ligne journal LIV-17 §9 | |
| Tag LIV-14 si prod | |
| CAPA liée | CAPA-… / sans objet |
