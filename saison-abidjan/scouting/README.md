# Outil de scouting

Suit les contacts, génère les messages personnalisés, signale les relances,
surveille l'avancement par rapport à l'objectif.

**Aucune dépendance, aucune connexion réseau.** Python 3 standard suffit.

## Ce que l'outil ne fait pas

Il ne cherche rien sur Instagram et ne s'y connecte pas.

Le repérage des profils se fait à la main, dans l'application, comme n'importe quel
photographe. C'est sans risque et ça prend deux heures pour une quarantaine de profils.
L'automatiser exposerait le compte à une restriction, pour un gain marginal.

L'outil prend le relais après : qualifier, personnaliser, suivre, relancer.
C'est là qu'est le vrai travail, et c'est là qu'on perd des contacts.

## Usage

```bash
python scouting.py seed              # pré-remplit les 29 cibles identifiées
python scouting.py stats             # tableau de bord
python scouting.py list -t createur  # liste filtrée par type

python scouting.py msg "Calvin Gueyes"      # génère le message à copier
python scouting.py sent "Calvin Gueyes"     # marque contacté (date du jour)
python scouting.py set "Calvin Gueyes" confirme

python scouting.py relances          # qui relancer aujourd'hui
python scouting.py export            # régénère tracker.md
```

Ajouter un contact trouvé en scoutant :

```bash
python scouting.py add @pseudo -t modele -s "taguée chez @nuits_balneaires" -r collab
```

## Types et statuts

**Types :** `createur` · `photographe` · `mua` · `modele` · `agence`

**Statuts :** `a_qualifier` → `contacte` → `en_discussion` → `confirme` / `non`

## Ce que l'outil surveille pour toi

- **Les relances.** Un contact passé en `contacte` depuis 7 jours remonte
  automatiquement dans `relances`. Une seule relance par personne, jamais deux.
- **Le seuil d'alerte du 4 octobre.** Moins de 3 modèles confirmées à cette date
  et `stats` affiche l'alerte : bascule sur les agences pour sécuriser les shoots payés.
- **Le compte à rebours** avant le départ du 19 octobre.

## Fichiers

| Fichier | Rôle |
|---|---|
| `scouting.py` | L'outil |
| `contacts.json` | Les données. C'est le fichier qui compte, sauvegarde-le |
| `tracker.md` | Vue lisible, régénérée par `export`. Ne pas éditer à la main |
