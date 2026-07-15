# Functional Chef — Stratégie Go-To-Market (GTM)

> **Date** : 14 juillet 2026
> **Version** : 1.0
> **Contexte** : Pré-commercialisation Phase 1. L'outil n'est pas encore commercialisable (MDR, RGPD, validation clinique en cours). L'objectif GTM est de **préparer le terrain** pour un lancement beta contrôlé en France début 2027, puis expansion USA.

---

## 🎯 Positionnement produit

### Une phrase

> **Functional Chef est le premier moteur AI qui transforme les biomarqueurs d'un patient en prescription culinaire tiercée EBM, destiné aux médecins fonctionnels et nutritionnels.**

### Promesse unique (UVP)

| Concurrent | Promesse | Lacune que Functional Chef comble |
|------------|----------|----------------------------------|
| **Zoe** | « Améliore ta santé en connaissant ta réponse aux aliments » | B2C uniquement. Pas de prescription médecin→patient. Pas d'EBM tiering |
| **Yuka** | « Scan tes produits et découvre leur impact santé » | Scoring alimentaire générique. Pas de personnalisation par biomarqueur |
| **InsideTracker** | « Optimise tes biomarqueurs sanguins » | Pas de prescription culinaire (juste des recommandations génériques) |
| **Function Health** | « 100+ lab tests + AI insights » | Pas de recette. Pas de culinaire. Pas de mode médecin |
| **ChatGPT / Claude** | « Donne-moi une recette pour X » | Pas de classification EBM. Pas de traçabilité. Hallucinations fréquentes |
| **Functional Chef** | **« Prescris des plats, pas des aliments. EBM-tiered, traceable, doctor-to-patient. »** | **Seul outil B2B qui combine : classification par bottleneck → sélection leviers tiered → composition culinaire → PDF prescriptible** |

### Marquage différenciant

```
Functional Chef =  EBM tiering explicite (T1/T2/T3)
                 + Architecture 50/20-30/20 brevetable
                 + B2B médecin→patient (pas B2C)
                 + Anti-hallucination (rules + LLM, pas LLM seul)
                 + PMIDs vérifiés (pas d'invention de référence)
```

---

## 🌍 Marchés cibles (priorité décroissante)

### Phase 1b (Beta — J+90 à J+180) : 🇫🇷 France

| Critère | Pourquoi la France en premier |
|---------|-------------------------------|
| **Réseau ZOI** | Connexion existante, cas cliniques réels disponibles, feedback rapide |
| **Régulation** | MDR européen = le même qu'en France — valider en France = valider pour l'UE |
| **Taille marché** | ~500 médecins fonctionnels + ~7 000 nutritionnistes/diététiciens = base raisonnable pour beta |
| **Coût GTM** | Inbound LinkedIn + bouche-à-oreille spécialisé : quasi gratuit |
| **Langue** | Contenu natif français, Rafik = docteur francophone, crédibilité immédiate |
| **Risque** | Marché plus petit mais validation plus rapide et moins chère |

### Phase 2b (J+180 à J+360) : 🇪🇺 Europe francophone + 🇬🇧 UK

| Pays | Médecins FM | Stratégie |
|------|------------|-----------|
| **Belgique** | ~200-300 | Même langue, conférences FM belges, pas d'effort supp. |
| **Suisse** | ~150-250 | Même langue, haut pouvoir d'achat, pricing premium possible |
| **UK** | ~1 000-2 000 | Traduction EN de l'interface, contenu inbound LinkedIn UK, UK reconnu Zoe (Bristol) |

### Phase 3 (J+360+) : 🇺🇸 USA

| Critère | Pourquoi attendre |
|---------|-------------------|
| **Marché** | Le plus gros (TAM ~$89M) mais le plus concurrentiel et réglementé |
| **FDA** | Régulation dispositif médical US (510(k) probablement requis) — coût >$50K |
| **Preuve clinique** | Les US exigent des RCTs ou études cliniques que la France n'exige pas en phase beta |
| **Go-to-market** | Un marché US nécessite un rep commercial sur place (conferences IFM, A4M, functional medicine clinics) |

---

## 👥 Personas cibles (hiérarchisés)

### Persona #1 — Le Médecin Fonctionnel French (priorité beta)

| Attribut | Valeur |
|----------|--------|
| **Titre** | Dr Rafik (lui-même) + 5-10 confrères du réseau ZOI |
| **Spécialité** | Médecine fonctionnelle, micronutrition, nutrition clinique |
| **Pratique** | Cabinet libéral, 15-30 patients/semaine, 50% avec volet nutritionnel |
| **Douleur** | « Je passe 20-30 min par consultation à concevoir un plan nutritionnel artisanal — je veux un outil qui me fasse gagner 15 min/patient avec une traçabilité médico-légale » |
| **Budget** | Prêt à payer 150-250 €/mois si l'outil lui fait gagner ≥5h/semaine |
| **Canal** | LinkedIn, groupes Telegram/WhatsApp FM, congrès (MEDEC, Salon de la Micronutrition) |

### Persona #2 — Le Diététicien-Nutritionniste (volume)

| Attribut | Valeur |
|----------|--------|
| **Titre** | Diététicien(ne) libéral ou en cabinet pluridisciplinaire |
| **Volume** | ~7 000 en France, plus nombreux que les médecins FM |
| **Douleur** | « Mes plans alimentaires sont artisanaux, je n'ai pas de traçabilité EBM, et je perds du temps à chercher des références » |
| **Budget** | Plus serré : 50-100 €/mois (mais bien plus nombreux) |
| **Canal** | AFDN, LinkedIn diététique, Instagram pro |

### Persona #3 — Le Médecin Intégratif US (scale)

| Attribut | Valeur |
|----------|--------|
| **Titre** | MD/DO with integrative or functional practice |
| **Volume** | ~30 000 (incluant non-IFM certifiés) |
| **Douleur** | Same as France but insurances start reimbursing nutrition counseling — need tool to scale |
| **Budget** | $200-400/mo — acceptable pour un outil qui améliore le revenu via prescriptions remboursées |
| **Canal** | IFM conference, A4M, podcast FM, direct outreach clinic by clinic |

---

## 📊 Stratégie GTM — Les 4 piliers

### Pilier 1 : Inbound Content-Led (coût quasi nul)

**Objectif** : Devenir la référence francophone sur la prescription nutritionnelle EBM-drivée.

| Canal | Action | Fréquence | KPI |
|-------|--------|-----------|-----|
| **LinkedIn (perso Rafik)** | Posts techniques : cas clinique, tier EBM du jour, mécanisme physiopathologique | 2-3 posts/sem | Engagement rate >5%, abonnés >500 en 3 mois |
| **Blog Functional Chef** | Articles longs : « Pourquoi le vinaigre pré-prandial est T1 et pas T2 », « Les 3 bottlenecks de la médecine fonctionnelle en cuisine » | 1 article/15j | Trafic landing page, conversion pré-inscription |
| **Groupes privés FM** | Telegram/WhatsApp : partage de cas, demande d'avis (ne pas vendre, participer) | 1-2 interactions/sem | Nombre de praticiens contactés en DM |
| **Newsletter** | « La Lettre du Chef » — 1 cas clinique décortiqué par mois | 1/mois | 50 inscrits en 3 mois |

### Pilier 2 : Partenariats & Alliances (coût = temps)

**Objectif** : Intégrer Functional Chef dans l'écosystème existant.

| Partenaire potentiel | Valeur pour Functional Chef | Valeur pour le partenaire | Action |
|----------------------|----------------------------|---------------------------|--------|
| **ZOI Analyse Patient** | Accès à 20+ patients beta, cas réels, validation clinique | Module nutritionnel pluggable sans développement | Proposition de partenariat (LIV-57) |
| **Laboratoires d'analyses (Cerba, Biogroup, Inovie)** | Canal de distribution vers 10 000+ médecins prescripteurs | Valeur ajoutée à leur bilan biologique : « avec ce bilan, votre patient reçoit une prescription culinaire personnalisée » | À envisager en Phase 2 |
| **Écoles de nutrition fonctionnelle (DIU de Nutrition, DU de Micronutrition)** | Prescripteurs en formation, adoption précoce | Outil pédagogique pour les étudiants | Dossier de démonstration |
| **Associations (AFDN, SFMN, SNMF)** | Crédibilité institutionnelle, canal de communication | Contenu gratuit pour leurs membres | Webinar gratuit |

### Pilier 3 : Pré-inscription Beta (conversion)

**Objectif** : Constituer une file d'attente de praticiens prêts à tester.

| Canal | Message | CTA | Mécanique |
|-------|---------|-----|-----------|
| **Landing page** | « Prescrivez des plats, pas des aliments. Functional Chef transforme les biomarqueurs en prescriptions culinaires EBM-tiered. Beta 2027. » | « Je m'inscris à la beta praticien » | Formulaire : nom, email, spécialité, nb patients/sem, chaîne YouTube/liste d'attente publique |
| **LinkedIn post** | Cas clinique du jour + « Vous voulez tester le moteur ? Beta limitée à 20 praticiens. » | Lien vers landing page | Early adopters = statut, pas de remise (ils paieront le même prix) |
| **DM personnalisé** | Rafik contacte 10 confrères direct : « Je construis un outil pour nous. Teste-le et dis-moi ce qui claque/ce qui cloche. » | Call 15 min de démo | Feedback qualitatif |

### Pilier 4 : Démo Interactive (preuve sans friction)

**Objectif** : Un médecin visite la landing, clique, et voit le moteur tourner — sans créer de compte, sans donner ses emails.

| Fonctionnalité | Description | Impact GTM |
|----------------|-------------|------------|
| **Démo avec 3 cas préchargés** (Cas A/B/C de la spec) | Input patient → bouton "Classifier" → classification + leviers + plat | Un médecin voit la puissance en 30 secondes |
| **Aucune auth requise** | Zéro friction — pas de "créez un compte pour voir" | Taux de conversion landing→démo cible >40% |
| **Baseline des concurrents** | Afficher "Zoe vous donne un score. Functional Chef vous donne un plat prescriptible avec EBM tiering." | Différenciation immédiate |

---

## 📈 KPIs Phase 1 (GTM)

| KPI | Cible J+90 | Cible J+180 | Commentaire |
|-----|-----------|------------|-------------|
| **Pré-inscriptions beta praticiens** | 5 | 20 | Médecins + diététiciens |
| **Médecins early adopters (démo call fait)** | 3 | 10 | Engagement qualitatif |
| **Abonnés LinkedIn (Rafik)** | 500 | 2 000 | Croissance organique |
| **Articles de blog publiés** | 3 | 8 | Contenu technique long |
| **Newsletter abonnés** | 50 | 200 | Taux d'ouverture >40% |
| **Partenariats signés** | 1 (ZOI) | 3 | ZOI + école + assoc |
| **Démo interactive en ligne** | ✅ | ✅ | Fonctionnelle, déployée |
| **Coût GTM cumulé** | <500 € | <1 000 € | Hébergement + noms de domaine uniquement |

---

## 💰 Pricing recommandé (Phase 2, post-validation)

### Modèle : Freemium médical

| Tier | Prix | Fonctionnalités | Cible |
|------|------|----------------|-------|
| **Free** (découverte) | 0 € | Classifier seulement (3 cas préchargés), pas de composition, pas de export | Prospects en démo |
| **Starter** (individuel) | **149 €/mois** | Classifier + composer illimité, 1 praticien, dashboard, PDF export | Diététiciens, nutritionnistes |
| **Pro** (cabinet) | **249 €/mois** | Starter + patient management, validation médecin, audit trail, 3 praticiens max | Médecins FM libéraux |
| **Enterprise** (clinique) | **Sur devis** (1 000-5 000 €/mois) | Multi-praticiens illimité, API, white-label, custom protocol lib, SLA | Grosses cliniques FM, réseaux |

### Justification du pricing

- **Zoe** = $348/an en B2C. Un outil B2B qui fait gagner 15 min/consultation × 20 patients/sem = 5h/mois. À 100 €/h de temps médecin = 500 €/mois de valeur. À 149-249 €/mois, le ROI est immédiat.
- **InsideTracker for Professionals** = ~$200-300/mo (estimé)
- **Prix français** : un diététicien facture 50-70 €/consultation. 5 consultations supplémentaires suffisent à couvrir l'abonnement.

---

## 🗺️ Roadmap GTM dans le temps

```
Phase 1b — Pré-lancement (J+0 à J+90)     Phase 2b — Beta contrôlée (J+90 à J+270)     Phase 3 — Scale
──────────────────────────────────────     ────────────────────────────────────────     ──────────────
✅ Landing page + démo interactive         🔄 20 praticiens beta                       🔄 USA
✅ Linkedin inbound commencé               🔄 Feedback itératif                        🔄 Pricing US
✅ Pré-inscriptions (5+)                   🔄 Ajout auth + RLS + PDF                   🔄 FDA 510(k)
✅ Partenariat ZOI en cours                🔄 10 cas cliniques validés                 🔄 SaaS US launch
✅ Contenu blog fondateur                  🔄 Pricing testé sur beta
                                           🔄 Assurance souscrite
                                           🔄 MDR clarifié
```

---

## ⚠️ Risques GTM et mitigation

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|------------|
| **Marché français trop petit** (500 FM) | Élevée | Élevé | Adresser diététiciens (7 000) dès la beta + UK en Phase 2 |
| **Médecins réticents à payer pour un outil AI** | Moyenne | Élevé | Prouver le ROI : timer les 15 min économisées par consultation pendant la beta |
| **Concurrent arrive avant nous** (Zoe B2B, Function Health Doctor) | Faible | Élevé | Zoe a 7 ans d'avance mais pas de version B2B. Function Health est B2C. La fenêtre est ouverte 12-18 mois |
| **Régulation MDR bloque le lancement** | Moyenne | Très élevé | Démarrer l'audit MDR immédiatement. Si class IIa, la beta est possible sous contrôle |
| **Difficulté à recruter des early adopters** | Moyenne | Moyen | Rafik utilise son réseau ZOI et personnel. Un call de démo personnalisé par prospect |

---

## ✅ Premières actions GTM (cette semaine)

- [ ] **LIV-50** : Créer la landing page (Next.js, Vercel, functionalchef.com ou sous-domaine)
- [ ] **LIV-51** : Formulaire pré-inscription beta
- [ ] **LIV-52** : Démo interactive avec 3 cas préchargés
- [ ] **LinkedIn** : 1er post technique (ex: « Pourquoi l'EVOO est T1 pour l'IR mais T2 pour la dysbiose »)
- [ ] **DM** : Rafik contacte 3 confrères pour un call démo informel
- [ ] **LIV-57** : Rédiger la proposition de partenariat ZOI

---

> **Prochaines étapes immédiates suggérées** :
> 1. ✅ Roadmap mise à jour
> 2. ✅ GMT strategy rédigée
> 3. 🔜 Commencer les livrables techniques (tests, PMIDs, landing page) — 100% IA, 0€
