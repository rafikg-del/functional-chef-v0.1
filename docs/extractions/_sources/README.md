# Sources PDF — extraction bottleneck

Dépose ici tes PDF (livres, études, méta-analyses) avant extraction.

## Workflow rapide

### 1. Déposer le PDF

Copie ou glisse ton fichier ici, par exemple :

```
docs/extractions/_sources/charge-allostatique-ch7.pdf
docs/extractions/_sources/smith-2023-meta-analysis.pdf
```

Les `.pdf` ne sont **pas versionnés** (`.gitignore`) — droits d'auteur + taille.

### 2. Lancer l'extraction de texte (optionnel mais recommandé pour gros PDF)

```bash
# PDF entier → fichier .extracted.md paginé
npm run pdf:extract -- docs/extractions/_sources/mon-livre.pdf

# Pages ciblées seulement
npm run pdf:extract -- docs/extractions/_sources/mon-livre.pdf --from 142 --to 198
```

Produit : `mon-livre.extracted.md` (marqueurs `[p.N]` par page).

### 3. Lancer le sous-agent

Dans **Agent** (discussion séparée si tu veux) :

```
/bottleneck-extraction

Bottleneck : Charge allostatique (ALLO)
Source : docs/extractions/_sources/mon-livre.pdf
Pages : 142-198
```

Le sous-agent peut :
- lire le PDF directement s'il est dans le workspace, ou
- utiliser le `.extracted.md` déjà généré.

### Alternative — coller / glisser dans Cursor

| Méthode | Comment |
|---|---|
| **Glisser-déposer** | PDF dans le chat Agent → Cursor lit le fichier nativement |
| **@ fichier** | `@docs/extractions/_sources/etude.pdf` dans le prompt |
| **Side chat** | `/side` puis attacher le PDF pour ne pas saturer le fil principal |

Pour les **études scientifiques** courtes (≤30 p.), le glisser-déposer suffit souvent.
Pour un **livre entier**, préfère `npm run pdf:extract` + pages ciblées.

## Limites

- PDF **scannés** (image seule) : texte non extractible → OCR externe requis (Adobe, OCRmyPDF).
- **Tableaux / figures** : le texte brut peut perdre la structure ; noter les gaps dans le rapport d'extraction.
- **PMID** : pour les études, le sous-agent doit croiser avec PubMed si le PDF ne cite pas clairement les références.
