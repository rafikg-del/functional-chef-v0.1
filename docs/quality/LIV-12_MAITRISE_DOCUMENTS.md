# LIV-12 — Procédure de maîtrise des documents

> **Identifiant** : FC-SOP-DOC / LIV-12
> **Version** : 1.0 (brouillon)
> **Statut** : **Brouillon — signature humaine requise**
> **Date** : 2026-09-10
> **Système contrôlé** : dépôt GitHub `rafikg-del/functional-chef-v0.1` (pull requests, revues, tags annotés)
> **Manuel parent** : [LIV-11](LIV-11_MANUEL_QUALITE.md)

---

## 1. Contrôle documentaire

| Champ | Valeur |
|-------|--------|
| Objectif | Créer, revoir, approuver, diffuser et archiver les documents du SMQ et du dossier technique |
| Entrée en vigueur | Après signature §1.1 — **non en vigueur** |
| Documents liés | LIV-11, LIV-14, LIV-15, LIV-17 |

### 1.1 Signatures (vacantes)

| Rôle | Nom | Date | Décision | Signature |
|------|-----|------|----------|-----------|
| Rédacteur | | | Brouillon soumis | |
| Consultant qualité | | | Approuvé / sous réserve / refusé | |
| Fabricant | | | Mise en application | |

---

## 2. Principe

Le **système de maîtrise documentaire** est GitHub :

| Fonction qualité | Mécanisme GitHub | Preuve |
|------------------|------------------|--------|
| Rédaction | Branche `cursor/…` ou `feat/…` | Commits |
| Revue | Pull request + review | Commentaires / approvals |
| Approbation | Merge vers `main` **après** review humaine nommée + (pour docs contrôlés) case signatures remplie **dans le fichier** | PR mergée |
| Version en vigueur | Tag annoté | `git tag -a` |
| Archivage | Historique git + GitHub | SHA immuable |
| Diffusion | `main` + tag | Clone / release |

Un merge sans review nommée **n’est pas** une approbation qualité. Un agent (CI, codegen) **ne signe pas**.

---

## 3. Documents contrôlés vs non contrôlés

### 3.1 Contrôlés (cette procédure s’applique)

| Famille | Emplacement | Approbateur minimum |
|---------|-------------|---------------------|
| Manuel & SOP qualité | `docs/quality/LIV-1[1-6]*`, templates | Fabricant + consultant qualité (quand mandaté) |
| Dossier MDR LIV-01..08 | `docs/MDR_DOSSIER.md`, `docs/quality/MDR_GAP_MATRIX.md` | Expert MDR |
| EBM / leviers | `docs/EBM_TIERING.md`, seeds `04`/`05`, LIV-15/16/17 | CS pour tout changement de tier |
| Validation clinique | `docs/CLINICAL_VALIDATION_PROTOCOL.md`, `docs/validation/liv25/` | CS |
| Information utilisateur | `docs/GUIDE_UTILISATION.md`, `docs/FAQ.md`, `docs/NOTE_PATIENT.md`, `src/app/privacy/page.tsx` | Avocat (FAQ/privacy/note) + CS (FAQ médicale) |
| Go/No-Go | `docs/PRODUCTION_READINESS.md` | Fabricant |

### 3.2 Non contrôlés (hors SMQ)

README produit, notes d’exploration (`HANDBOOK_EXTRACTION`, prompts, extractions), articles GTM, commentaires de code, fixtures de tests synthétiques. Ils peuvent informer mais **ne font pas foi** pour un auditeur.

---

## 4. Cycle de vie

```
Brouillon (branche)
    → En revue (PR ouverte, label `quality-review`)
        → Approuvé (signatures dans le fichier + review GitHub)
            → En vigueur (merge main + tag)
                → Archivé (tag précédent conservé ; nouveau tag)
```

### 4.1 En-tête obligatoire des documents contrôlés

```markdown
> **Identifiant** : FC-… / LIV-nn
> **Version** : x.y
> **Statut** : Brouillon — signature humaine requise
>                 | En revue
>                 | En vigueur (tag `…`)
> **Date** :
```

Tant que la ligne signatures n’est pas remplie **à la main**, le statut reste **Brouillon — signature humaine requise**.

### 4.2 Numérotation

- Version **mineure** (x.y+1) : clarification, liens, typo, régénération de snapshot (LIV-17, registre LIV-14)
- Version **majeure** (x+1.0) : changement d’exigence, de périmètre, de critère d’acceptation, de destination du logiciel

### 4.3 Pull request

Pour un document contrôlé, la PR décrit :

1. Identifiant + version avant / après
2. Nature du changement (mineure / majeure)
3. Impact risque / clinique / EBM (oui/non + lien CAPA ou fiche LIV-16)
4. Reviewers requis (rôle, pas seulement « LGTM bot »)

Branche : pas de commit direct sur `main` pour les fichiers §3.1.

### 4.4 Tags (gel)

| Motif | Convention | Exemple |
|-------|------------|---------|
| Release logicielle | `vMAJOR.MINOR.PATCH` | `v0.2.0` |
| Gel documentaire | `liv-NN-vX.Y` | `liv-24-v0.1` |
| Revue de direction | `liv-11-revue-YYYYMMDD` | `liv-11-revue-20260910` |

Tags **annotés** (`-a`), jamais légers pour un gel qualité. Procédure logicielle : [LIV-14](LIV-14_REGISTRE_LOGICIEL.md).

Aucun tag `v*` ni `liv-*` n’existe à la date de rédaction — voir [REGISTRE_RELEASES.md](REGISTRE_RELEASES.md).

---

## 5. Liste maîtresse (registre)

Tenue dans ce tableau (mettre à jour à chaque création). Statut au 2026-09-10 :

| ID | Titre | Fichier | Version | Statut |
|----|-------|---------|---------|--------|
| LIV-11 | Manuel qualité | `docs/quality/LIV-11_MANUEL_QUALITE.md` | 1.0 | Brouillon |
| LIV-12 | Maîtrise documents | `docs/quality/LIV-12_MAITRISE_DOCUMENTS.md` | 1.0 | Brouillon |
| LIV-13 | NC / CAPA | `docs/quality/LIV-13_NON_CONFORMITES_CAPA.md` | 1.0 | Brouillon |
| LIV-14 | Registre logiciel | `docs/quality/LIV-14_REGISTRE_LOGICIEL.md` | 1.0 | Brouillon |
| LIV-15 | Procédure levier | `docs/quality/LIV-15_PROCEDURE_LEVIER_CULINAIRE.md` | 1.0 | Brouillon |
| LIV-16 | Fiche revue levier | `docs/quality/LIV-16_FICHE_REVUE_LEVIER.md` | 1.0 | Brouillon (template) |
| LIV-17 | Changelog EBM | `docs/quality/LIV-17_CHANGELOG_EBM.md` | 0.1 snapshot | Brouillon généré |
| LIV-02 | Matrice écart MDR | `docs/quality/MDR_GAP_MATRIX.md` | 1.1 | Brouillon |
| LIV-01..08 | Dossier technique | `docs/MDR_DOSSIER.md` | 1.0 | Brouillon |
| LIV-24 | Protocole validation | `docs/CLINICAL_VALIDATION_PROTOCOL.md` | 0.1 | Brouillon, attente CS |
| LIV-25..27 | Pack / concordance | `docs/validation/liv25/` | partiel | Brouillon, DYSBIOSE 1/3 |
| LIV-67 | Guide praticien | `docs/GUIDE_UTILISATION.md` | 1.0 | Brouillon |
| LIV-68 | FAQ | `docs/FAQ.md` | 1.0 | Brouillon avocat+CS |
| LIV-69 | Note patient | `docs/NOTE_PATIENT.md` | 1.0 | Brouillon |
| — | Go/No-Go Phase 2 | `docs/PRODUCTION_READINESS.md` | 1.0 | Brouillon |

Les documents « v1.0 » ci-dessus **ne sont pas en vigueur**.

---

## 6. Documents obsolètes

Un fichier remplacé reste dans git. Marquer en tête : `Statut : Obsoleté par <id> le <date> — tag <ancien>`. Ne pas supprimer l’historique.

---

## 7. Enregistrements

| Enregistrement | Lieu |
|----------------|------|
| Reviews GitHub | PR |
| Signatures | Tableau §signatures de chaque document (scan PDF optionnel hors repo si PHI/identité — pas obligatoire Phase 1) |
| Tags | `git show <tag>` |
| CAPA | `docs/quality/capa/` (à créer à la première NC) |
| Fiches levier | `docs/quality/reviews/` |

---

## 8. Disclaimer

GitHub n’est un « système qualité » que si les revues sont **humaines, nominatives et refusables**. Un merge d’agent, un auto-approve ou une case signature pré-remplie **invalide** l’enregistrement.
