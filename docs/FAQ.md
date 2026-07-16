# FAQ — Functional Chef

> **Document** : LIV-68 — FAQ juridique et médicale
> **Version** : v1.0 — 14 juillet 2026
> **Relecture recommandée** : Avocat spécialisé RGPD + Comité scientifique

---

## 1. Questions médicales

### Q1. Functional Chef est-il un dispositif médical ?

Functional Chef interprète des biomarqueurs et génère des prescriptions culinaires personnalisées. Selon le Règlement (UE) 2017/745 (MDR), il est probablement classé **Classe IIa** (Règle 11 — logiciel fournissant des informations utilisées pour des décisions thérapeutiques). Le dossier technique MDR est en cours de finalisation et sera soumis à un organisme notifié pour confirmation.

**En attendant la certification** : l'outil est utilisé sous la responsabilité du praticien, qui valide médicalement chaque sortie avant transmission au patient.

### Q2. Un médecin peut-il être poursuivi pour avoir utilisé Functional Chef ?

Comme pour tout outil d'aide à la décision médicale, la **responsabilité finale incombe au praticien**. Functional Chef est un outil d'aide, pas un substitut au jugement clinique. La validation horodatée et signée dans le système constitue une trace médico-légale.

**Recommandation** : Conservez une trace de votre validation (le PDF exporté avec l'empreinte numérique fait foi).

### Q3. Les tiers EBM sont-ils fiables ?

Chaque levier porte un tier EBM-F basé sur des références PubMed vérifiées :
- **T1** : ≥1 méta-analyse de RCT humains
- **T2** : RCT modeste ou cohorte solide
- **T3** : Mécanistique ou observationnel

Un audit indépendant des PMIDs a été réalisé en juillet 2026 (30 PMIDs vérifiés, 18 corrigés). Le comité scientifique valide les tiers avant mise en production.

### Q4. Que faire en cas de divergence avec mon jugement clinique ?

Le jugement clinique prime toujours. Functional Chef est un outil d'aide :
1. Vérifiez les biomarqueurs saisis
2. Consultez la rationale détaillée du moteur (evidence array)
3. Ajustez manuellement si nécessaire
4. Signalez toute divergence au comité scientifique pour amélioration du modèle

### Q5. Puis-je utiliser Functional Chef pour des patients diabétiques sous insuline ?

Oui, avec les précautions suivantes :
- Les leviers « restriction glucidique modérée » (L_LOW_CARB_MODERATE) et « temps de repas restrictif » (L_MEAL_TIMING_12H) sont contre-indiqués en cas de diabète de type 1 non supervisé
- Un avertissement est affiché : « Surveillance hypoglycémie si sulfamides/insuline »
- La validation médicale par le praticien est obligatoire

### Q6. Fonctionne-t-il pour les enfants ?

Non. Functional Chef n'a pas été testé ni validé pour une population pédiatrique. L'âge du patient est un champ obligatoire, mais aucun ajustement pédiatrique n'est implémenté.

### Q7. Quelle est la différence avec Zoe, Yuka, Foodvisor ?

| Outil | Public | Type | EBM tiering | Prescription |
|-------|--------|------|-------------|--------------|
| **Zoe** | B2C | Score réponse glycémique | Non | Recommandations |
| **Yuka** | B2C | Score alimentaire | Non | Notation produit |
| **Foodvisor** | B2C | Tracking photo | Non | Conseils |
| **Functional Chef** | **B2B** | **Prescription culinaire** | **Oui (T1/T2/T3)** | **Plat complet** |

---

## 2. Questions juridiques et réglementaires

### Q8. Functional Chef est-il conforme au RGPD ?

Oui, les mesures suivantes sont implémentées :
- **Consentement explicite** du patient avant traitement des données de santé (Art. 7)
- **Minimisation** : seules les données strictement nécessaires sont collectées
- **RLS** : isolation totale entre praticiens (Art. 32)
- **Droit à l'effacement** : possibilité de supprimer toutes les données (Art. 17)
- **Portabilité** : export possible (Art. 20)
- **Registre** des activités de traitement

### Q9. Où sont hébergées les données ?

- **Base de données** : Supabase (PostgreSQL) — hébergement Union Européenne
- **Chiffrement** : AES-256 au repos, TLS 1.3 en transit
- **Backup** : Sauvegarde automatique quotidienne

### Q10. Les données sont-elles transmises aux États-Unis (appels LLM) ?

Oui, les appels à l'API Anthropic/OpenAI peuvent transiter par des serveurs situés aux États-Unis. Les données transmises sont :
- **Pseudonymisées** : aucun nom, prénom, email ou adresse
- **Biomarqueurs uniquement** : valeurs numériques (ex : HOMA-IR = 2.1)
- **Encadrées par CCT** : clauses contractuelles types de la Commission européenne

### Q11. Quelle est la durée de conservation des données ?

| Type de données | Durée | Justification |
|----------------|-------|---------------|
| Consultations | 3 ans | Suivi clinique |
| Profils patients | 5 ans | Historique |
| Audit trail | 10 ans | Obligation médico-légale |
| Compte praticien | Jusqu'à suppression | Droit à l'oubli |

### Q12. Un patient peut-il demander la suppression de ses données ?

Oui. Le praticien peut :
1. Supprimer le profil patient (données pseudonymisées conservées pour l'audit)
2. Exercer le droit à l'effacement complet via la fonction `delete_patient_data()`
3. Exporter les données avant suppression (format JSON)

### Q13. Functional Chef est-il assuré ?

Une assurance responsabilité civile professionnelle et cyber sera souscrite avant l'ouverture de la beta clinique (Phase 2). En phase de développement actuelle, l'outil est utilisé sous la responsabilité exclusive du praticien.

---

## 3. Questions techniques

### Q14. Ai-je besoin d'une clé API Anthropic/OpenAI ?

- **Démo interactive** : non, la classification fonctionne à 100% côté client
- **Version complète** : oui, pour la composition du plat (étape 4)
- **Provider** : Anthropic (Claude Sonnet 4 par défaut) ou OpenAI (GPT-4o-mini)

### Q15. Puis-je utiliser un modèle différent ?

Oui. Le code supporte plusieurs providers. Vous pouvez configurer via les variables d'environnement :
- `ANTHROPIC_API_KEY` (Claude)
- `OPENAI_API_KEY` (GPT)
- Utiliser OpenRouter pour un accès unifié à tous les modèles

### Q16. Functional Chef fonctionne-t-il hors-ligne ?

Partiellement. Le moteur de classification (étapes 1-3) est 100% TypeScript et fonctionne hors-ligne. La composition du plat (étape 4) nécessite une connexion internet pour l'appel LLM.

### Q17. Comment les données sont-elles protégées lors des appels API ?

1. Les données sont transmises en HTTPS (TLS 1.3)
2. Aucun identifiant patient direct n'est inclus
3. Les prompts sont anonymisés avant envoi
4. Aucune donnée n'est stockée par le fournisseur LLM (politique de non-conservation)

### Q18. Puis-je auto-héberger Functional Chef ?

Oui, le code est open-source (licence privée). Vous pouvez :
1. Cloner le dépôt GitHub
2. Configurer votre propre instance Supabase
3. Déployer sur Vercel ou tout autre hébergeur Node.js
4. Configurer vos propres clés API LLM

---

## 4. Questions commerciales

### Q19. Quel est le prix de Functional Chef ?

En phase beta (2027) : **gratuit** pour les 20 premiers praticiens en échange de leur feedback.

Pricing cible post-beta :
| Tier | Prix | Public |
|------|------|--------|
| Starter | 149 €/mois | Diététiciens, nutritionnistes |
| Pro | 249 €/mois | Médecins FM libéraux |
| Enterprise | Sur devis | Cliniques, réseaux |

### Q20. Y a-t-il des réductions pour les cabinets ?

Oui. Le tarif Enterprise est dégressif selon le nombre de praticiens dans la structure. Contactez support@functional-chef.app.

### Q21. Combien de consultations puis-je faire par mois ?

Illimité. Le coût variable est celui des appels LLM :
- Claude Sonnet 4 : ~0.03 €/consultation
- GPT-4o-mini : ~0.002 €/consultation

Pour 100 consultations/mois avec GPT-4o-mini : **~0.20 €/mois**.

---

## 5. Questions sur les données de santé

### Q22. Quelles données de santé sont traitées ?

**Données collectées** :
- Biomarqueurs sanguins (HOMA-IR, CRP-us, etc.)
- Signaux cliniques (Bristol stool scale, fréquence ballonnements)
- Âge, sexe
- Allergies, régimes, conditions médicales déclarées

**Données NON collectées** :
- Nom, prénom, adresse du patient
- Numéro de sécurité sociale
- Photos, documents d'identité
- Antécédents médicaux complets
- Traitements médicamenteux détaillés (hors anticoagulants et allergies déclarées)

### Q23. Le patient doit-il donner son consentement ?

Oui. Le consentement explicite du patient est requis avant toute utilisation (conforme à l'Article 9.2.a du RGPD pour les données de santé). Le praticien s'engage à recueillir ce consentement.

### Q24. Les données sont-elles réutilisées pour entraîner des modèles ?

Non. Aucune donnée patient n'est utilisée pour l'entraînement de modèles. Les appels LLM sont anonymisés et la politique d'Anthropic/OpenAI exclut l'utilisation des données API pour l'entraînement.

---

> **Document révisé le** : 14 juillet 2026  
> **Version** : v1.0  
> **Prochaine révision** : 14 janvier 2027  
> **Contact** : support@functional-chef.app
