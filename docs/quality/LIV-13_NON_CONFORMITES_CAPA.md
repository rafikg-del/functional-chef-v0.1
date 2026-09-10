# LIV-13 — Procédure de gestion des non-conformités et CAPA

> **Identifiant** : FC-SOP-CAPA / LIV-13
> **Version** : 1.0 (brouillon)
> **Statut** : **Brouillon — signature humaine requise**
> **Date** : 2026-09-10
> **Template** : [templates/CAPA.md](templates/CAPA.md)
> **Manuel parent** : [LIV-11](LIV-11_MANUEL_QUALITE.md)

---

## 1. Contrôle documentaire

### 1.1 Signatures (vacantes)

| Rôle | Nom | Date | Décision | Signature |
|------|-----|------|----------|-----------|
| Rédacteur | | | Brouillon soumis | |
| Consultant qualité | | | Approuvé / sous réserve / refusé | |
| Fabricant | | | Mise en application | |

---

## 2. Objet et définitions

| Terme | Définition opérationnelle |
|-------|---------------------------|
| **Non-conformité (NC)** | Écart par rapport à une exigence documentée (destination, spec, SOP, seed EBM, RLS, test CI, information utilisateur) |
| **Défaut produit** | Sortie moteur inadaptée ou dangereuse (levier contre-indiqué, classification absurde, hallucination LLM non rattrapée) |
| **Réclamation** | Signalement d’un praticien ou patient (via issue GitHub `complaint` ou canal ZOI) |
| **Correction** | Action immédiate pour contenir (revert, hotfix, désactiver un levier `active=false`) |
| **CAPA** | Action **corrective** (éliminer la cause) et/ou **préventive** (empêcher la récurrence / un risque voisin) |

Hors scope : demandes d’évolution sans écart (traitées en backlog produit, pas en NC).

---

## 3. Sources d’entrée

1. Issue GitHub avec label `nc` / `capa` / `safety` / `complaint`
2. Échec CI récurrent sur `main` (LIV-43)
3. Désaccord clinique LIV-26/27 **non accepté** par le CS
4. Écart PMID (audit) ou tier contesté
5. Incident sécurité (accès croisé, fuite, clé service-role exposée)
6. Revue de direction / audit interne

Créer une issue **dans les 2 jours ouvrés** suivant la détection. Pas de NC « orale uniquement ».

---

## 4. Gravité

| Classe | Exemples | Délai de containment | CAPA |
|--------|----------|----------------------|------|
| **S1 — Sécurité patient** | Levier contre-indiqué prescrit ; allergène ; interaction AVK non filtrée | **24 h** (désactiver levier / retirer version) | Obligatoire |
| **S2 — Aide à la décision erronée** | Mauvais bottleneck de façon systématique ; PMID faux encore en seed | 5 jours | Obligatoire si récurrent ou T1 |
| **S3 — Qualité / traçabilité** | Audit log manquant, tag absent, mock UI en prod | 15 jours | Selon risque |
| **S4 — Documentation** | Lien mort, SOP incomplète | 30 jours | Optionnelle |

En cas de doute entre S1 et S2 : **classer S1**.

---

## 5. Circuit

```
Signalement (issue)
  → Containment (correction)
    → Ouverture fiche CAPA (template)
      → Analyse de cause (5 pourquoi / Ishikawa léger)
        → Actions + responsables + échéances
          → Vérification d’efficacité (preuve : test, re-run LIV-25, revue CS)
            → Clôture (signature fabricant ; CS si EBM/clinique)
```

Règles :

- Une NC S1 **ne se clôt pas** par un simple merge.
- Changer un seuil clinique pour « coller » un label clinicien est **interdit** (même politique que LIV-26 : pas de threshold gaming). Si un seuil est réellement erroné, c’est une CAPA avec justification bibliographique, pas un tweak d’indicateur.
- Impact EBM → fiche LIV-16 + ligne LIV-17.

---

## 6. Enregistrement

| Élément | Lieu |
|---------|------|
| Ticket | GitHub issue, titre `[NC-YYYY-NNN] …` |
| Fiche | `docs/quality/capa/CAPA-YYYY-NNN.md` (copie du template) |
| Lien PR de correction | Dans la fiche |
| Revue | PR documentaire selon LIV-12 |

Le dossier `docs/quality/capa/` est créé à la **première** NC réelle. **Aucune CAPA n’est ouverte à ce jour** — ne pas inventer d’historique.

---

## 7. Indicateurs (quand le SMQ est en vigueur)

- Nombre de NC ouvertes / S1
- Délai médian de containment S1
- CAPA ouvertes > 90 jours
- Récurrence (même cause)

Revue : direction LIV-11 §9.

---

## 8. Disclaimer

Un template vide n’est pas un système CAPA opérationnel. Sans responsable nommé et sans première revue, cette procédure reste un **brouillon**.
