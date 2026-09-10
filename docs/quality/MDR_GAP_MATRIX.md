# LIV-02 — Matrice d’écart MDR (autonome)

> **Identifiant** : FC-REG-MDR-GAP / LIV-02
> **Version** : 1.1
> **Statut** : **Brouillon — signature humaine requise**
> **Date** : 2026-09-10
> **Source** : extrait mis à jour de [`docs/MDR_DOSSIER.md`](../MDR_DOSSIER.md) §8 (v1.0 — 14 juillet 2026)
> **Règle** : ✅ preuve dans le repo **et** exigence réellement tenue · 🔶 partiel / conception seulement · ❌ absent
> **Honnêteté** : le dossier v1.0 marquait plusieurs lignes ✅ trop tôt (notice, FMEA, IT, algorithmes). Cette matrice **resserre** les statuts.

Classification IIa Règle 11 = **hypothèse**, pas une décision d’ON.

---

## 1. Contrôle documentaire

### 1.1 Signatures (vacantes)

| Rôle | Nom | Date | Décision | Signature |
|------|-----|------|----------|-----------|
| Rédacteur | | | Brouillon soumis | |
| Expert MDR | | | Approuvé / sous réserve / refusé | |
| Fabricant | | | Prise d’acte | |

---

## 2. Légende

| Symbole | Signification |
|---------|----------------|
| ✅ | Exigence couverte par une preuve reproductible (code, test, document signé). **Aucun ✅ ci-dessous ne signifie « certifié ».** |
| 🔶 | Travail amorcé, preuves incomplètes, ou document non signé |
| ❌ | Non commencé ou impossible avant un acteur humain (ON, PRRC, CE) |

---

## 3. Annexe I — Chapitre I (exigences générales)

| Réf. | Exigence | Statut | Preuve / écart |
|------|----------|--------|----------------|
| 1.1 | Sécurité et performances | 🔶 | Tests unitaires + CI (LIV-43). Validation clinique interne **7/10 (70 %)** sur pack LIV-25 partiel (DYSBIOSE 1/3). Pas d’étude Art. 62. |
| 1.2 | Rapport bénéfice/risque favorable | 🔶 | Texte MDR_DOSSIER §5.3. FMEA **10 scénarios** seulement (critère Phase 1 : ≥ 30). Non signé. |
| 1.3 | Performance conforme à la destination | 🔶 | Cas-pivot A/B/C unitaires. Destination « aide praticien » non figée juridiquement (LIV-03). |
| 1.4 | Risques réduits au minimum | 🔶 | Mitigations code (filtres, tests). R-06 allergènes : warning UI renforcé **non démontré**. FMEA incomplète. |
| 1.5 | Précautions d’emploi | 🔶 | [GUIDE_UTILISATION](../GUIDE_UTILISATION.md), [FAQ](../FAQ.md), [NOTE_PATIENT](../NOTE_PATIENT.md) rédigés, **non relus** avocat/CS/early adopter. |

---

## 4. Annexe I — Chapitre II (conception, logiciel, IT)

| Réf. | Exigence | Statut | Preuve / écart |
|------|----------|--------|----------------|
| 10.1 | Informations accompagnant le DM | 🔶 | Notice LIV-67 brouillon ; URL application placeholder |
| 10.2 | Marquage CE | ❌ | Hors Phase 1 |
| 10.3 | Étiquetage | ❌ | Non conçu (version, fabricant, UDI, classe) |
| 10.4.4 | Logiciel : précision, fiabilité | 🔶 | Vitest + CI. Seed PMID : audit historique 67 % d’erreur ; **écarts encore ouverts** (LIV-17 : `19465743`, `27259976`, PMID sugar NULL). Tiers auto-déclarés. |
| 10.4.5 | Logiciel : sécurité IT | 🔶 | RLS SQL (migration 002). **Pas de pentest.** `/api/classify` et `/api/compose` utilisent **service role** (bypass RLS) ; persist consultation **sans** `professional_id`. Middleware n’applique pas l’auth aux routes API. |
| 14.2 | Dispositifs contenant des logiciels | 🔶 | Architecture documentée ; SMQ LIV-11 brouillon ; pas de plan IEC 62304 |
| 17.1 | Accès non autorisés | 🔶 | Auth dashboard. API moteur non authentifiée au niveau middleware. Service role côté serveur. |
| 17.2 | Fiabilité des algorithmes | 🔶 | Moteur déterministe testé. Concordance clinicien 70 %, VPP DYSBIOSE **non définie**. CS non signé. |

---

## 5. Classification et articles du règlement

| Réf. | Exigence | Statut | Preuve / écart |
|------|----------|--------|----------------|
| Annexe VIII Règle 11 | Classe IIa proposée | 🔶 | Argumentaire LIV-01/03 dans MDR_DOSSIER. **Pas d’avis juridique ni d’ON.** |
| Art. 5 / destination | Destination figée | 🔶 | Textes produit cohérents « aide praticien » ; LIV-03 non signé |
| Art. 10(8) | Déclaration UE de conformité | ❌ | |
| Art. 10(9) | Traçabilité | 🔶 | Table `audit_log` + persist `consultations`. Insert audit **constaté** sur consentement seulement. Classify/compose **ne journalisent pas** `audit_log`. Pas de tag `vX.Y.Z` (LIV-14). |
| Art. 10(10) | Enregistrement fabricant (EUDAMED) | ❌ | |
| Art. 15 | PRRC | ❌ | Non désigné |
| Art. 32 | SSCP | ❌ | |
| Art. 61 / 62 | Évaluation / investigation clinique | 🔶 | LIV-24..27 = preuve interne, **hors Art. 62**, non signé CS, n=10 de faisabilité |
| Art. 83–86 | PMS / PSUR | ❌ | Pas de mise sur le marché |
| Art. 87+ | Vigilance | ❌ | Canal NC LIV-13 brouillon seulement |
| Art. 56 | Organisme notifié | ❌ | LIV-09 non démarré |

---

## 6. RGPD (connexe, pas MDR) — pour ne pas mélanger les ✅

| Réf. | Exigence | Statut | Preuve / écart |
|------|----------|--------|----------------|
| Art. 13 information | Politique | 🔶 | Page `/privacy` v1.0-20260714 — **avocat absent** |
| Art. 7 / 9 consentement | Recueil | 🔶 | UI `/consent` praticien ; consentement **patient** déclaré comme obligation du praticien, pas un flux patient signé dans l’app |
| Art. 17 effacement | Droit à l’oubli | 🔶 | Fonction SQL `delete_professional_account` (migration) ; test E2E **non documenté** |
| Art. 32 sécurité | TOM | 🔶 | Intention TLS/AES/RLS ; pentest absent ; service role |
| Transferts US (LLM) | CCT | 🔶 | Intention documentée ; DPA/CCT **non versés** |

---

## 7. Plan de résolution (actualisé)

| ID | Écart | Action | Acteur | Phase | Priorité |
|----|-------|--------|--------|-------|----------|
| PR-01 | Notice / précautions | Relecture LIV-67 + LIV-69 | Early adopter + CS | 1 | Haute |
| PR-02 | Marquage CE | Après certificat | Fabricant | 2+ | Haute |
| PR-03 | Étiquetage logiciel | Écran « à propos » : version tag, fabricant, classe | Dev | 2 | Haute |
| PR-04 | Déclaration UE | Après ON | MDR | 2 | Haute |
| PR-05 | EUDAMED | Après PRRC + SRN | Fabricant | 2 | Haute |
| PR-06 | PRRC | Désigner (interne ou contractuel) | Fabricant | 1 | Haute |
| PR-07 | ON | Pré-soumission LIV-09 | Expert MDR | 1 | Haute |
| PR-08 | SMQ | Revue LIV-11..17 par consultant qualité | Qualité | 1 | Moyenne |
| PR-09 | FMEA ≥ 30 | Compléter LIV-06 | Expert + fabricant | 1 | Haute |
| PR-10 | CS + 100 % LIV-16 | Recrutement LIV-18..21 | Fabricant | 1 | Critique |
| PR-11 | PMID ouverts | NC LIV-13, **pas** de PMID inventé | CS | 1 | Haute |
| PR-12 | API + RLS + audit | Auth API, fin service-role sur persist patient, `audit_log` classify/compose, pentest | Dev + sécu | 1 | Critique |
| PR-13 | Pack LIV-25 DYSBIOSE | 2 cas intestinaux réels | ZOI / CS | 1 | Haute |
| PR-14 | Avocat | Privacy + FAQ LIV-33/68 | Avocat | 1 | Haute |
| PR-15 | Assurance | RC Pro + Cyber | Assureur | 1 | Haute |

Le dossier v1.0 listait PR-01..08 seulement. PR-09..15 reflètent l’état **observé** du repo en septembre 2026.

---

## 8. Lien avec le dossier unique

[`docs/MDR_DOSSIER.md`](../MDR_DOSSIER.md) reste le narratif LIV-01..08. **En cas de conflit de statut, cette matrice prévaut** (plus récente, plus stricte). Mettre à jour les deux par PR (LIV-12).

---

## 9. Disclaimer

Aucun ✅ de ce tableau n’autorise une mise sur le marché UE. La matrice est un outil de pilotage Phase 1, pas un certificat.
