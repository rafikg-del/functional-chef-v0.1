# LIV-11 — Manuel qualité v1.0

> **Identifiant** : FC-QM-001 / LIV-11
> **Version** : 1.0 (brouillon)
> **Statut** : **Brouillon — signature humaine requise**
> **Date** : 2026-09-10
> **Norme de référence** : ISO 13485:2016 (squelette startup, **non certifié**)
> **Produit** : Functional Chef — logiciel d’aide à la décision nutritionnelle (SaMD-adjacent)
> **Classification MDR proposée** : IIa, Règle 11 — **non confirmée** (expert / ON)

---

## 1. Contrôle documentaire

| Champ | Valeur |
|-------|--------|
| Propriétaire | Fabricant (Dr Rafik Gounane) |
| Revue qualité | Consultant ISO 13485 — **vacant** |
| Revue réglementaire | Expert MDR — **vacant** |
| Périodicité de revue | 12 mois ou changement majeur de destination |
| Documents liés | LIV-12, LIV-13, LIV-14, LIV-15, [MDR_GAP_MATRIX](MDR_GAP_MATRIX.md), [MDR_DOSSIER](../MDR_DOSSIER.md) |

### 1.1 Signatures (vacantes)

| Rôle | Nom | Date | Décision | Signature |
|------|-----|------|----------|-----------|
| Rédacteur | | | Brouillon soumis | |
| Consultant qualité | | | Approuvé / Approuvé sous réserve / Refusé | |
| Fabricant | | | Mise en application | |
| PRRC (personne responsable conformité, MDR Art. 15) | | | Prise d’acte — **poste non pourvu** | |

Réserves :

> _À renseigner. Ce manuel n’est pas en vigueur._

---

## 2. Politique qualité

Functional Chef vise à fournir aux professionnels de santé un **outil d’aide à la prescription culinaire** :

1. **Sûr** : filtres de contre-indication déterministes avant toute composition LLM ; le praticien valide avant transmission patient.
2. **Traçable** : chaque sortie moteur doit pouvoir être reliée à une version logicielle, un jeu de leviers et un jeu de seuils.
3. **Honnête sur la preuve** : les leviers portent un tier EBM-F (T1/T2/T3) ; **aucun T1 n’est considéré validé** tant qu’un membre du comité scientifique (CS) n’a pas signé la fiche LIV-16.
4. **Limité dans sa destination** : aide à la décision, **pas** un diagnostic autonome, **pas** un traitement, **pas** un substitut au jugement clinique.

Cette politique s’applique dès la conception (approche « treat as DM ») même si la qualification MDR finale diffère — voir LIV-03 dans [`docs/MDR_DOSSIER.md`](../MDR_DOSSIER.md).

---

## 3. Périmètre du système qualité

### 3.1 Inclus

| Élément | Commentaire |
|---------|-------------|
| Logiciel Functional Chef (moteur déterministe + composition LLM + UI praticien) | Destiné aux professionnels de santé |
| Référentiel `culinary_levers` et mapping bottleneck | Données à impact clinique |
| Documentation contrôlée (`docs/quality/`, dossier MDR, protocole LIV-24) | Maîtrise selon LIV-12 |
| Conception, vérification, gestion des changements logiciels | LIV-14 |
| Non-conformités, réclamations, CAPA | LIV-13 |
| Données de santé traitées pour l’aide à la décision | RGPD — politique `/privacy` en brouillon avocat |

### 3.2 Exclu (hors SMQ actuel)

- Fabrication d’un dispositif matériel
- Investigation clinique MDR Art. 62 (LIV-24 le dit explicitement)
- Marquage CE, déclaration UE de conformité, EUDAMED
- Activité de laboratoire, prescription médicamenteuse
- Usage pédiatrique, grossesse non supervisée, urgences

### 3.3 Qualification du logiciel (positionnement)

Functional Chef est traité comme **logiciel SaMD-adjacent d’aide à la décision** :

- Il **interprète** des biomarqueurs et signaux cliniques.
- Il **propose** une classification (bottleneck) et des leviers culinaires.
- Il **n’est pas** un dispositif autonome : validation humaine obligatoire avant usage patient (LIV-62, partiellement implémenté).

La classe IIa (Règle 11) est une **hypothèse de travail**. Tant que LIV-03 n’est pas signé par un juriste / expert MDR, aucune mise sur le marché UE n’est autorisée par ce manuel.

---

## 4. Organisation et responsabilités

| Rôle | Responsabilités | Statut au 2026-09-10 |
|------|-----------------|----------------------|
| **Fabricant** | Destination prévue, ressources, revue de direction, mise sur le marché | Dr Rafik Gounane (individuel) |
| **PRRC** (MDR Art. 15) | Conformité permanente du SMQ et de la documentation technique | **Non désigné** — BLOCKED_HUMAN |
| **Responsable technique logiciel** | Conception, CI, tags, registre LIV-14 | Assuré par le fabricant / contributeurs repo |
| **Comité scientifique (CS)** | Revue des tiers EBM (LIV-15/16/21), protocole LIV-24 | **Non constitué** (LIV-18 à LIV-20 ouverts) |
| **Consultant qualité** | Revue de ce manuel et des SOP | **Non mandaté** |
| **Expert MDR** | Classification, dossier technique, liaison ON | **Non mandaté** |
| **Avocat** | RGPD, CGU, FAQ juridique | **Non mandaté** (LIV-33, LIV-68) |
| **Organisme notifié** | Évaluation de conformité IIa | **Non sélectionné** (LIV-09) |
| **Praticien utilisateur** | Validation clinique de chaque sortie, consentement patient | Hors organisation interne ; utilisateur du DM |

En l’absence de CS et de PRRC, **aucune release « usage clinique réel » n’est autorisée** par ce manuel.

---

## 5. Processus du SMQ (cartographie)

```
Politique (LIV-11)
    ├── Maîtrise documentaire (LIV-12)  ← GitHub PR / revue / tags
    ├── Maîtrise des changements SW (LIV-14)
    ├── Référentiel EBM (LIV-15, LIV-16, LIV-17)
    ├── Non-conformités / CAPA (LIV-13)
    ├── Conception & risques (MDR_DOSSIER LIV-04..06) — FMEA incomplète
    ├── Vérification (tests unitaires, CI LIV-43)
    ├── Validation clinique interne (LIV-24..27) — pack partiel, non signé CS
    └── Revue de direction (§9)
```

Les processus « post-marché » (PMS, vigilance, PSUR) sont **hors Phase 1** : pas de mise sur le marché.

---

## 6. Maîtrise de la conception logicielle

Référentiels d’intention (non revendiqués comme conformité démontrée) :

- ISO 14971 — gestion des risques (LIV-06 : **10 scénarios** rédigés, critère Phase 1 ≥ 30)
- IEC 62304 — cycle de vie logiciel (classe B visée si IIa confirmé) : issues GitHub + PRs ; **pas** de plan 62304 formel
- IEC 62366 — utilisabilité : guide praticien LIV-67 en brouillon, pas d’étude d’utilisabilité

Exigences utilisateur et sécurité : [`docs/MDR_DOSSIER.md`](../MDR_DOSSIER.md) §4.

Règle : tout changement de **destination**, de **seuil clinique**, de **filtre de sécurité** ou de **tier EBM** suit LIV-12 + (si levier) LIV-15.

---

## 7. Données, sécurité, sous-traitance

| Sujet | État | Document |
|-------|------|----------|
| Auth / RLS | Politiques SQL rédigées ; **pas de test d’intrusion documenté** ; API classify/compose en *service role* | LIV-29, MDR_GAP_MATRIX |
| Audit trail | Table `audit_log` ; journalisation classify/compose **non démontrée** | LIV-36 |
| Hébergement | Supabase UE + Vercel (intention) | LIV-08 |
| LLM (Anthropic/OpenAI) | Sous-traitant ; biomarqueurs pseudonymisés ; CCT à confirmer avocat | LIV-08, FAQ |
| Consentement | UI `/consent` + page `/privacy` — **relecture avocat absente** | LIV-32, LIV-33 |

Les fournisseurs cloud et LLM sont des **sous-traitants**. Aucun contrat DPA signé n’est versé dans ce repo.

---

## 8. Surveillance et amélioration

- Non-conformités et CAPA : LIV-13
- Indicateurs minimaux (quand une beta existe) : taux de validation médecin, incidents sécurité, écarts de tier signalés, échecs CI
- Revue de direction : au moins une fois avant ouverture Phase 2, sur la base de [`docs/PRODUCTION_READINESS.md`](../PRODUCTION_READINESS.md)

---

## 9. Revue de direction (canevas)

Ordre du jour type :

1. Politique et périmètre (inchangés ?)
2. Écarts MDR (matrice)
3. Statut CS / PRRC / assurance
4. NC / CAPA ouvertes
5. Résultats de vérification (CI, LIV-25/26/27)
6. Décision Go / No-Go Phase 2

Compte-rendu : PR documentaire taguée `liv-11-revue-YYYYMMDD`. **Aucune revue n’a eu lieu.**

---

## 10. Documents contrôlés (vue d’ensemble)

La liste maîtresse et les règles d’approbation sont dans [LIV-12](LIV-12_MAITRISE_DOCUMENTS.md). Ce manuel ne duplique pas le registre.

---

## 11. Disclaimer

Ce document a été rédigé comme **brouillon agent** pour accélérer une revue humaine. Il ne prouve pas la conformité ISO 13485 ni MDR. Toute utilisation commerciale ou clinique réelle avant signatures (§1.1) et avant Go Phase 2 est **hors politique qualité**.
