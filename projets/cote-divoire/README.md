# 🇨🇮 Projet Côte d'Ivoire — Histoire & Culture

Chaîne de **Shorts verticaux (9:16)** en français sur l'histoire et la culture
de la Côte d'Ivoire, générés automatiquement avec MoneyPrinterTurbo :
script (Gemini) → séquences vidéo (Pexels) → voix off française (Edge TTS,
gratuit) → sous-titres → musique → MP4 final.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `config.projet.toml` | Config prête à copier en `config.toml` à la racine |
| `prompt-systeme.txt` | Prompt système « griot moderne » (source de vérité) |
| `sujets-histoire-culture.jsonl` | Les 20 premiers sujets de la chaîne, avec mots-clés Pexels |
| `generer.sh` | Génère 1 vidéo : `./generer.sh "sujet"` |
| `generer-batch.sh` | Génère les 20 vidéos du manifeste en série |
| `generer-images.py` | Génère des images 9:16 avec Gemini pour les sujets sans stock vidéo |

## Mise en route (une seule fois)

### 1. Prérequis

- **Python 3.11+** et **[uv](https://docs.astral.sh/uv/)** :
  ```bash
  # macOS / Linux
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```
  ```powershell
  # Windows (PowerShell)
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
- **ImageMagick** et **FFmpeg** — sous Windows, installe-les depuis
  [imagemagick.org](https://imagemagick.org/script/download.php#windows) et
  [ffmpeg.org](https://ffmpeg.org/download.html) ; sous macOS
  `brew install imagemagick ffmpeg` ; sous Linux via ton gestionnaire de
  paquets.

### 2. Clés API (les deux sont gratuites)

| Service | Sert à | Où créer la clé |
|---|---|---|
| **Gemini** | Écrire les scripts | https://aistudio.google.com/app/apikey |
| **Pexels** | Trouver les séquences vidéo | https://www.pexels.com/api/ |

### 3. Installation

```bash
git clone https://github.com/gui7-BOT/videoYoutube.git
cd videoYoutube
uv sync                                        # installe les dépendances
cp projets/cote-divoire/config.projet.toml config.toml
# → ouvre config.toml et colle tes 2 clés (placeholders COLLE_TA_CLE_*)
```

> ⚠️ `config.toml` contient tes clés : il est dans `.gitignore`, ne le
> commite jamais.

## Utilisation

### Option A — Interface web (recommandé pour débuter)

```bash
./webui.sh        # Windows : webui.bat
```

Ouvre http://localhost:8501 : l'interface est **en français** et arrive
**préréglée** par la config (voix `fr-FR-HenriNeural`, format 9:16,
sous-titres Be Vietnam Pro, prompt système Côte d'Ivoire déjà chargé).
Tu tapes un sujet, tu cliques sur Générer, tu récupères le MP4.

### Option B — Une vidéo en ligne de commande

```bash
./projets/cote-divoire/generer.sh "La légende de la reine Abla Pokou"
# avec mots-clés Pexels imposés (en anglais, meilleurs résultats) :
./projets/cote-divoire/generer.sh "Le Zaouli" "african mask dance,ivory coast,drums"
```

### Option C — Les 20 premières vidéos d'un coup

```bash
# 1. D'abord, valider les scripts seuls (rapide, ne consomme rien chez Pexels)
STOP_AT=script ./projets/cote-divoire/generer-batch.sh

# 2. Puis générer les vidéos complètes (compte ~2-5 min par vidéo)
./projets/cote-divoire/generer-batch.sh
```

Les vidéos finales sont dans `storage/tasks/<id>/final-1.mp4`, une par sujet,
avec le script (`script.json`), l'audio et les sous-titres à côté.

### Option D — Images générées avec Gemini (sujets sans stock vidéo)

Pour les sujets impossibles à couvrir en stock (Abla Pokou, l'indépendance
de 1960, le Zaouli…), génère des visuels verticaux avec la même clé Gemini
que les scripts, puis monte-les directement :

```bash
# 1. Génère 5 images 9:16 (≈ 0,04 $ / image, modèle gemini-2.5-flash-image)
python3 projets/cote-divoire/generer-images.py "La reine Abla Pokou, marche légendaire du peuple baoulé" -n 5

# 2. Monte la vidéo avec ces images (zoom automatique sur chaque image,
#    ordre alphabétique, voix off + sous-titres comme d'habitude)
IMAGES="projets/cote-divoire/images/la-reine-abla-pokou-marche-legendaire-du-peuple-baoule" \
    ./projets/cote-divoire/generer.sh "La légende de la reine Abla Pokou"
```

À savoir :

- `IMAGES=` accepte un dossier (png/jpg/jpeg/bmp + clips mp4/mov/mkv/webm)
  ou une liste `chemin1,chemin2` ; tu peux donc mélanger images Gemini et
  vrais clips.
- Le style par défaut est « photo documentaire cinématographique, sans
  texte » ; pour une légende ancienne, passe par exemple
  `--style "Peinture numérique cinématographique, style griot, couleurs chaudes, aucun texte"`.
- `--dry-run` montre la requête exacte sans rien consommer, et
  `DRY_RUN=1 ./generer.sh …` montre la commande de montage sans la lancer.
- Relance le script sur le même sujet pour **ajouter** des images (la
  numérotation continue, rien n'est écrasé).

## Éditer la chaîne

- **Ajouter des sujets** : une ligne JSON par vidéo dans
  `sujets-histoire-culture.jsonl` — `video_subject` en français,
  `video_terms` = 4-5 mots-clés Pexels **en anglais**, du plus spécifique au
  plus générique. Chaque ligne peut aussi surcharger n'importe quel réglage
  (voix, format…).
- **Changer le ton** : édite `prompt-systeme.txt`, puis recopie le texte dans
  `custom_system_prompt` de ton `config.toml` pour que la WebUI suive aussi.
- **Changer de voix** : liste complète dans `docs/voice-list.txt`
  (cherche `fr-`) ; il y a aussi des voix belges, suisses et canadiennes.

## Limite connue (et comment vivre avec)

Pexels a peu de séquences tournées **en** Côte d'Ivoire : les mots-clés du
manifeste visent donc de l'Afrique de l'Ouest crédible (marchés, masques,
forêt, cacao, ville…). Pour les sujets très visuels (basilique de
Yamoussoukro, Zaouli), pense à :

- affiner les `video_terms` ligne par ligne quand un rendu déçoit ;
- générer les visuels avec Gemini (Option D ci-dessus) ;
- ou déposer tes propres clips libres de droits via `IMAGES="dossier"` /
  `--video-source local --video-materials "chemin1,chemin2"`.

## Les 20 premiers épisodes

1. La reine Abla Pokou et la naissance du peuple Baoulé
2. Félix Houphouët-Boigny, père de l'indépendance
3. Pourquoi « Côte d'Ivoire » ? L'histoire du nom
4. La basilique de Yamoussoukro, plus grande église du monde
5. Le Zaouli, la danse « impossible à filmer »
6. Grand-Bassam, première capitale (UNESCO)
7. Le cacao : premier producteur mondial
8. Abidjan, du village Ébrié au « Manhattan d'Afrique de l'Ouest »
9. L'attiéké (UNESCO)
10. Les Sénoufo et l'initiation du Poro
11. Le 7 août 1960, l'indépendance
12. Les griots, gardiens de la mémoire
13. Les masques Dan
14. Le pagne Kita des Akan
15. Le zouglou, né dans les cités d'Abidjan
16. Le parc national de Taï
17. Les poids à peser l'or des Akan
18. Samory Touré, le résistant
19. Le garba, roi de la street food
20. Drogba et la paix de 2007
