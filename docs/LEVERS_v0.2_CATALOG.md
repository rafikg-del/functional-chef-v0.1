# Catalogue des 35 nouveaux leviers — Référentiel v0.2

> **Document** : LIV-47 — Spécification avant implémentation
> **Date** : 14 juillet 2026
> **Cible** : 60 leviers totaux (25 existants + 35 nouveaux)

---

## Principes de sélection

Chaque nouveau levier doit satisfaire ces critères :
1. **Mécanisme physiopathologique identifiable** (pas de recette de grand-mère sans support)
2. **Au moins 1 référence pivot** (PMID si possible, sinon référence éditoriale qualifiée)
3. **Applicable en contexte culinaire** (pas un supplément, pas une molécule isolée)
4. **Catégorie équilibrée** : éviter 5 nouveaux leviers "ingrédient" sans aucun "timing"
5. **Bottleneck coverage** : chaque levier sert ≥1 bottleneck

---

## Structure d'une entrée

```
ID           : L_{NOM_COURT}
Nom FR       : « ... »
Catégorie    : ingredient | preparation | cooking | timing | sequence | fermentation | dose | avoidance
Tier global  : T1 | T2 | T3
Référence    : Auteur Année + contexte
PMID(s)      : [...]
Mécanisme    : 1 phrase
Dose/protocole : Description concise
Cuisine/T°   : Si pertinent
Contre-indications : [...]
Précautions  : [...]
Universal star ? : true | false
Mapping bottleneck → tier → priorité :
  - BOTTLENECK_X : T1 | T2 | T3, priority N
```

---

## Nouveaux leviers

---

### Domaine IR (insulinorésistance)

#### 1. L_CINNAMON_POLYPHENOLS
- **Nom** : Cannelle (Ceylan) 1-3 g/jour avec repas glucidique
- **Catégorie** : ingredient
- **Tier** : T1
- **Réf** : Allen 2013 méta (PMID 23818067) ; Davis 2017 méta (PMID 28011956)
- **Mécanisme** : ↓ résistance insulinique via ↑ phosphorylation IRS-1/PI3K ; ↓ absorption intestinale glucose ; effet antioxydant
- **Dose** : 1-3 g/j (½-1 c.c. cannelle Ceylan) saupoudré sur glucides complexes, compote, yaourt
- **CI** : grossesse (cinnamaldéhyde haute dose), hépatopathie sévère (composés coumariniques — préférer Ceylan)
- **Précautions** : Cassia (cannelle chinoise) contient des coumarines (hépatotoxique à haute dose quotidienne). Préférer Ceylan (Cinnamomum verum) pour usage chronique
- **Star** : false
- **IR** : T1, priority 5

#### 2. L_FENUGREEK_SEEDS
- **Nom** : Fenugrec (graines trempées ou germées)
- **Catégorie** : ingredient
- **Tier** : T1 | T2
- **Réf** : Soodi 2024 méta ; Neelakantan 2014 (PMID 25006949) — méta RCT
- **Mécanisme** : Galactomannan (fibre solubre) ralentit vidange gastrique ; 4-hydroxyisoleucine stimule sécrétion insuline glucose-dépendante
- **Dose** : 2-5 g/j graines trempées 12h, germées ou torréfiées en poudre
- **CI** : Diabète T1 non supervisé (risque hypoglycémie), grossesse (effet oxtocique à haute dose)
- **Précautions** : Goût amer — masquer dans curry, dhal, smoothie
- **Star** : false
- **IR** : T1, priority 6

#### 3. L_CHIA_SEEDS
- **Nom** : Graines de chia (Salvia hispanica)
- **Catégorie** : ingredient
- **Tier** : T2
- **Réf** : Vuksan 2017 (PMID 28272120) ; Toscano 2015 méta
- **Mécanisme** : Fibre solubre (mucilage) → gel visqueux → ↓ vidange gastrique ; ALA ω-3 → modulation inflammation bas grade ; protéines + minéraux
- **Dose** : 15-30 g/j (2-3 c.s.), trempées 15-30 min dans eau/lait végétal avant consommation
- **CI** : Dysphagie sévère (risque d'obstruction si non trempé)
- **Précautions** : Introduire progressivement pour tolérance digestive
- **Star** : false
- **IR** : T1, priority 20 ; INFLAM : T2, priority 30

#### 4. L_AVOCADO_DAILY
- **Nom** : Avocat ½-1/jour
- **Catégorie** : ingredient
- **Tier** : T2
- **Réf** : Petersen 2021 (PMID 34617419) — Habitual avocado consumption ; Mahmassani 2018 méta (PMID 29659968)
- **Mécanisme** : MUFA + fibres solubles + polyphénols ; ↓ LDL-ox, ↓ inflammation bas grade ; ↑ satiété postprandiale
- **Dose** : ½-1 avocat/j (70-150g), en salade, tartine, smoothie
- **CI** : Aucune
- **Précautions** : Apport calorique à intégrer (½ avocat ≈ 120 kcal)
- **Star** : false
- **IR** : T1, priority 22 ; INFLAM : T2, priority 25

#### 5. L_NUTS_MIX_30G
- **Nom** : Oléagineux mix 30 g/j (noix, amandes, noisettes)
- **Catégorie** : ingredient
- **Tier** : T1
- **Réf** : Afshin 2014 méta (PMID 25411245) ; Salas-Salvadó 2008 PREDIMED nuts (PMID 18784301)
- **Mécanisme** : MUFA + ω-3 ALA + arginine + fibres + polyphénols ; ↓ LDL, ↓ inflammation, ↑ satiété, ↓ HbA1c
- **Dose** : 30 g/j (1 petite poignée) mix : 3-4 noix + 8-10 amandes + 8-10 noisettes
- **CI** : Allergie nuts
- **Précautions** : Préférer crus (non salés, non torréfiés à haute T°)
- **Star** : true
- **IR** : T1, priority 12 ; INFLAM : T1, priority 15 ; DYSBIOSE : T2, priority 25

#### 6. L_DARK_CHOCOLATE_20G
- **Nom** : Chocolat noir ≥85% cacao, 20 g/j
- **Catégorie** : ingredient
- **Tier** : T2
- **Réf** : Grassi 2005 (PMID 15883455) ; Hooper 2012 méta flavanols (PMID 22869837)
- **Mécanisme** : Flavanols (épicatéchine) → ↑ NO → ↑ sensibilité insulinique + ↓ PA ; polyphénols → modulation microbiote
- **Dose** : 20 g/j (2 carrés), chocolat noir ≥85% cacao, faible sucre
- **CI** : Aucune en dose modérée. Lithiase oxalique à modérer
- **Précautions** : Choix qualité important (cacao fort, faible sucre). Pas de chocolat au lait ou blanc
- **Star** : false
- **IR** : T2, priority 30 ; INFLAM : T2, priority 25 ; DYSBIOSE : T2, priority 30

#### 7. L_PROTEIN_DISTRIBUTION
- **Nom** : Distribution protéines 20-30g/repas (3-4 repas)
- **Catégorie** : timing
- **Tier** : T2
- **Réf** : Mamerow 2014 (PMID 24760976) ; Schoenfeld 2018 méta (PMID 29863639)
- **Mécanisme** : Distribution équilibrée des protéines sur la journée → ↑ GLP-1, ↑ satiété, ↑ thermogenèse alimentaire, maintien masse maigre
- **Dose** : 20-30g protéines à chaque repas (petit-déjeuner, déjeuner, dîner), dont 1 source animale ou 2 végétales combinées
- **CI** : Insuffisance rénale sévère : modérer charge protéique (avis néphrologue)
- **Précautions** : Adapter si pathologie rénale
- **Star** : false
- **IR** : T2, priority 3 ; INFLAM : T2, priority 35

#### 8. L_LOW_GI_MEAL_PATTERN
- **Nom** : Composition de repas à faible IG (pattern global)
- **Catégorie** : preparation
- **Tier** : T1
- **Réf** : Jenkins 1981 (PMID 6117467) ; Livesey 2019 méta (PMID 30983560)
- **Mécanisme** : Association glucides complexes + fibres + protéines + lipides → ↓ IG composite du repas ; ↓ pic glucose + insuline
- **Dose** : Chaque repas glucidique associé à ≥1 source fibre + ≥1 source protéine + ≥1 source lipide. Éviter glucides seuls.
- **CI** : Aucune
- **Précautions** : Ne pas transformer en orthorexie
- **Star** : false
- **IR** : T1, priority 4

---

### Domaine INFLAM (inflammaging)

#### 9. L_GINGER_FRESH
- **Nom** : Gingembre frais 5-10 g/jour
- **Catégorie** : ingredient
- **Tier** : T2
- **Réf** : Mashhadi 2013 (PMID 23515042) ; Marx 2021 méta (PMID 33848235)
- **Mécanisme** : Gingerols et shogaols → ↓ NF-κB, ↓ TNF-α, ↓ CRP ; effet antioxydant ; modulation écosystème oral/gut
- **Dose** : 5-10 g/j gingembre frais râpé dans thé, sauté, soupe, jus
- **CI** : Anticoagulants haute dose (prudence — effet antiplaquettaire modeste)
- **Précautions** : Éviter poudre de gingembre concentrée à haute dose en pré-opératoire
- **Star** : false
- **INFLAM** : T2, priority 15 ; DYSBIOSE : T3, priority 40

#### 10. L_GARLIC_RAW
- **Nom** : Ail cru écrasé 1-3 gousses/jour
- **Catégorie** : ingredient
- **Tier** : T2
- **Réf** : Ried 2016 méta (PMID 27015631) ; Schwingshackl 2020 (PMID 32672667)
- **Mécanisme** : Allicine libérée par écrasement → ↓ CRP, ↓ TNF-α, ↓ pression artérielle ; prébiotique inuline-like
- **Dose** : 1-3 gousses/j, écrasées ou hachées, laisser reposer 10 min avant cuisson pour activation alliinase
- **CI** : Anticoagulants haute dose (prudence), pré-opératoire 14j (modérer)
- **Précautions** : Ne pas faire bouillir immédiatement — laisser reposer après écrasement pour stabiliser allicine
- **Star** : false
- **INFLAM** : T2, priority 20 ; DYSBIOSE : T2, priority 25 ; IR : T3, priority 45

#### 11. L_POMEGRANATE_JUICE_WEEKLY
- **Nom** : Grenade (fruit frais ou jus 100%) 150 ml, 3-4×/sem
- **Catégorie** : ingredient
- **Tier** : T2
- **Réf** : Sahebkar 2016 méta (PMID 26412200) ; Banihani 2017 (PMID 28361407)
- **Mécanisme** : Ellagitannins → urolithines (métabolites microbiens) → ↓ CRP, ↓ IL-6, ↓ oxLDL, ↑ NO
- **Dose** : 150 ml jus 100% pur grenade (sans sucre ajouté), 3-4×/sem OU ½ fruit frais
- **CI** : Interactions CYP (prudence si statines, anticoagulants — faible risque)
- **Précautions** : Jus commercial souvent sucré — vérifier étiquette. Préférer fruit frais ou jus pur
- **Star** : false
- **INFLAM** : T2, priority 18 ; IR : T3, priority 50 ; DYSBIOSE : T3, priority 40

#### 12. L_TART_CHERRY
- **Nom** : Cerise acidulée (griotte) 200 ml jus ou 200g fruits, 3×/sem
- **Catégorie** : ingredient
- **Tier** : T2
- **Réf** : Kelley 2018 méta (PMID 29685686) ; Howatson 2010 RCT (PMID 19855314)
- **Mécanisme** : Anthocyanines → ↓ CRP, ↓ IL-6, ↓ uricémie (effet inhibiteur xanthine oxydase) ; mélatonine naturelle
- **Dose** : 200 ml jus pur (sans sucre ajouté) ou 200g fruits, 3-4×/sem, de préférence en fin de journée (apport mélatonine)
- **CI** : Aucune
- **Précautions** : Teneur en sucre (≈20g/200ml) — adapter si IR sévère. Préférer version fruits entiers pour fibres
- **Star** : false
- **INFLAM** : T2, priority 20 ; IR : T2, priority 35

#### 13. L_COFFEE_FILTER
- **Nom** : Café filtre 2-3 tasses/jour (non sucré)
- **Catégorie** : ingredient
- **Tier** : T2 (épidémiologique solide)
- **Réf** : Grosso 2016 méta (PMID 27619280) ; Poole 2017 BMJ méta (PMID 28649191)
- **Mécanisme** : Acides chlorogéniques → ↓ pic glucose, modulation microbiote (↑ Bifidobactéries), ↓ CRP bas bruit de fond ; café diterpènes (cafestol) filtrés par le papier
- **Dose** : 2-3 tasses/j (240 ml), non sucré, filtre obligatoire. Éviter après 14h pour sommeil
- **CI** : Reflux gastro-œsophagien actif, anxiété sévère, grossesse limiter <200mg caféine/j
- **Précautions** : Café non filtré (presse française, turc) ↑ LDL via cafestol. Préférer filtre papier
- **Star** : true
- **INFLAM** : T2, priority 20 ; IR : T2, priority 15 ; DYSBIOSE : T2, priority 20

#### 14. L_VITAMIN_D_FOODS
- **Nom** : Aliments riches en vitamine D (poisson gras, œuf, champignons UV)
- **Catégorie** : ingredient
- **Tier** : T2
- **Réf** : Martineau 2017 méta (PMID 28202713) ; Autier 2014 méta (PMID 24494050)
- **Mécanisme** : Le récepteur VDR exprimé sur les cellules immunitaires ; ↓ cytokines pro-inflammatoires ; modulation axe immunitaire
- **Dose** : 2-3×/sem : saumon/sardine (150g) + œuf (×2) + champignons exposés UV
- **CI** : Pathologie granulomateuse (sarcoïdose — modérer)
- **Précautions** : L'alimentation seule ne suffit pas si carence franche (supplémentation requise)
- **Star** : false
- **INFLAM** : T2, priority 22 ; IR : T2, priority 40 ; DYSBIOSE : T3, priority 45

#### 15. L_ROSEMARY_HERBS
- **Nom** : Herbes aromatiques quotidiennes (romarin, origan, thym, menthe)
- **Catégorie** : ingredient
- **Tier** : T3
- **Réf** : Nieto 2018 (PMID 30154330) ; Pérez-Fons 2010 (PMID 20646482)
- **Mécanisme** : Acide rosmarinique, carnosol, carvacrol, thymol → ↑ Nrf2, ↓ NF-κB, pouvoir antioxydant élevé (ORAC >1000/100g)
- **Dose** : Incorporer ≥3 herbes différentes/j dans cuisson ou crues. Quantité libre (1-2 c.c. séchées ou 2-3 branches fraîches)
- **CI** : Aucune (dose culinaire)
- **Précautions** : Huiles essentielles concentrées (≠ herbes fraîches/séchées) — CI grossesse, hypertension sévère
- **Star** : false
- **INFLAM** : T2, priority 25 ; DYSBIOSE : T3, priority 35

#### 16. L_MEDITERRANEAN_WEEKLY_MEAL
- **Nom** : Poisson gras 2×/sem + 1 jour sans viande (pattern)
- **Catégorie** : timing
- **Tier** : T2
- **Réf** : Martinez-Gonzalez 2019 PREDIMED-Plus (PMID 30924793)
- **Mécanisme** : Substitution protéines animales terrestres → marines + végétales réduit charge pro-inflammatoire (AGE, TMAO, fer héminique) + ↑ EPA/DHA
- **Dose** : 2×/sem poisson gras + 1-2 jours sans viande (lundi vert, poisson vendredi)
- **CI** : Allergie poisson — adapter avec algues Schizochytrium (DHA)
- **Précautions** : Petits poissons (sardine, maquereau) évitent accumulation Hg
- **Star** : false
- **INFLAM** : T1, priority 8 ; IR : T2, priority 22

#### 17. L_FRUIT_2_DAY
- **Nom** : Fruits entiers 2-3 portions/jour (pas de jus)
- **Catégorie** : ingredient
- **Tier** : T1
- **Réf** : Aune 2017 méta BMJ (PMID 28244348) ; Muraki 2013 (PMID 23843730)
- **Mécanisme** : Polyphénols + fibres + vitamines + potassium; relation inverse dose-dépendante avec mortalité CV et CRP
- **Dose** : 2-3 portions/j (1 portion ≈ 150g), entiers (pas jus), varier les couleurs. Privilégier fruits à faible charge glycémique (baies, kiwi, agrumes, pomme)
- **CI** : Aucune
- **Précautions** : Jus de fruit = pas un fruit (perte fibres, pic glycémique). Fruits secs (dattes, raisins) = portion plus petite (30g)
- **Star** : false
- **INFLAM** : T1, priority 12 ; IR : T2, priority 25 ; DYSBIOSE : T2, priority 25

---

### Domaine DYSBIOSE (dysbiose intestinale)

#### 18. L_PSYLLIUM_FIBER
- **Nom** : Psyllium (ispaghula) 5-10 g/jour
- **Catégorie** : ingredient
- **Tier** : T1
- **Réf** : McRorie 2015 (PMID 26231922) ; Lambeau 2017 méta (PMID 28675898)
- **Mécanisme** : Fibre solubre visqueuse non-fermentescible → régularisation transit (≃ Bristol 3-5), ↓ LDL, ↑ butyrate (fermentation lente)
- **Dose** : 5-10 g/j (1-2 c.s.), dilué dans >250 ml eau, à distance des médicaments
- **CI** : Occlusion intestinale, sténose œsophagienne, déglutition difficile (risque d'obstruction)
- **Précautions** : Hydratation obligatoire. Espacer des médicaments de ≥2h (ralentit absorption)
- **Star** : false
- **DYSBIOSE** : T1, priority 2 ; IR : T2, priority 18

#### 19. L_FLAX_SEEDS_GROUND
- **Nom** : Graines de lin moulues 10-20 g/jour
- **Catégorie** : ingredient
- **Tier** : T2
- **Réf** : Pan 2009 méta (PMID 19061773) ; Goyal 2014 (PMID 25050914)
- **Mécanisme** : Lignanes → entérolactone (métabolite microbien) ; ALA ω-3 ; fibres solubles + insolubles ; mucilage
- **Dose** : 10-20 g/j (1-2 c.s.) moulues (graines entières non digérées). À consommer rapidement après mouture (oxydation ALA)
- **CI** : Occlusion intestinale (en phase aiguë)
- **Précautions** : Moudre au dernier moment (oxydation rapide). Graines entières = passage non digéré
- **Star** : false
- **DYSBIOSE** : T2, priority 12 ; INFLAM : T2, priority 28 ; IR : T2, priority 30

#### 20. L_OATS_BETA_GLUCAN
- **Nom** : Avoine complète / β-glucane 3-5 g/j
- **Catégorie** : ingredient
- **Tier** : T1
- **Réf** : Ho 2016 méta (PMID 27702431) ; EFSA 2011 health claim (PS 246)
- **Mécanisme** : β-glucane → gel visqueux → ↓ absorption cholestérol + glucose ; fermentation colique → ↑ butyrate ; prébiotique sélectif Bifidobactéries
- **Dose** : 40-60 g flocons d'avoine complets (portion standard) = apport 3-4g β-glucane. Trempage overnight pour ↓ phytates
- **CI** : Cœliaque (avoine non contaminée tolérée par certains, pas certifiée sans gluten)
- **Précautions** : Choisir avoine complète (pas instantanée sucrée). Trempage 12h ↑ disponibilité minéraux
- **Star** : false
- **DYSBIOSE** : T1, priority 4 ; IR : T1, priority 10

#### 21. L_GREEN_BANANA_FLOUR
- **Nom** : Farine de banane verte / plantain vert cuit
- **Catégorie** : ingredient
- **Tier** : T2
- **Réf** : Cassani 2020 (PMID 33158077) ; Langkilde 2002 (PMID 11887404)
- **Mécanisme** : Amidon résistant type 2 encapsulé dans matrice cellulaire végétale → fermenté en butyrate colique ; ↓ index glycémique ; effet prébiotique
- **Dose** : 30-50 g/jour en substitution partielle farine (20-30% de farine de blé remplacée)
- **CI** : Aucune
- **Précautions** : Texture différente — remplacer partiellement, pas totalement
- **Star** : false
- **DYSBIOSE** : T2, priority 10 ; IR : T1, priority 16

#### 22. L_MISO_FERMENTED
- **Nom** : Miso (pâte de soja fermentée) 1 c.s./jour
- **Catégorie** : fermentation
- **Tier** : T3
- **Réf** : Nakanishi 2010 (PMID 21044902) ; Rios-Hoyo 2016 (PMID 27616673)
- **Mécanisme** : Fermentation longue → levure koji (Aspergillus oryzae), lactobacilles, peptides bioactifs, isoflavones aglycones (biodisponibles), ↑ NAD+ via niacine
- **Dose** : 1 c.s. (15-20g) non pasteurisé, dilué en fin de cuisson (ne pas bouillir pour préserver ferments)
- **CI** : Restriction sodée sévère (miso riche en sel). Rincer/dilué
- **Précautions** : Ne pas faire bouillir pour préserver flore vivante. Adapter si restriction sodée
- **Star** : false
- **DYSBIOSE** : T2, priority 15 ; INFLAM : T3, priority 35

#### 23. L_KIMCHI_SAUERKRAUT
- **Nom** : Légumes lactofermentés (choucroute crue, kimchi) 50-100 g/j
- **Catégorie** : fermentation
- **Tier** : T2
- **Réf** : Sun 2020 (PMID 32566240) ; Han 2020 (PMID 32108597)
- **Mécanisme** : Lactobacillus, Leuconostoc vivants + fibres prébiotiques + isothiocyanates. ↑ diversité + ↓ marqueurs inflammation
- **Dose** : 50-100 g/j. Choucroute crue non pasteurisée (rayon frais). Rincer rapidement si sensibilité sel
- **CI** : Histamine-intolerance sévère. Restriction sodée sévère
- **Précautions** : Bocal non pasteurisé (rayon frais). Pasteurisé = perte ferments vivants
- **Star** : false
- **DYSBIOSE** : T2, priority 8 ; INFLAM : T3, priority 30

#### 24. L_KEFIR_WATER_DAIRY
- **Nom** : Kéfir (lait ou eau) 150-200 ml/jour
- **Catégorie** : fermentation
- **Tier** : T2
- **Réf** : Kim 2018 méta (PMID 29721950) ; Bourrie 2016 (PMID 26898463)
- **Mécanisme** : Consortium levures + lactobacilles >30 souches ; ↑ Lactobacillus + souches kéfir spécifiques ; ↓ lactase persistence ; ↓ TNF-α
- **Dose** : 150-200 ml/j, varier lait (traditionnel) et eau (si intolérance lactose)
- **CI** : Immunosuppression sévère (kéfir cru non pasteurisé)
- **Précautions** : Kéfir du commerce souvent pasteurisé après fermentation = ferments tués. Vérifier "ferments vivants" ou faire maison
- **Star** : false
- **DYSBIOSE** : T1, priority 6 ; INFLAM : T2, priority 25

#### 25. L_COCONUT_YOGURT_PROBIOTIC
- **Nom** : Yaourt / laits fermentés probiotiques diversifiés
- **Catégorie** : fermentation
- **Tier** : T2
- **Réf** : Burton 2017 méta (PMID 28360887) ; Savaiano 2014 (PMID 25441466)
- **Mécanisme** : Souchés spécifiques (L. casei, L. rhamnosus, Bifidobacterium spp.) → ↑ diversité + ↓ perméabilité intestinale + effet immunomodulateur souche-dépendant
- **Dose** : 1 portion/j (150-200g), tourner entre 2-3 marques probiotiques différentes pour diversifier souches
- **CI** : Allergie lait (versions végétales). Immunosuppression sévère
- **Précautions** : Souche-dépendant — un probiotique n'est pas l'autre. Tourner les sources pour diversifier les souches. Attention sucres ajoutés
- **Star** : false
- **DYSBIOSE** : T2, priority 10 ; INFLAM : T3, priority 30

#### 26. L_APPLE_PECTIN
- **Nom** : Pomme entière + peau (pectine) 1-2/jour
- **Catégorie** : ingredient
- **Tier** : T2
- **Réf** : Koutsos 2015 (PMID 25750143) ; Hyson 2011 méta (PMID 22117945)
- **Mécanisme** : Pectine (fibre solubre fermentescible) → ↑ butyrate, ↓ LDL, régulation transit ; polyphénols de la peau (quercétine, catéchines)
- **Dose** : 1-2 pommes/j, non pelées. Varier couleurs : verte (Granny Smith = polyphénols plus élevés chlormequat...) ; rouge (anthocyanes)
- **CI** : Aucune
- **Précautions** : Jus = pas de pectine. Compote sans sucre ajouté OK si pomme entière impossible
- **Star** : false
- **DYSBIOSE** : T2, priority 15 ; IR : T2, priority 30

#### 27. L_DIVERSE_SALAD_RAW
- **Nom** : Salade crue diversifiée ≥5 espèces/jour
- **Catégorie** : preparation
- **Tier** : T2
- **Réf** : D'Cunha 2024 (PMID 38995160) ; Ludwig 2021 BMJ (PMID 34049938)
- **Mécanisme** : Enzymes végétales intactes (raw) + polyphénols non dénaturés + microbiote phytosphère ; signaux orosensoriels ↑ satiété précoce
- **Dose** : 1 salade/jour incluant ≥5 espèces végétales (légumes feuilles + légumes couleurs + herbes + oléagineux + vinaigrette EVOO)
- **CI** : MICI flare actif (fibres insolubres)
- **Précautions** : Pas de restriction en phase aiguë MICI. Introduction progressive si sensibilité FODMAP
- **Star** : false
- **DYSBIOSE** : T2, priority 16 ; INFLAM : T2, priority 20 ; IR : T2, priority 25

---

### Domaine transversal (≥2 bottlenecks)

#### 28. L_MEAL_TIMING_12H
- **Nom** : Fenêtre alimentaire ≤12h/jour (time-restricted eating)
- **Catégorie** : timing
- **Tier** : T1
- **Réf** : Sutton 2018 (PMID 30075275) — early TRE ; Wilkinson 2020 (PMID 31950749) ; Currenti 2021 méta (PMID 33996959)
- **Mécanisme** : Alignement rythmes circadiens → ↓ insuline, ↑ sensibilité insulinique, ↓ inflammation (NF-κB circadien), ↓ perméabilité intestinale nocturne
- **Dose** : Fenêtre alimentaire ≤12h (ex : 8h-20h). Ne pas manger après le dîner. 12-14h de jeûne nocturne
- **CI** : Grossesse, T1DM non supervisé, trouble du comportement alimentaire, dénutrition
- **Précautions** : Pas de saut de petit-déjeuner — décaler le dîner plus tôt si nécessaire. Adapter à glycémies nocturnes si T2D sous insuline/sulfamides
- **Star** : true
- **IR** : T1, priority 2 ; INFLAM : T2, priority 10 ; DYSBIOSE : T2, priority 15

#### 29. L_SLOW_EATING
- **Nom** : Alimentation consciente — repas ≥20 min, mastication complète
- **Catégorie** : timing
- **Tier** : T2
- **Réf** : Ohkuma 2015 méta (PMID 26255023) ; Zhu 2018 (PMID 29358516)
- **Mécanisme** : ↑ signal orexigène précoce (GLP-1, PYY) via mastication prolongée → ↓ apport calorique 10-15% ; ↓ pic glucose ; ↑ diversité microbiote via ↑ temps transit oral
- **Dose** : Repas ≥20 min, mastiquer ≥20×/bouchée. Pas d'écran pendant repas
- **CI** : Troubles de la déglutition
- **Précautions** : Difficile en pratique quotidienne — viser progrès progressif
- **Star** : false
- **IR** : T2, priority 5 ; INFLAM : T3, priority 50 ; DYSBIOSE : T2, priority 20

#### 30. L_HYDRATION_OPTIMAL
- **Nom** : Hydratation 30 ml/kg/jour, eau prioritaire
- **Catégorie** : dose
- **Tier** : T2
- **Réf** : Perrier 2013 (PMID 24056810) ; Armstrong 2012 (PMID 22732610)
- **Mécanisme** : Hydratation cellulaire → fonction endothéliale, tonus vagal, fonction digestive, concentration urinaire (prévention lithiase)
- **Dose** : 30 ml/kg/jour (≈2.1 L pour 70 kg). Dont ≥70% eau plate. Boire régulièrement, éviter >1L d'un coup
- **CI** : Insuffisance cardiaque décompensée, insuffisance rénale sévère (oligurique)
- **Précautions** : Adapter à activité physique, climat, sudation
- **Star** : false
- **IR** : T2, priority 22 ; DYSBIOSE : T2, priority 22 ; INFLAM : T3, priority 40

#### 31. L_MUSHROOMS_WEEKLY
- **Nom** : Champignons variés 200-300g/sem (shiitake, pleurote, champignon de Paris)
- **Catégorie** : ingredient
- **Tier** : T3
- **Réf** : Jayachandran 2017 (PMID 28879373) ; Chandra 2021 (PMID 34501880)
- **Mécanisme** : β-glucanes (lentinan, grifolan) → immunomodulation ; ergostérol → vit D2 (si expo UV) ; choline, sélénium, antioxydants (ergothionéine)
- **Dose** : 200-300g/sem, varier 3+ espèces. Shiitque, pleurote, maitake, champignon de Paris
- **CI** : Aucune en dose culinaire. Goutte : éviter fortes doses (purines modérées)
- **Précautions** : Cuisson nécessaire (chitine). Champignons sauvages = identification impérative
- **Star** : false
- **INFLAM** : T2, priority 25 ; DYSBIOSE : T3, priority 30 ; IR : T3, priority 50

#### 32. L_SEAWEED_WEEKLY
- **Nom** : Algues marines 5-15g/sem (wakame, kombu, nori, spiruline)
- **Catégorie** : ingredient
- **Tier** : T3
- **Réf** : Brown 2014 (PMID 24724429) ; Teas 2013 (PMID 23038989)
- **Mécanisme** : Iode, fucoxanthine, fucoïdane → antioxydant, anti-inflammatoire, prébiotique (polysaccharides sulfatés fermentés par Bacteroides)
- **Dose** : 5-15g/sem (1-2 feuilles nori, 1 bande kombu dans cuisson). Ne pas dépasser car excès iode problématique
- **CI** : Hyperthyroïdie non contrôlée. Pathologie thyroïdienne auto-immune (modérer)
- **Précautions** : Teneur iode variable selon espèce et origine. Introduction progressive. Pas pour usage quotidien
- **Star** : false
- **DYSBIOSE** : T2, priority 22 ; INFLAM : T3, priority 35

#### 33. L_CITRUS_POLYPHENOLS
- **Nom** : Agrumes entiers (pamplemousse, orange, citron) — zeste + pulpe
- **Catégorie** : ingredient
- **Tier** : T2
- **Réf** : Mulvihill 2016 (PMID 27431609) ; Tholstrup 2018 (PMID 29470077)
- **Mécanisme** : Hespéridine, naringénine, acide ascorbique → ↓ CRP, ↓ LDL-ox, ↑ NO, modulation microbiote, ↑ fer non-héminique (vit C)
- **Dose** : 1 agrumes/j varié : zeste râpé + quartiers. Jus frais sans sucre (pulpe si possible)
- **CI** : Pamplemousse + statines/Ca-antagonistes/anticoagulants (interaction CYP3A4). Limiter pamplemousse si traitement
- **Précautions** : Zeste bien lavé (pesticides). Pamplemousse : interaction médicamenteuse documentée (CYP3A4). Préférer orange/citron si doute
- **Star** : false
- **INFLAM** : T2, priority 20 ; IR : T2, priority 30 ; DYSBIOSE : T3, priority 35

#### 34. L_SATURATED_FAT_SWAP
- **Nom** : Substitution graisses saturées → insaturées (lait, viande, cuisson)
- **Catégorie** : avoidance
- **Tier** : T1
- **Réf** : Wang 2016 méta (PMID 27508875) ; Guasch-Ferré 2015 (PMID 26041611)
- **Mécanisme** : Remplacer lipides saturés (beurre, graisse animale, huile de palme) par insaturés (EVOO, huile de colza, avocat). ↓ LDL, ↓ ratio ApoB/ApoA
- **Dose** : Cuisson à l'huile d'olive ou colza ; beurre remplacé par purée d'oléagineux, avocat ou EVOO. Viande rouge avec gras retiré
- **CI** : Aucune
- **Précautions** : Ne pas confondre substitution (réduire saturés ET augmenter insaturés) avec réduction globale du gras
- **Star** : false
- **IR** : T1, priority 14 ; INFLAM : T1, priority 16

#### 35. L_EVOO_CRU_FINITION
- **Nom** : Huile d'olive extra vierge en finition crue (préserve polyphénols)
- **Catégorie** : cooking
- **Tier** : T2
- **Réf** : Cicerale 2010 (PMID 20122463) ; Lozano-Castellón 2020 (PMID 32150897)
- **Mécanisme** : Polyphénols EVOO (oléocanthal, hydroxytyrosol) thermosensibles. Ajout en finition préserve >90% des polyphénols vs perte >50% à cuisson 180°C
- **Dose** : Ajouter EVOO cru après cuisson (filet sur plat chaud). Réserver 1/3 de l'EVOO quotidien pour la finition
- **CI** : Aucune
- **Précautions** : Extension du L_EVOO_PRIMARY — technique de préparation plus que levier distinct. Inclure comme modificateur
- **Star** : false
- **IR** : T1, priority 8 ; INFLAM : T1, priority 8

---

## Répartition

| Catégorie | Nb | Leviers |
|-----------|----|---------|
| ingredient | 13 | 1,2,3,4,5,6,11,12,13,14,15,17,26,31,32,33 |
| preparation | 2 | 8,27 |
| timing | 3 | 7,28,29 |
| cooking | 1 | 35 |
| fermentation | 4 | 22,23,24,25 |
| avoidance | 1 | 34 |
| dose | 1 | 30 |

| Bottleneck | Nouveaux leviers T1 | Nouveaux leviers T2 | Nouveaux leviers T3 |
|-----------|-------------------|-------------------|-------------------|
| **IR** | 11 (5,8,13,17,20,28,34,35,18,1,2) | 9 (3,4,6,7,11,12,14,21,26,29,30,33) | 2 (10,31) |
| **INFLAM** | 3 (5,16,17,34,35) | 11 (3,4,6,9,10,11,12,13,14,19,24,27,28,33) | 7 (15,22,23,29,31,32) |
| **DYSBIOSE** | 3 (18,20,24) | 12 (5,13,19,21,23,25,26,27,28,32,33,22) | 6 (9,10,14,15,29,31) |

---

## Prochaine étape

Ce catalogue est la base pour **LIV-48** : génération des 35 seeds SQL complets (INSERT INTO culinary_levers + lever_bottleneck_map + bioavailability_synergies si applicable).
