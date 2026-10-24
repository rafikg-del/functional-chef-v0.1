# Production readiness — Go / No-Go Phase 2

> **Document** : checklist de passage en beta clinique contrôlée (20 patients)
> **Version** : 1.0
> **Statut** : **Brouillon — signature humaine requise**
> **Date** : 2026-09-10 — annotation gouvernance **2026-10-24**
> **Critères** : [`docs/PHASE1_ROADMAP.md`](PHASE1_ROADMAP.md) § « Critères de passage en Phase 2 »
> **Décision globale** : **NO-GO**
> **Gouvernance scientifique** : pas de comité scientifique. **Garant scientifique : Rafik Gounane** (décision fabricant 2026-10-24). LIV-18..21 : **Supprimé — décision fabricant 2026-10-24 : garant scientifique unique**. Les signatures restent vides.

Légende des statuts :

| Statut | Signification |
|--------|----------------|
| **DONE** | Preuve dans le repo, reproductible, sans signature externe requise pour *cet* item technique |
| **DRAFT_NEEDS_EXPERT** | Artefact présent, **incomplet ou non signé** — relecture garant scientifique / avocat / qualité / MDR / pentest |
| **BLOCKED_HUMAN** | Impossible à un agent : avocat, assureur, organisme notifié, expert MDR, désignation PRRC, outreach praticiens / ZOI, dossiers cliniques réels, pentest |

Pas de threshold gaming : la concordance 7/10 n’est **pas** présentée comme un Go clinique.

---

## 1. Checkpoints obligatoires Phase 2 (roadmap)

| Checkpoint | Statut | Preuve | Qui débloque |
|------------|--------|--------|----------------|
| **LIV-03** Classification MDR claire + note juridique favorable | **DRAFT_NEEDS_EXPERT** | Argumentaire IIa dans [MDR_DOSSIER](MDR_DOSSIER.md) §1–2 ; **aucun avis juridique** | Avocat + expert MDR |
| **LIV-06** Analyse des risques ≥ 30 scénarios | **DRAFT_NEEDS_EXPERT** | FMEA **10** lignes seulement (§5.2). Critère **non tenu** | Expert MDR / qualité + fabricant |
| **LIV-16** Revue EBM appliquée à **100 %** des leviers | **DRAFT_NEEDS_EXPERT** | Template [LIV-16](quality/LIV-16_FICHE_REVUE_LEVIER.md) ; [LIV-17](quality/LIV-17_CHANGELOG_EBM.md) : **0 / 63** signatures. LIV-18..21 supprimés. Reste : signature des 63 fiches | **Garant scientifique : Rafik Gounane** |
| **LIV-24** Protocole approuvé par le garant scientifique | **DRAFT_NEEDS_EXPERT** | [CLINICAL_VALIDATION_PROTOCOL.md](CLINICAL_VALIDATION_PROTOCOL.md) v0.1, signatures vides | **Garant scientifique : Rafik Gounane** |
| **LIV-29** RLS activées **et** test d’intrusion basique | **DRAFT_NEEDS_EXPERT** | Politiques dans `supabase/migrations/002_auth_profiles.sql`. API classify/compose en **service role** (bypass). Pas de pentest versé | Dev + testeur sécu (humain) |
| **LIV-33** Politique de confidentialité publiée | **DRAFT_NEEDS_EXPERT** | `src/app/privacy/page.tsx` v1.0-20260714 — **non relue avocat**. Le bandeau public dit encore « pending avocat/CS » : copy publique non modifiée dans ce lot | **Avocat** |
| **LIV-36** Audit trail opérationnel | **DRAFT_NEEDS_EXPERT** | Table `audit_log` ; insert constaté sur `/consent`. Classify/compose **n’écrivent pas** l’audit log. Persist sans `professional_id`. Pas de tag version | Dev (puis revue qualité) |
| **LIV-43** CI tests automatisés | **DONE** | `.github/workflows/test.yml` (typecheck + vitest + cas de validation) | — |
| **LIV-62** Validation médecin implémentée | **DRAFT_NEEDS_EXPERT** | UI dashboard + colonnes `validated_at` ; **fallback mock** si erreur/vide. Pas de preuve E2E prod | Dev + early adopter |
| **LIV-68** FAQ juridique publiée | **DRAFT_NEEDS_EXPERT** | [FAQ.md](FAQ.md) — relecture avocat + garant scientifique **demandée, non faite** | **Avocat** + **Garant scientifique : Rafik Gounane** |
| **Assurance RC Pro + Cyber** | **BLOCKED_HUMAN** | FAQ Q13 : « sera souscrite ». Aucune police dans le repo | **Assureur** + fabricant |
| **LIV-51** ≥ 5 praticiens pré-inscrits | **BLOCKED_HUMAN** | Formulaire `/beta` = **localStorage uniquement**, pas de table. Aucun fichier d’inscrits | **Outreach Rafik** (+ backend réel) |

**Score honnête** : 1 DONE / 9 DRAFT_NEEDS_EXPERT / 2 BLOCKED_HUMAN sur les 12 cases roadmap.

LIV-16 quitte BLOCKED_HUMAN : le comité n’est plus le blocage. L’action humaine restante sur ce point est la signature, encore absente, des 63 fiches LIV-16 et du protocole LIV-24 par le garant scientifique. Assurance et LIV-51 restent BLOCKED_HUMAN.

---

## 2. Dépendances humaines hors checklist courte (quand même bloquantes)

| Item | Statut | Détail |
|------|--------|--------|
| **LIV-18..21** (charte, contrat, constitution, DOI, re-tiering par comité) | **Supprimé** | **Supprimé — décision fabricant 2026-10-24 : garant scientifique unique**. Plus un prérequis. Historique conservé dans la roadmap |
| **PRRC** MDR Art. 15 | **BLOCKED_HUMAN** | Non désigné |
| **Organisme notifié** (LIV-09) | **BLOCKED_HUMAN** | Pas de pré-soumission |
| **Partenariat ZOI** (LIV-57) | **BLOCKED_HUMAN** | [PROPOSITION_ZOI.md](PROPOSITION_ZOI.md) rédigée ; envoi/suivi non prouvé dans le repo |
| **LIV-25 strate DYSBIOSE ≥ 3** | **BLOCKED_HUMAN** | Pack partiel **1/3** ; interdiction d’inventer des cas |
| **LIV-26/27** | **DRAFT_NEEDS_EXPERT** | 7/10, C1 80 % non poursuivie, **non signé** par le garant scientifique |
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
| Raison principale | FMEA < 30, expert MDR et organisme notifié absents, PRRC non désigné, avocat non mandaté, RLS/audit non démontrés, pentest absent, 0/63 revues EBM signées par le garant scientifique, protocole LIV-24 non signé, assurance absente, < 5 praticiens tracés hors localStorage, strate DYSBIOSE 1/3 (2 cas réels manquants) |
| Condition minimale d’un futur GO | Toutes les lignes BLOCKED_HUMAN ci-dessus levées **et** LIV-03/06/16/24/29/33/36/62/68 au moins signés par l’acteur indiqué (expert, avocat, garant scientifique, pentest daté) |

### 4.1 Signatures de revue Go/No-Go (vacantes)

| Rôle | Nom | Date | Go / No-Go | Signature |
|------|-----|------|------------|-----------|
| Fabricant | | | | |
| Garant scientifique : Rafik Gounane | | | | |
| Avocat | | | | |
| Qualité / MDR | | | | |

---

## 5. Disclaimer

Ce fichier est un **instrument de gouvernance**. Il n’autorise aucune inclusion de patient réel. Un « DONE » technique ≠ autorisation réglementaire.
