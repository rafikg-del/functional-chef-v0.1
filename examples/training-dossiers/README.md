# Dossiers patients d'entraînement — exemples

Chaque sous-dossier = un patient. Fichier obligatoire : `profile.json`.

## Structure

```
mes-cohorte/
├── patient-001/
│   └── profile.json
├── patient-002/
│   └── profile.json
└── patient-003/
    └── profile.json
```

## Format profile.json

| Champ | Obligatoire | Description |
|-------|-------------|-------------|
| `biomarker_values` | oui* | Biomarqueurs numériques (`HOMA_IR`, `CRP_US`, …) |
| `clinical_signals` | oui* | Signaux cliniques (`BRISTOL_SCORE`, `BLOATING_FREQ`, …) |
| `expected_dominant` | non | `IR`, `INFLAM` ou `DYSBIOSE` — vérité terrain pour mesurer la précision |
| `intent` | non | Intent clinique (pour futur export composer) |
| `age`, `sex` | non | Démographie |
| `exclusions`, `context` | non | Contraintes patient |

\* Au moins l'un des deux doit être renseigné.

## Import

1. Aller sur `/training`
2. **Dossiers (multi)** — sélectionner le dossier parent contenant les sous-dossiers patients
3. Ou **Archive ZIP** — zipper la cohorte
4. **Lancer l'entraînement** — classification batch
5. **Exporter JSONL** — dataset pour fine-tuning / évaluation

## Exemples fournis

Les dossiers `patient-001` à `patient-003` reprennent les cas-pivot A/B/C du README.
