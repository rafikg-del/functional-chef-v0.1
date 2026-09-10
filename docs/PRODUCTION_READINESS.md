# Production readiness — Go / No-Go Phase 2

> **Document** : checklist de passage en beta clinique contrôlée (20 patients)
> **Version** : 1.0
> **Statut** : **Brouillon — signature humaine requise**
> **Date** : 2026-09-10
> **Critères** : [`docs/PHASE1_ROADMAP.md`](PHASE1_ROADMAP.md) § « Critères de passage en Phase 2 »
> **Décision globale** : **NO-GO**

Légende des statuts :

| Statut | Signification |
|--------|----------------|
| **DONE** | Preuve dans le repo, reproductible, sans signature externe requise pour *cet* item technique |
| **DRAFT_NEEDS_EXPERT** | Artefact présent, **incomplet ou non signé** — relecture CS / avocat / qualité / MDR / pentest |
| **BLOCKED_HUMAN** | Impossible à un agent : CS, avocat, assureur, ON, désignation PRRC, outreach Rafik / ZOI |

Pas de threshold gaming : la concordance 7/10 n’est **pas** présentée comme un Go clinique.

---

## 1. Checkpoints obligatoires Phase 2 (roadmap)

| Checkpoint | Statut | Preuve | Qui débloque |
|------------|--------|--------|----------------|
| **LIV-03** Classification MDR claire + note juridique favorable | **DRAFT_NEEDS_EXPERT** | Argumentaire IIa dans [MDR_DOSSIER](MDR_DOSSIER.md) §1–2 ; **aucun avis juridique** | Avocat + expert MDR |
| **LIV-06** Analyse des risques ≥ 30 scénarios | **DRAFT_NEEDS_EXPERT** | FMEA **10** lignes seulement (§5.2). Critère **non tenu** | Expert MDR / qualité + fabricant |
| **LIV-16** Revue EBM appliquée à **100 %** des leviers | **BLOCKED_HUMAN** | Template [LIV-16](quality/LIV-16_FICHE_REVUE_LEVIER.md) ; [LIV-17](quality/LIV-17_CHANGELOG_EBM.md) : **0 / 63** signatures CS | **CS** (LIV-18..21) |
| **LIV-24** Protocole approuvé par le CS | **DRAFT_NEEDS_EXPERT** | [CLINICAL_VALIDATION_PROTOCOL.md](CLINICAL_VALIDATION_PROTOCOL.md) v0.1, signatures vides | **CS** |
| **LIV-29** RLS activées **et** test d’intrusion basique | **DRAFT_NEEDS_EXPERT** | Politiques dans `supabase/migrations/002_auth_profiles.sql`. API classify/compose en **service role** (bypass). Pas de pentest versé | Dev + testeur sécu (humain) |
| **LIV-33** Politique de confidentialité publiée | **DRAFT_NEEDS_EXPERT** | `src/app/privacy/page.tsx` v1.0-20260714 — **non relue avocat** | **Avocat** |
| **LIV-36** Audit trail opérationnel | **DRAFT_NEEDS_EXPERT** | Table `audit_log` ; insert constaté sur `/consent`. Classify/compose **n’écrivent pas** l’audit log. Persist sans `professional_id`. Pas de tag version | Dev (puis revue qualité) |
| **LIV-43** CI tests automatisés | **DONE** | `.github/workflows/test.yml` (typecheck + vitest + cas de validation) | — |
| **LIV-62** Validation médecin implémentée | **DRAFT_NEEDS_EXPERT** | UI dashboard + colonnes `validated_at` ; **fallback mock** si erreur/vide. Pas de preuve E2E prod | Dev + early adopter |
| **LIV-68** FAQ juridique publiée | **DRAFT_NEEDS_EXPERT** | [FAQ.md](FAQ.md) — relecture avocat + CS **demandée, non faite** | **Avocat** + **CS** |
| **Assurance RC Pro + Cyber** | **BLOCKED_HUMAN** | FAQ Q13 : « sera souscrite ». Aucune police dans le repo | **Assureur** + fabricant |
| **LIV-51** ≥ 5 praticiens pré-inscrits | **BLOCKED_HUMAN** | Formulaire `/beta` = **localStorage uniquement**, pas de table. Aucun fichier d’inscrits | **Outreach Rafik** (+ backend réel) |

**Score honnête** : 1 DONE / 8 DRAFT_NEEDS_EXPERT / 3 BLOCKED_HUMAN sur les 12 cases roadmap.

---

## 2. Dépendances humaines hors checklist courte (quand même bloquantes)

| Item | Statut | Détail |
|------|--------|--------|
| **CS constitué** (LIV-18..20) | **BLOCKED_HUMAN** | Charte, contrat, 2 membres + DOI absents |
| **PRRC** MDR Art. 15 | **BLOCKED_HUMAN** | Non désigné |
| **Organisme notifié** (LIV-09) | **BLOCKED_HUMAN** | Pas de pré-soumission |
| **Partenariat ZOI** (LIV-57) | **BLOCKED_HUMAN** | [PROPOSITION_ZOI.md](PROPOSITION_ZOI.md) rédigée ; envoi/suivi non prouvé dans le repo |
| **LIV-25 strate DYSBIOSE ≥ 3** | **BLOCKED_HUMAN** | Pack partiel **1/3** ; interdiction d’inventer des cas |
| **LIV-26/27** | **DRAFT_NEEDS_EXPERT** | 7/10, C1 80 % non poursuivie, **non signé CS** |
| **SMQ LIV-11..13** | **DRAFT_NEEDS_EXPERT** | Pack `docs/quality/` brouillon, consultant qualité vacant |
| **PMID ouverts** | **DRAFT_NEEDS_EXPERT** | LIV-17 : Sievenpiper PMID non résolu ; 27259976 introuvable ; sugar PMID NULL |
| **Seed mapping 05** | **DRAFT_NEEDS_EXPERT** | Point-virgules prématurés dès la ligne 81 (LIV-17 §7.3) |

---

## 3. Ce qui est réellement DONE (ne pas l’oublier)

- Scaffold moteur déterministe + tests classifier / safety / levers
- CI GitHub Actions sur `main`
- Pack LIV-25 JSON anonymisés (n=10) + notes LIV-26 + matrice LIV-27 **descriptive**
- Brouillons doc : MDR, guide, FAQ, note patient, protocole, pack qualité (ce PR)
- Page privacy et écran consentement **en tant que code**, pas en tant que conformité

---

## 4. Décision

| Question | Réponse |
|----------|---------|
| Ouvrir une beta clinique 20 patients **maintenant** ? | **NO-GO** |
| Raison principale | CS absent, FMEA < 30, RLS/audit non démontrés, 0 revue EBM signée, assurance absente, 0 praticien tracé hors localStorage |
| Condition minimale d’un futur GO | Toutes les lignes BLOCKED_HUMAN ci-dessus levées **et** LIV-03/06/29/33/36/62/68 au moins « expert signé » ou pentest daté |

### 4.1 Signatures de revue Go/No-Go (vacantes)

| Rôle | Nom | Date | Go / No-Go | Signature |
|------|-----|------|------------|-----------|
| Fabricant | | | | |
| CS | | | | |
| Avocat | | | | |
| Qualité / MDR | | | | |

---

## 5. Disclaimer

Ce fichier est un **instrument de gouvernance**. Il n’autorise aucune inclusion de patient réel. Un « DONE » technique ≠ autorisation réglementaire.
